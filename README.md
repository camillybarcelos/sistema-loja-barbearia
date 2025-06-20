# 🏪 Sistema Integrado Loja de Roupas e Barbearia

Sistema completo de gestão para lojas de roupas e barbearias, com controle de vendas, estoque, agendamentos, caixa e relatórios.

## ✨ Funcionalidades

### 🛍️ Ponto de Venda (PDV)
- Vendas de produtos e serviços
- Múltiplas formas de pagamento (Dinheiro, Cartão, PIX, Fiado)
- Controle de estoque automático
- Impressão de comprovantes
- Integração com agendamentos

### 💰 Controle de Caixa
- Abertura e fechamento de caixa
- Controle de retiradas e vales
- Relatórios de movimentação
- Trava de segurança no PDV

### 📅 Agendamentos
- Agendamento de serviços
- Controle de horários dos barbeiros
- Status de agendamentos
- Integração com vendas

### 📦 Gestão de Produtos
- Cadastro de produtos
- Controle de estoque
- Códigos de barras
- Categorização

### 👥 Gestão de Clientes
- Cadastro de clientes
- Histórico de compras
- Controle de fiado
- Sistema de fidelidade

### 📊 Relatórios
- Vendas por período
- Produtos mais vendidos
- Relatórios financeiros
- Análise de performance

### 🔧 Configurações
- Gestão de barbeiros
- Configurações do sistema
- Backup automático
- Segurança

## 🚀 Deploy Rápido

### Opção 1: Vercel (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/sistema-loja-barbearia.git
cd sistema-loja-barbearia
```

2. **Execute o script de deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

3. **Configure no Vercel:**
- Acesse [vercel.com](https://vercel.com)
- Conecte sua conta GitHub
- Selecione o repositório
- Configure as variáveis de ambiente:
  ```
  MONGODB_URI=mongodb+srv://admin:MqD0og0W9vkv93E7@cluster0.50nxaat.mongodb.net/lojabarbearia?retryWrites=true&w=majority&appName=Cluster0
  JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
  NODE_ENV=production
  ```

4. **Deploy automático!** 🎉

### Opção 2: Railway

1. Acesse [railway.app](https://railway.app)
2. Conecte sua conta GitHub
3. Selecione o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- MongoDB Atlas (gratuito)

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/sistema-loja-barbearia.git
cd sistema-loja-barbearia
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env.local`:
```env
MONGODB_URI=mongodb+srv://admin:MqD0og0W9vkv93E7@cluster0.50nxaat.mongodb.net/lojabarbearia?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
NODE_ENV=development
```

4. **Execute o sistema:**
```bash
npm run dev:full
```

5. **Acesse:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📱 Acesso Mobile

O sistema é totalmente responsivo e funciona perfeitamente em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Computadores
- 🖥️ Qualquer dispositivo com navegador

## 🔒 Segurança

- Autenticação JWT
- Controle de acesso por usuário
- Validação de dados
- HTTPS automático em produção
- Backup automático do banco de dados

## 💰 Custos

### Hospedagem:
- **Vercel:** Gratuito para começar
- **Railway:** $5-10/mês após período gratuito
- **MongoDB Atlas:** Gratuito até 512MB

### Domínio:
- **Gratuito:** `.vercel.app` (incluído)
- **Próprio:** $10-15/ano (GoDaddy, Namecheap, etc.)

## 🆘 Suporte

### Problemas comuns:

1. **Erro de conexão com MongoDB:**
   - Verifique se o IP está liberado no MongoDB Atlas
   - Confirme se a string de conexão está correta

2. **Erro de build:**
   - Verifique se todas as dependências estão instaladas
   - Confirme se o Node.js está na versão 18+

3. **Erro de deploy:**
   - Verifique se as variáveis de ambiente estão configuradas
   - Confirme se o repositório está no GitHub

### Contato:
- 📧 Email: seu-email@exemplo.com
- 📱 WhatsApp: (11) 99999-9999

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as [diretrizes de contribuição](CONTRIBUTING.md) antes de enviar um pull request.

---

**Desenvolvido com ❤️ para facilitar a gestão do seu negócio!** 