const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const schemaPath = path.join(__dirname, '..', '..', 'prisma', 'schema.prisma');

// Lista de possíveis arquivos .env em ordem de prioridade
const envFiles = ['.env.local', '.env', '.env.production'];

let databaseUrl = null;
let envFileUsed = null;

for (const envFile of envFiles) {
  const envPath = path.join(__dirname, '..', '..', envFile);
  console.log(`🔍 Verificando ${envFile}: ${envPath}`);
  try {
    if (fs.existsSync(envPath)) {
      console.log(`   ✅ Arquivo existe: ${envFile}`);
      dotenv.config({ path: envPath });
      databaseUrl = process.env.DATABASE_URL;
      envFileUsed = envFile;
      console.log(`   🔗 DATABASE_URL: ${databaseUrl}`);
      if (databaseUrl) {
        console.log(`   🎯 Usando ${envFile}`);
        break;
      }
    } else {
      console.log(`   ❌ Arquivo não existe: ${envFile}`);
    }
  } catch (error) {
    console.log(`   ⚠️ Erro ao ler ${envFile}:`, error.message);
    continue;
  }
}

if (!databaseUrl) {
  console.log('⚠️ DATABASE_URL não encontrada nos arquivos .env');
  console.log('   Usando configuração padrão: SQLite local');
  databaseUrl = 'file:./dev.db';
  envFileUsed = 'default';
}

// Determinar provider baseado na URL
let provider = 'sqlite';
if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
  provider = 'postgresql';
}

console.log(`🔧 Configurando Prisma para: ${provider}`);
console.log(`   Arquivo .env usado: ${envFileUsed}`);

// Ler schema atual
let schema = fs.readFileSync(schemaPath, 'utf8');

// Atualizar provider no datasource
const datasourceRegex = /datasource db \{\s*provider = "[^"]*"\s*url\s*=\s*[^}]+\}/;
const newDatasource = `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`;

schema = schema.replace(datasourceRegex, newDatasource);

// Salvar schema atualizado
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('✅ Schema Prisma configurado automaticamente');
console.log(`   Provider: ${provider}`);
console.log(`   URL: ${databaseUrl.replace(/:[^:]*@/, ':***@')}`); // Ocultar senha
