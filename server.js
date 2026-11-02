import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import db from './config/db.js';
import { rateLimit } from 'express-rate-limit'
import {verificarJWT} from './verificarJWT.js'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', 1);

const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15mnt
  limit: 10, // 10 req a cada 15mnt
  handler: (_, res) => {
    res.status(429).json({ success: false, message: 'Muitas requisições. Tente novamente mais tarde.' });
  }
})

app.get('/verificar-token', verificarJWT, (req, res) => {
    res.status(200).json({ success: true, message: 'Token válido!' });
});

app.post('/api/login', rateLimiter, async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  try {
    const query = 'SELECT * FROM Admins WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const admin = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: admin.id_admin, email: admin.email, nome: admin.nome },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Login realizado com sucesso!',
      token,
      admin: { id: admin.id_admin, nome: admin.nome, email: admin.email }
    });

  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
});

app.post('/api/cadastrar', verificarJWT , rateLimiter, async (req, res) => {
  const {nome, email, senha} = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  try {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const query = `
    INSERT INTO admins (nome, email, senha)
    VALUES($1, $2, $3)
    `
    await db.query(query, [
      nome,
      email,
      senhaHash 
    ]);

    res.status(201).json({ success: true, message: "Admin adicionado!" });

  } catch(err) {
    console.error("Erro:" + err);

    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Este e-mail já está em uso.' });
    }

    res.status(500).json({ success: false, message: "Erro ao cadastrar admin!" });
  }
})

app.get('/api/getAdmin', verificarJWT, async (req, res) => {
  try {
    const dbRes = await db.query('SELECT id_admin, nome, email FROM admins ORDER BY id_admin');
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum admin encontrado.' });
    }
    res.json(dbRes.rows); 
  } catch(error) {
    console.error('Erro ao buscar admins: ', error);
    res.status(500).json({ error: 'Erro ao buscar admins.' });
  }
})

app.put('/api/atualizarAdmin/:id', verificarJWT, async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  if (campo !== 'nome' && campo !== 'email') {
      return res.status(400).json({ error: 'Campo inválido.' });
  }

  try {
    const query = `UPDATE admins SET ${campo} = $1 WHERE id_admin = $2`;
    await db.query(query, [valor, id]);
    
    res.json({ success: true, message: 'Administrador atualizado!' });
  } catch(error) {
    console.error('Erro ao atualizar admin:', error);
    
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar admin.' });
  }
});

app.put('/api/atualizarSenhaAdmin/:id', verificarJWT, async (req, res) => {
  const { id } = req.params;
  const { novaSenha } = req.body;

  if (!novaSenha) {
      return res.status(400).json({ error: 'Preencha o campo senha!' });
  }

  try {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await db.query('UPDATE admins SET senha = $1 WHERE id_admin = $2', [senhaHash, id]);
    
    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch(error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
});

app.delete('/api/excluirAdmin/:id', verificarJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const dbRes = await db.query('DELETE FROM admins WHERE id_admin = $1', [id]);
    
    if (dbRes.rowCount === 0) {
        return res.status(404).json({ error: 'Administrador não encontrado.' });
    }
    
    res.json({ success: true, message: 'Administrador excluído com sucesso!' });
  } catch(error) {
    console.error('Erro ao excluir admin:', error);
    res.status(500).json({ error: 'Erro ao excluir administrador.' });
  }
});

app.get('/empresas', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT * FROM empresas ORDER BY id ASC');
    res.json(dbRes.rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

app.get('/paginas', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT * FROM paginas_carrossel ORDER BY id ASC');
    res.json(dbRes.rows);
  } catch (error) {
    console.error('Erro ao buscar páginas:', error);
    res.status(500).json({ error: 'Erro ao buscar páginas.' });
  }
});

app.get('/produtos', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, 
        e.nome AS nome_empresa, 
        pc.nome_pagina AS nome_pagina_carrossel
      FROM produtos p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN paginas_carrossel pc ON p.pagina_carrossel_id = pc.id
      ORDER BY p.data_upload DESC;
    `;
    const dbRes = await db.query(query);
    res.json(dbRes.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar os produtos.' });
  }
});


app.post('/produtos', verificarJWT, upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, descricao, empresa_id, exibir_no_carrossel, pagina_carrossel_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    if (!empresa_id) return res.status(400).json({ error: 'A tag da empresa é obrigatória.' });

    const uploadStream = () => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'produtos_catalogo' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });

    const cloudRes = await uploadStream();

    const vaiParaCarrossel = exibir_no_carrossel === 'true';
    const idPagina = (vaiParaCarrossel && pagina_carrossel_id) ? pagina_carrossel_id : null;

    const dbQuery = `
      INSERT INTO produtos 
      (titulo, descricao, nome_arquivo, drive_file_id, link_visualizacao, empresa_id, exibir_no_carrossel, pagina_carrossel_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;
    
    const dbRes = await db.query(dbQuery, [
      titulo, 
      descricao, 
      file.originalname, 
      cloudRes.public_id, 
      cloudRes.secure_url, 
      empresa_id, 
      vaiParaCarrossel, 
      idPagina
    ]);

    res.status(201).json({ success: true, produto: dbRes.rows[0] });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno ao guardar o produto.' });
  }
});

app.put('/produtos/:id', verificarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, empresa_id, exibir_no_carrossel, pagina_carrossel_id } = req.body;

    const vaiParaCarrossel = exibir_no_carrossel === 'true' || exibir_no_carrossel === true;
    const idPagina = (vaiParaCarrossel && pagina_carrossel_id) ? pagina_carrossel_id : null;

    const dbQuery = `
      UPDATE produtos 
      SET titulo = $1, descricao = $2, empresa_id = $3, exibir_no_carrossel = $4, pagina_carrossel_id = $5
      WHERE id = $6
      RETURNING *;
    `;
    
    const dbRes = await db.query(dbQuery, [titulo, descricao, empresa_id, vaiParaCarrossel, idPagina, id]);

    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json({ success: true, produto: dbRes.rows[0] });
  } catch (error) {
    console.error('Erro ao editar produto:', error);
    res.status(500).json({ error: 'Erro interno ao editar o produto.' });
  }
});

app.delete('/produtos/:id', verificarJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT drive_file_id FROM produtos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const publicId = result.rows[0].drive_file_id;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await db.query('DELETE FROM produtos WHERE id = $1', [id]);

    res.json({ success: true, message: 'Produto excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro interno ao excluir o produto.' });
  }
});


app.get('/getProdutosBeFarm', async (req, res) => {
  try{
    const query = await db.query('SELECT titulo, descricao, link_visualizacao FROM produtos WHERE exibir_no_carrossel = true AND pagina_carrossel_id = 2');

    if(query.rows.length === 0) {
      return res.status(400).json({error: 'Não possui nenhum produto permitido para aparecer no carrossel!'});
    }

    res.json(query.rows ,{success: true, message: 'Produto(s) encontrado(s)'});
  } catch(err){
    console.error('Erro', err);
    res.status(500).json({error: 'Erro interno ao carregar os produtos!', err})
  }
}) 

app.listen(process.env.PORT || 3000, console.log(`Servidor ligado`));