import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './config/db.js';
import multer from 'multer';
import { google } from 'googleapis';
import stream from 'stream';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });
const PASTA_DRIVE_ID = '1-ccbXtZr-huMEulbnk1crB6KdrTVt6iA';

app.post('/api/login', async (req, res) => {
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

    if (admin.nome.toLowerCase() !== nome.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Nome de usuário incorreto.' });
    }

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

export function verificarJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    }
    
    req.admin = decoded;
    next();
  });
}

app.listen(process.env.PORT || 3000, console.log(`Servidor ligado`));