import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local na raiz do projeto
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexão com MongoDB estabelecida com sucesso!');
    
    // Criar uma coleção de teste
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    
    // Tentar inserir um documento
    await Test.create({ name: 'Teste de conexão' });
    console.log('Documento de teste criado com sucesso!');
    
    // Buscar o documento
    const doc = await Test.findOne({ name: 'Teste de conexão' });
    console.log('Documento encontrado:', doc);
    
    // Limpar o documento de teste
    await Test.deleteOne({ name: 'Teste de conexão' });
    console.log('Documento de teste removido!');
    
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexão fechada');
    process.exit(0);
  }
}

testConnection(); 