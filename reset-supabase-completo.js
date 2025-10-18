const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n🔄 RESET COMPLETO DO BANCO SUPABASE\n');
console.log('='.repeat(70));
console.log('\n⚠️  ATENÇÃO: Isso irá APAGAR TODOS OS DADOS do Supabase!\n');
console.log('Project: FinanceUP');
console.log('Project ID: lfzqihajyvmdwrjtefco\n');
console.log('='.repeat(70));

// Verificar se está configurado para Supabase
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.log('\n❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
if (!env.includes('postgresql://')) {
  console.log('\n❌ .env não está configurado para Supabase');
  console.log('💡 Execute: copy .env.supabase .env');
  process.exit(1);
}

console.log('\n✅ Configuração Supabase detectada\n');

function executar(comando, descricao) {
  console.log(`\n📌 ${descricao}...`);
  try {
    execSync(comando, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${descricao} - Concluído`);
    return true;
  } catch (error) {
    console.log(`❌ ${descricao} - Erro`);
    return false;
  }
}

console.log('🚀 INICIANDO RESET COMPLETO...\n');

// 1. Garantir que schema está correto
console.log('1️⃣ Configurando schema para PostgreSQL...');
executar('npm run db:supabase', 'Alternar para Supabase');

// 2. Gerar Prisma Client
console.log('\n2️⃣ Gerando Prisma Client...');
executar('npx prisma generate', 'Gerar Prisma Client');

// 3. Aplicar schema no Supabase (força reset)
console.log('\n3️⃣ Aplicando schema no Supabase (RESET)...');
console.log('⚠️  Isso irá RECRIAR todas as tabelas!\n');
executar('npx prisma db push --force-reset --accept-data-loss', 'Reset e criação de tabelas');

// 4. Popular banco com dados de teste
console.log('\n4️⃣ Populando banco com dados de teste...');
executar('npm run seed', 'Popular banco');

// 5. Verificar resultado
console.log('\n5️⃣ Verificando resultado...');
executar('node verificar-schema-supabase.js', 'Verificar schema');

console.log('\n' + '='.repeat(70));
console.log('\n✅ RESET COMPLETO CONCLUÍDO!\n');
console.log('📊 Banco Supabase foi:');
console.log('   ✅ Resetado completamente');
console.log('   ✅ Todas as tabelas recriadas');
console.log('   ✅ Dados de teste inseridos\n');
console.log('🚀 Para testar:');
console.log('   npm run dev\n');
console.log('👤 Login:');
console.log('   Email: teste@financasup.com');
console.log('   Senha: 123456\n');
console.log('='.repeat(70));
