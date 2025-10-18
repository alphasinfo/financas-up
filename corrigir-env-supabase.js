const fs = require('fs');

console.log('\n🔧 CORRIGINDO ARQUIVO .env.supabase\n');
console.log('='.repeat(70));

const envSupabasePath = '.env.supabase';
const envPath = '.env';

// Conteúdo correto
const conteudoCorreto = `# Configuração temporária para criar tabelas no Supabase
# Use este arquivo apenas para rodar as migrations

DATABASE_URL="postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fdaed013c233b22e5ab7328adcf82073"
`;

// Corrigir .env.supabase
fs.writeFileSync(envSupabasePath, conteudoCorreto, 'utf8');
console.log('✅ Arquivo .env.supabase corrigido!\n');

// Copiar para .env
fs.writeFileSync(envPath, conteudoCorreto, 'utf8');
console.log('✅ Arquivo .env atualizado!\n');

console.log('📝 URL configurada:');
console.log('   postgresql://postgres.lfzqihajyvmdwrjtefco:***@aws-1-us-east-1.pooler.supabase.com:5432/postgres\n');

console.log('='.repeat(70));
console.log('\n✅ CORREÇÃO CONCLUÍDA!\n');
console.log('Agora você pode executar:');
console.log('   node limpar-supabase.js\n');
console.log('='.repeat(70));
