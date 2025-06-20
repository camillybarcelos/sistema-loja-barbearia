import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Diretório atual:', __dirname);
console.log('Tentando carregar .env.local...');

// Tentar carregar o arquivo .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Todas as variáveis de ambiente:', process.env); 