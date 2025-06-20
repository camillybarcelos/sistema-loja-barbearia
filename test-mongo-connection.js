import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testMongoConnection() {
  try {
    console.log('Tentando conectar ao MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');
    
    // Testar uma operação simples
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('Conexão fechada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    console.error('Detalhes do erro:', error);
  }
}

testMongoConnection(); 