const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(express.json());

// ATENÇÃO: Configuração de CORS aberta para fins de diagnóstico.
// Isso permite requisições de QUALQUER origem.
console.log('[DIAGNÓSTICO] Habilitando CORS para todas as origens.');
app.use(cors());

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

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('[TESTE] Rota /api/test foi chamada');
  res.json({ 
    message: 'Servidor funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Rota de teste para cadastro
app.post('/api/register', (req, res) => {
  console.log('[TESTE] Rota /api/register foi chamada');
  console.log('[TESTE] Dados recebidos:', req.body);
  
  res.json({ 
    message: 'Cadastro recebido com sucesso!', 
    user: req.body,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Rota de teste para login
app.post('/api/login', (req, res) => {
  console.log('[TESTE] Rota /api/login foi chamada');
  console.log('[TESTE] Dados recebidos:', req.body);
  
  res.json({ 
    message: 'Login recebido com sucesso!', 
    user: req.body,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Rota raiz para teste
app.get('/', (req, res) => {
  console.log('[TESTE] Rota raiz foi chamada');
  res.json({ 
    message: 'Servidor backend de teste funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[TESTE] Servidor de teste iniciado na porta ${PORT}`);
  console.log(`[TESTE] Servidor está online e pronto para receber requisições`);
  console.log(`[TESTE] Acesse: http://localhost:${PORT}`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('[ERRO CRÍTICO] Exceção não capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERRO CRÍTICO] Promise rejeitada não tratada:', reason);
}); 