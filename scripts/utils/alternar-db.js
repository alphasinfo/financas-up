const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', '..', 'prisma', 'schema.prisma');
const modo = process.argv[2]; // 'local' ou 'supabase'

if (!modo || !['local', 'supabase'].includes(modo)) {
  console.log('❌ Uso: npm run db:local ou npm run db:supabase');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

// Template do datasource SQLite
const sqliteBlock = `// datasource db {
//   provider = "sqlite"
//   url      = env("DATABASE_URL")
// }`;

// Template do datasource PostgreSQL
const postgresBlock = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

if (modo === 'supabase') {
  console.log('🔄 Alternando para PostgreSQL (Supabase)...\n');
  
  // Substituir a seção de configuração do banco
  schema = schema.replace(
    /\/\/ Para DESENVOLVIMENTO LOCAL \(SQLite\):[\s\S]*?\/\/ Para PRODUÇÃO \(PostgreSQL\/Supabase\):[\s\S]*?datasource db \{[\s\S]*?\}/,
    `// Para DESENVOLVIMENTO LOCAL (SQLite):
${sqliteBlock}
// .env: DATABASE_URL="file:./dev.db"
//
// Para PRODUÇÃO (PostgreSQL/Supabase):
${postgresBlock}`
  );
  
  console.log('✅ Schema configurado para PostgreSQL');
  console.log('📝 Certifique-se que .env tem a URL do Supabase\n');
  
} else {
  console.log('🔄 Alternando para SQLite (Local)...\n');
  
  // Template do datasource SQLite ativo
  const sqliteActiveBlock = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
  
  // Template do datasource PostgreSQL comentado
  const postgresCommentedBlock = `// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }`;
  
  // Substituir a seção de configuração do banco
  schema = schema.replace(
    /\/\/ Para DESENVOLVIMENTO LOCAL \(SQLite\):[\s\S]*?\/\/ Para PRODUÇÃO \(PostgreSQL\/Supabase\):[\s\S]*?datasource db \{[\s\S]*?\}/,
    `// Para DESENVOLVIMENTO LOCAL (SQLite):
${sqliteActiveBlock}
// .env: DATABASE_URL="file:./dev.db"
//
// Para PRODUÇÃO (PostgreSQL/Supabase):
${postgresCommentedBlock}`
  );
  
  console.log('✅ Schema configurado para SQLite');
  console.log('📝 Certifique-se que .env tem DATABASE_URL="file:./dev.db"\n');
}

fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('🎉 Pronto! Agora execute:');
console.log('   npx prisma generate\n');
