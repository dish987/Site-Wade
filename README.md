# 📦 Sistema de Catálogo Dinâmico e Dashboard Administrativo

> **Projeto Final de Semestre** - Sistema web full-stack desenvolvido para gerenciamento dinâmico de produtos, catálogos e administradores, com suporte a upload de imagens e renderização condicional em carrosséis interativos.

## Sobre o Projeto

O projeto consiste em uma plataforma dividida em duas partes principais:
1. **Frontend Público:** Apresenta os produtos através de catálogos e carrosséis interativos separados por empresas do grupo (ex: BeFarm e BlueSafe).
2. **Dashboard Administrativo:** Um painel restrito e seguro (via autenticação JWT) onde gestores podem fazer o CRUD (Criar, Ler, Atualizar e Deletar) de produtos, definir em quais páginas eles aparecem, e gerenciar acessos de outros administradores.

## Funcionalidades Principais

- **Autenticação e Autorização:** Sistema de login seguro utilizando JSON Web Tokens (JWT). Rotas protegidas no frontend e backend.
- **Gestão de Produtos (CRUD):** Cadastro completo de produtos incluindo título, descrição, associação de empresa e definição de visibilidade no carrossel.
- **Upload de Arquivos:** Integração em nuvem para armazenamento de imagens dos produtos, retornando links diretos (`link_visualizacao`) para consumo otimizado na web.
- **Gestão de Administradores:** Painel para o administrador master ou gestores criarem novas contas, alterarem senhas e removerem usuários do sistema.
- **Interface Dinâmica (Vanilla JS):** O frontend consome os dados da API de forma assíncrona, atualizando a interface (DOM) em tempo real sem necessidade de recarregar a página.

---

## Tecnologias Utilizadas

### Frontend
- **HTML5 & CSS3:** Layout responsivo com CSS Flexbox/Grid e design moderno (degradês, modais, toasts de erro).
- **JavaScript:** Código modularizado (`dashboard.js`, `popUpErro.js`), uso de `Fetch API` para requisições HTTP e manipulação da DOM.

### Backend
- **Node.js & Express:** Servidor RESTful para gerenciar as requisições da aplicação.
- **JWT (JSON Web Token):** Middleware de segurança para validar tokens de acesso nas rotas restritas.
- **Bcrypt:** Criptografia irreversível (hashing) para proteção das senhas dos administradores no banco de dados.
- **Express-Rate-Limit:** Middleware de segurança que limita o número de requisições por IP, prevenindo ataques de força bruta e DDoS.
- **CORS:** Configurado para permitir a comunicação segura entre o frontend e a API.

### Banco de Dados & Infraestrutura
- **PostgreSQL:** Banco de dados relacional que garante a integridade dos dados e relacionamentos.
- **Cloudinary:** Serviço de CDN em nuvem utilizado para o armazenamento otimizado e entrega rápida das imagens dos produtos, aliviando o servidor principal.

---

## Segurança e Escalabilidade

A arquitetura foi pensada para ser resiliente e pronta para produção, abordando problemas clássicos de aplicações web:

- **Cloudinary:** Delegamos o peso do armazenamento das imagens para uma CDN (Content Delivery Network) externa. Isso evita a perda de arquivos em caso de reinicialização do servidor, mantém o banco de dados leve (armazenando apenas a URL da imagem) e entrega os arquivos de forma otimizada para o frontend.
- **Express-Rate-Limit:** Para proteger o sistema de tentativas de invasão, implementamos limitação de requisições por IP. Isso impede que bots disparem milhares de requisições na rota de login tentando adivinhar senhas ou derrubar a API.
- **Bcrypt:** Nenhuma senha é armazenada em texto puro. O sistema aplica um *hashing unidirecional com salt*, garantindo que, mesmo em caso de vazamento do banco de dados, as credenciais permaneçam seguras e irrecuperáveis, mitigando ataques de *Rainbow Tables*.

---

## Arquitetura do Backend

O backend foi estruturado seguindo os princípios de uma **API RESTful**, garantindo baixo acoplamento e alta coesão.

### Fluxo de Requisição (Request Flow)
1. **Client (Navegador):** Dispara uma requisição (ex: `POST /produtos`) enviando dados e o token JWT no header (`Authorization: Bearer <token>`).
2. **Middleware de Autenticação:** Intercepta a rota, valida a assinatura e a expiração do JWT. Se inválido, retorna status `401 Unauthorized`.
3. **Controller:** Se autorizado, o controller processa a requisição, trata o upload da imagem (se houver), estrutura os dados e chama o banco de dados.
4. **Model / Banco de Dados (PostgreSQL):** Executa a query SQL de `INSERT`, `UPDATE`, `DELETE` ou `SELECT`, respeitando as *Foreign Keys*.
5. **Response:** O servidor retorna uma resposta JSON em caso de sucesso (`200/201`) ou o tratamento de erro mapeado (`400/500`).

### Modelagem do Banco de Dados (MER)
O banco foi desenhado para ser relacional e normalizado. Estrutura das principais tabelas:

- **`admins`**: Armazena as credenciais (ID, Nome, Email único e Senha criptografada).
- **`empresas`**: Tabela de domínio contendo os setores (ex: BeFarm, BlueSafe).
- **`paginas_carrossel`**: Tabela de domínio referenciando as páginas onde os produtos podem ser exibidos.
- **`produtos`**: Entidade central. Possui FK (*Foreign Keys*) apontando para `empresas` e `paginas_carrossel`, além de armazenar as strings das imagens hospedadas na nuvem.
