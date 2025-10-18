const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n🔄 SINCRONIZAÇÃO FORÇADA COM SUPABASE\n');
console.log('='.repeat(70));

// Atualizar .env com porta 6543 (Session pooler)
const envCorreto = `# Configuração temporária para criar tabelas no Supabase
# Use este arquivo apenas para rodar as migrations

DATABASE_URL="postgresql://postgres.lfzqihajyvmdwrjtefco:Alpha124578S1nfo@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fdaed013c233b22e5ab7328adcf82073"
`;

console.log('1️⃣ Atualizando .env com Session pooler (porta 6543)...');
fs.writeFileSync('.env', envCorreto, 'utf8');
fs.writeFileSync('.env.supabase', envCorreto, 'utf8');
console.log('✅ .env atualizado\n');

console.log('2️⃣ Gerando Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado\n');
} catch (error) {
  console.log('❌ Erro ao gerar Prisma Client');
  process.exit(1);
}

console.log('3️⃣ Sincronizando schema com Supabase (db push)...');
console.log('⚠️  Isso pode recriar tabelas!\n');
try {
  execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });
  console.log('\n✅ Schema sincronizado!\n');
} catch (error) {
  console.log('\n❌ Erro ao sincronizar schema');
  console.log('💡 Tentando método alternativo...\n');
  
  // Tentar com migrate
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('\n✅ Migrations aplicadas!\n');
  } catch (error2) {
    console.log('\n❌ Método alternativo também falhou');
    console.log('\n⚠️  AÇÃO NECESSÁRIA:');
    console.log('Execute manualmente no Supabase SQL Editor o arquivo:');
    console.log('scripts/utils/banco-completo-corrigido.sql\n');
    process.exit(1);
  }
}

console.log('4️⃣ Populando banco com dados de teste...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('\n✅ Seed executado com sucesso!\n');
} catch (error) {
  console.log('\n⚠️  Erro no seed, mas schema pode estar OK');
  console.log('Tente executar novamente: npm run seed\n');
}

console.log('='.repeat(70));
console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!\n');
console.log('🚀 Para testar:');
console.log('   npm run dev\n');
console.log('='.repeat(70));
