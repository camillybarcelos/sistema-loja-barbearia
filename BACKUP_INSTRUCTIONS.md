# 📁 INSTRUÇÕES DE BACKUP - Sistema Integrado Loja de Roupas e Barbearia

## 🎯 Como Salvar e Gerenciar o Projeto

### ✅ **Status Atual**
- ✅ Projeto funcionando na porta 5174
- ✅ Sistema completo com todas as funcionalidades
- ✅ Arquivos salvos em: `C:\SISTEMAS\Sistema Integrado Loja de Roupas e Barbearia\project\`

### 🔄 **Opções de Backup**

#### **Opção 1: Backup Manual (Recomendado para iniciantes)**
1. Copie toda a pasta do projeto para outro local:
   ```
   C:\SISTEMAS\Sistema Integrado Loja de Roupas e Barbearia\project\
   ```
2. Cole em um local seguro como:
   - Desktop
   - Documentos
   - Drive externo
   - Google Drive/OneDrive

#### **Opção 2: Instalar Git (Para desenvolvedores)**
1. Baixe e instale o Git: https://git-scm.com/download/win
2. Abra o terminal na pasta do projeto
3. Execute os comandos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do sistema"
   ```

#### **Opção 3: Criar ZIP do Projeto**
1. Clique com botão direito na pasta `project`
2. Selecione "Enviar para" → "Pasta compactada"
3. Salve o arquivo .zip em local seguro

### 🚀 **Como Executar o Projeto**

#### **Sempre que quiser usar o sistema:**
1. Abra o PowerShell como administrador
2. Navegue até a pasta do projeto:
   ```powershell
   cd "C:\SISTEMAS\Sistema Integrado Loja de Roupas e Barbearia\project"
   ```
3. Execute o servidor:
   ```powershell
   npm run dev
   ```
4. Acesse: `http://localhost:5174/login`

### 📋 **Funcionalidades Disponíveis**

#### **Sistema Completo Inclui:**
- 🔐 **Login/Autenticação**: Sistema de login seguro
- 📊 **Dashboard**: Visão geral do negócio
- 🛒 **PDV**: Sistema de vendas completo
- 💰 **Caixa**: Gerenciamento de caixa (abertura, fechamento, retiradas)
- 📦 **Produtos**: Cadastro com códigos de barras
- ✂️ **Serviços**: Serviços da barbearia
- 👥 **Clientes**: Gerenciamento com sistema de fiado
- 📈 **Vendas**: Histórico e relatórios
- 💸 **Comissões**: Controle de comissões
- 📅 **Agendamentos**: Sistema de agendamento
- ⚙️ **Configurações**: Configurações do sistema

#### **Recursos Especiais:**
- 🏷️ **Códigos de Barras**: Geração automática e impressão
- 💳 **Múltiplos Pagamentos**: Dinheiro, cartão, PIX, fiado
- 📊 **Relatórios**: Vendas, clientes, produtos
- 🌙 **Modo Escuro**: Interface adaptável
- 📱 **Responsivo**: Funciona em desktop e mobile

### 🔧 **Manutenção**

#### **Atualizar Dependências:**
```powershell
npm update
```

#### **Limpar Cache:**
```powershell
npm run build
```

#### **Reinstalar Dependências:**
```powershell
npm install
```

### 📞 **Suporte**
- Sistema desenvolvido com React + TypeScript
- Interface moderna com Tailwind CSS
- Dados salvos localmente no navegador
- Sistema pronto para produção

### 🎉 **Próximos Passos**
1. Teste todas as funcionalidades
2. Configure produtos e serviços
3. Cadastre clientes
4. Comece a usar o PDV
5. Faça backup regular do projeto

---
**Data de Criação**: $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Versão**: 1.0.0
**Status**: ✅ Funcionando 