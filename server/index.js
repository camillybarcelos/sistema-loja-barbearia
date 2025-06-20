import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './database/connection.js';
import * as Models from './database/models.js';

// Carregar variáveis de ambiente do arquivo .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

// Middleware
const allowedOrigins = [
  'https://sistema-loja-barbearia-frontend.vercel.app', // URL do seu frontend
  'http://localhost:5173', // Para desenvolvimento local
  'http://localhost:3000'  // Outra porta comum de desenvolvimento
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: apps mobile, Postman) ou da lista de permitidos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Iniciar servidor
async function startServer() {
  try {
    // Conectar ao MongoDB
    await connectToDatabase();
    console.log('[LOG] Conexão com o MongoDB estabelecida com sucesso.');
    
    // Criar usuário admin padrão se não existir
    const adminExists = await Models.User.findOne({ email: 'admin@admin.com' });
    console.log(`[LOG] Verificando se admin existe: ${adminExists ? 'Sim' : 'Não'}`);

    if (!adminExists) {
      console.log('[LOG] Admin não encontrado, criando novo usuário admin...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      await Models.User.create({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('Usuário admin criado com sucesso!');
    }

    // Iniciar o servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Rotas
app.post('/api/login', async (req, res) => {
  console.log('[LOG] Rota /api/login chamada.');
  try {
    const { email, password } = req.body;
    console.log(`[LOG] Tentativa de login para o email: ${email}`);

    const user = await Models.User.findOne({ email });
    if (!user) {
      console.log('[LOG] Usuário não encontrado no banco de dados.');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    console.log('[LOG] Usuário encontrado no banco de dados.');

    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`[LOG] Comparação de senha válida: ${validPassword}`);

    if (!validPassword) {
      console.log('[LOG] Senha inválida.');
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de Cadastro de Usuário
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validar inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // 2. Verificar se o usuário já existe
    const existingUser = await Models.User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    // 3. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Criar o novo usuário (com role 'user' por padrão)
    const newUser = await Models.User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Por padrão, novos usuários são 'user'
      status: 'active'
    });

    console.log(`[LOG] Novo usuário cadastrado: ${newUser.email}`);

    // 5. Retornar sucesso (sem retornar a senha)
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao tentar cadastrar.' });
  }
});

// Rotas de Produtos
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Models.Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const newProduct = new Models.Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const updatedProduct = await Models.Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await Models.Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// Iniciar o servidor
startServer(); 