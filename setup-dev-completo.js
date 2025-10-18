const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 SETUP COMPLETO DE DESENVOLVIMENTO LOCAL\n');
console.log('='.repeat(60));

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

// 1. Verificar .env
console.log('\n1️⃣ Verificando arquivo .env...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Por favor, crie o arquivo .env com:');
  console.log('   DATABASE_URL="file:./dev.db"');
  console.log('   NEXTAUTH_URL="http://localhost:3000"');
  console.log('   NEXTAUTH_SECRET="dev-secret-key"');
  process.exit(1);
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('file:./dev.db')) {
    console.log('✅ .env configurado para SQLite local');
  } else if (envContent.includes('postgresql://')) {
    console.log('⚠️  .env configurado para PostgreSQL');
    console.log('💡 Para usar SQLite local, altere DATABASE_URL="file:./dev.db"');
  }
}

// 2. Configurar schema para SQLite
console.log('\n2️⃣ Configurando schema para SQLite...');
executar('npm run db:local', 'Alternar para banco local (SQLite)');

// 3. Gerar Prisma Client
console.log('\n3️⃣ Gerando Prisma Client...');
executar('npx prisma generate', 'Gerar Prisma Client');

// 4. Criar/atualizar banco de dados
console.log('\n4️⃣ Criando/atualizando banco de dados...');
executar('npx prisma db push', 'Criar banco de dados');

// 5. Popular banco com dados de teste
console.log('\n5️⃣ Populando banco com dados de teste...');
const seedResult = executar('npm run seed', 'Popular banco de dados');

if (seedResult) {
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ SETUP CONCLUÍDO COM SUCESSO!\n');
  console.log('👤 Credenciais de teste:');
  console.log('   Email: admin@financas.com');
  console.log('   Senha: admin123\n');
  console.log('🚀 Para iniciar o servidor:');
  console.log('   npm run dev\n');
  console.log('🌐 Acesse: http://localhost:3000\n');
  console.log('='.repeat(60));
} else {
  console.log('\n⚠️  Houve problemas no seed. Verifique os erros acima.');
}
