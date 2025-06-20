import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Diretório atual:', __dirname);
console.log('Caminho para .env.local:', join(__dirname, '.env.local'));

// Verificar se o arquivo existe
const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('Arquivo .env.local existe!');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('Conteúdo do arquivo:');
  console.log(content);
} else {
  console.log('Arquivo .env.local NÃO existe!');
} 