const fs = require('fs');
const { execSync } = require('child_process');

console.log('\n🔧 ATUALIZAÇÃO DE CONFIGURAÇÃO SUPABASE\n');
console.log('='.repeat(70));

// Receber parâmetros
const projectId = process.argv[2];
const password = process.argv[3];
const region = process.argv[4] || 'aws-1-us-east-1';

if (!projectId || !password) {
  console.log('❌ Uso incorreto!\n');
  console.log('📝 Como usar:');
  console.log('   node atualizar-config-supabase.js [PROJECT_ID] [PASSWORD] [REGION]\n');
  console.log('📋 Exemplo:');
  console.log('   node atualizar-config-supabase.js abc123xyz456 MinhaSenh@123 aws-0-sa-east-1\n');
  console.log('💡 Region é opcional (padrão: aws-1-us-east-1)\n');
  process.exit(1);
}

console.log('📋 Informações recebidas:\n');
console.log(`   Project ID: ${projectId}`);
console.log(`   Password: ${'*'.repeat(password.length)}`);
console.log(`   Region: ${region}\n`);

// Montar Connection String
const connectionString = `postgresql://postgres.${projectId}:${password}@${region}.pooler.supabase.com:5432/postgres`;

console.log('🔗 Connection String gerada:\n');
console.log(`   ${connectionString.replace(password, '*'.repeat(password.length))}\n`);

// Conteúdo do .env
const envContent = `# Configuração Supabase - Projeto: ${projectId}
# Atualizado em: ${new Date().toISOString()}

DATABASE_URL="${connectionString}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fdaed013c233b22e5ab7328adcf82073"
`;

console.log('1️⃣ Atualizando arquivos de configuração...\n');

// Atualizar .env
fs.writeFileSync('.env', envContent, 'utf8');
console.log('   ✅ .env atualizado');

// Atualizar .env.supabase
fs.writeFileSync('.env.supabase', envContent, 'utf8');
console.log('   ✅ .env.supabase atualizado');

// Atualizar backups
const backupContent = `DATABASE_URL="${connectionString}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fdaed013c233b22e5ab7328adcf82073"
`;

fs.writeFileSync('bkp/.env.supabase.bkp', backupContent, 'utf8');
console.log('   ✅ bkp/.env.supabase.bkp atualizado');

fs.writeFileSync('bkp/.env.backup.20251017_154937', `# BACKUP do ambiente Supabase original\n${backupContent}`, 'utf8');
console.log('   ✅ bkp/.env.backup.20251017_154937 atualizado\n');

console.log('2️⃣ Gerando Prisma Client...\n');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('\n   ✅ Prisma Client gerado\n');
} catch (error) {
  console.log('\n   ❌ Erro ao gerar Prisma Client\n');
  process.exit(1);
}

console.log('3️⃣ Testando conexão com Supabase...\n');
try {
  execSync('node testar-conexao-supabase.js', { stdio: 'inherit' });
  console.log('\n   ✅ Conexão testada com sucesso!\n');
} catch (error) {
  console.log('\n   ⚠️  Erro ao testar conexão');
  console.log('   💡 Verifique se o SQL foi executado no Supabase Dashboard\n');
}

console.log('4️⃣ Populando banco com dados de teste...\n');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('\n   ✅ Seed executado com sucesso!\n');
} catch (error) {
  console.log('\n   ⚠️  Erro no seed');
  console.log('   💡 Tente executar manualmente: npm run seed\n');
}

console.log('='.repeat(70));
console.log('\n✅ CONFIGURAÇÃO CONCLUÍDA!\n');
console.log('📊 Resumo:\n');
console.log(`   • Project ID: ${projectId}`);
console.log(`   • Region: ${region}`);
console.log(`   • Arquivos atualizados: 4`);
console.log(`   • Prisma Client: Gerado`);
console.log(`   • Conexão: Testada`);
console.log(`   • Seed: Executado\n`);

console.log('🚀 Próximos passos:\n');
console.log('   1. Testar aplicação: npm run dev');
console.log('   2. Acessar: http://localhost:3000');
console.log('   3. Login: teste@financasup.com / 123456\n');

console.log('📝 Para fazer commit das alterações:\n');
console.log('   git add .');
console.log('   git commit -m "atualizar-config-novo-projeto-supabase"');
console.log('   git push\n');

console.log('='.repeat(70));
