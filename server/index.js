const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./database/connection');
const Models = require('./database/models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt';

// Middleware básico
app.use(express.json());

// CORS seguro para produção
const corsOptions = {
  origin: [
    'https://sistema-loja-barbearia-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
};
app.use(cors(corsOptions));

/* Configuração anterior:
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sistema-loja-barbearia-frontend.vercel.app',
    'https://sistema-loja-barbearia.vercel.app'
  ],
  credentials: true
}));
*/

// Inicia o servidor e conecta ao banco de dados
async function startServer() {
  try {
    await connectToDatabase();
    console.log('Conexão com o MongoDB estabelecida com sucesso.');

    // Criar usuário admin padrão se não existir
    const adminExists = await Models.User.findOne({ email: 'admin@admin.com' });
    if (!adminExists) {
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

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Rota de Registro
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const existingUser = await Models.User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Models.User({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Adiciona role padrão
      status: 'active'
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Models.User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    
    // Retorna o objeto de usuário completo e o token
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota raiz para teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor backend funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

startServer();

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('[ERRO CRÍTICO] Exceção não capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERRO CRÍTICO] Promise rejeitada não tratada:', reason);
}); 