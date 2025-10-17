const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const modo = process.argv[2]; // 'local' ou 'supabase'

if (!modo || !['local', 'supabase'].includes(modo)) {
  console.log('❌ Uso: node scripts/alternar-db.js [local|supabase]');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (modo === 'supabase') {
  console.log('🔄 Alternando para PostgreSQL (Supabase)...\n');
  
  // Comentar SQLite
  schema = schema.replace(
    /datasource db \{[\s\S]*?provider = "sqlite"[\s\S]*?url[\s\S]*?\}/,
    (match) => '// ' + match.split('\n').join('\n// ')
  );
  
  // Descomentar PostgreSQL
  schema = schema.replace(
    /\/\/ datasource db \{[\s\S]*?\/\/   provider = "postgresql"[\s\S]*?\/\/   url[\s\S]*?\/\/ \}/,
    (match) => match.replace(/\/\/ /g, '')
  );
  
  console.log('✅ Schema configurado para PostgreSQL');
  console.log('📝 Não esqueça de copiar .env.supabase para .env');
  console.log('   copy .env.supabase .env\n');
  
} else {
  console.log('🔄 Alternando para SQLite (Local)...\n');
  
  // Comentar PostgreSQL
  schema = schema.replace(
    /datasource db \{[\s\S]*?provider = "postgresql"[\s\S]*?url[\s\S]*?\}/,
    (match) => '// ' + match.split('\n').join('\n// ')
  );
  
  // Descomentar SQLite
  schema = schema.replace(
    /\/\/ datasource db \{[\s\S]*?\/\/   provider = "sqlite"[\s\S]*?\/\/   url[\s\S]*?\/\/ \}/,
    (match) => match.replace(/\/\/ /g, '')
  );
  
  console.log('✅ Schema configurado para SQLite');
  console.log('📝 Certifique-se que .env tem DATABASE_URL="file:./dev.db"\n');
}

fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('🎉 Pronto! Agora execute:');
console.log('   npx prisma generate\n');
