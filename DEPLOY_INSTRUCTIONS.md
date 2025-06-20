# 🚀 Instruções de Deploy - Sistema Loja e Barbearia

## Opção 1: Vercel (Recomendado - Mais Fácil)

### Passo 1: Preparar o Projeto
1. Certifique-se de que o projeto está no GitHub
2. O arquivo `vercel.json` já foi criado
3. O `package.json` já tem o script de build

### Passo 2: Criar Conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"

### Passo 3: Conectar o Repositório
1. Selecione o repositório do seu projeto
2. Vercel detectará automaticamente que é um projeto Node.js
3. Clique em "Deploy"

### Passo 4: Configurar Variáveis de Ambiente
No painel do Vercel, vá em Settings > Environment Variables e adicione:

```
MONGODB_URI=mongodb+srv://admin:MqD0og0W9vkv93E7@cluster0.50nxaat.mongodb.net/lojabarbearia?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
NODE_ENV=production
```

### Passo 5: Configurar Domínio
1. No painel do Vercel, vá em Settings > Domains
2. Você pode usar o domínio gratuito `.vercel.app`
3. Ou conectar seu domínio próprio

---

## Opção 2: Railway

### Passo 1: Criar Conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"

### Passo 2: Deploy
1. Selecione "Deploy from GitHub repo"
2. Escolha seu repositório
3. Railway detectará automaticamente o projeto

### Passo 3: Configurar Variáveis
No painel do Railway, adicione as mesmas variáveis de ambiente.

---

## Opção 3: Netlify + Render

### Frontend (Netlify)
1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório GitHub
3. Configure o build command: `npm run build`
4. Configure o publish directory: `dist`

### Backend (Render)
1. Acesse [render.com](https://render.com)
2. Crie um novo Web Service
3. Conecte seu repositório
4. Configure o build command: `npm install`
5. Configure o start command: `node server/index.js`

---

## 🔧 Configurações Importantes

### 1. MongoDB Atlas
- Certifique-se de que o IP `0.0.0.0/0` está liberado no MongoDB Atlas
- Ou adicione os IPs do seu provedor de hospedagem

### 2. CORS
O servidor já está configurado para aceitar requisições de qualquer origem em produção.

### 3. Variáveis de Ambiente
Sempre configure estas variáveis no seu provedor de hospedagem:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

---

## 🌐 Domínio Próprio

### Para conectar um domínio próprio:

1. **Compre um domínio** (GoDaddy, Namecheap, etc.)
2. **Configure os DNS** apontando para seu provedor de hospedagem
3. **Adicione o domínio** no painel do seu provedor

### Exemplo de configuração DNS:
```
Tipo: CNAME
Nome: @
Valor: seu-projeto.vercel.app
```

---

## 📱 Acesso Mobile

O sistema já é responsivo e funcionará perfeitamente em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Computadores
- 🖥️ Qualquer dispositivo com navegador

---

## 🔒 Segurança

### Recomendações:
1. **Altere o JWT_SECRET** para algo único e seguro
2. **Configure HTTPS** (já incluído na maioria dos provedores)
3. **Monitore os logs** regularmente
4. **Faça backups** do MongoDB Atlas

---

## 💰 Custos Estimados

### Vercel:
- **Gratuito** para começar
- **$20/mês** para domínio próprio + recursos avançados

### Railway:
- **$5-10/mês** após período gratuito

### MongoDB Atlas:
- **Gratuito** até 512MB
- **$9/mês** para 2GB (recomendado para produção)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do seu provedor
2. Confirme se as variáveis de ambiente estão corretas
3. Teste localmente primeiro
4. Consulte a documentação do provedor escolhido

---

## ✅ Checklist Final

- [ ] Projeto no GitHub
- [ ] Conta no provedor de hospedagem
- [ ] Variáveis de ambiente configuradas
- [ ] MongoDB Atlas configurado
- [ ] Domínio configurado (opcional)
- [ ] Teste de acesso realizado
- [ ] Backup configurado 