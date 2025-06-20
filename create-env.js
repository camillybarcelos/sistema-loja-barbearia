import fs from 'fs';

// ATENÇÃO: Substitua 'SUA_NOVA_SENHA_AQUI' pela senha real gerada no MongoDB Atlas
const envContent = 'MONGODB_URI=mongodb+srv://admin:MqD0og0W9vkv93E7@cluster0.50nxaat.mongodb.net/lojabarbearia?retryWrites=true&w=majority&appName=Cluster0';

fs.writeFileSync('.env.local', envContent, 'utf8');
console.log('Arquivo .env.local atualizado com a nova senha!');
console.log('IMPORTANTE: Substitua SUA_NOVA_SENHA_AQUI pela senha real do MongoDB Atlas!'); 