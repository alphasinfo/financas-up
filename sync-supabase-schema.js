const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n🔄 SINCRONIZAÇÃO DO SCHEMA SUPABASE\n');
console.log('='.repeat(70));

// Verificar se está configurado para Supabase
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
if (!env.includes('postgresql://')) {
  console.log('❌ .env não está configurado para PostgreSQL/Supabase');
  console.log('💡 Execute: copy .env.supabase .env');
  process.exit(1);
}

console.log('✅ Configuração Supabase detectada\n');

// Verificar schema
const schemaPath = 'prisma/schema.prisma';
const schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('provider = "postgresql"') || schema.includes('// provider = "postgresql"')) {
  console.log('⚠️  Schema não está configurado para PostgreSQL');
  console.log('💡 Execute: npm run db:supabase\n');
  process.exit(1);
}

console.log('✅ Schema configurado para PostgreSQL\n');

// Listar todos os models
console.log('📋 MODELS NO SCHEMA:\n');
const models = schema.match(/model\s+(\w+)\s+{/g);
if (models) {
  models.forEach((model, i) => {
    const name = model.match(/model\s+(\w+)/)[1];
    console.log(`   ${i + 1}. ${name}`);
  });
}

console.log('\n' + '='.repeat(70));
console.log('\n🚀 SINCRONIZANDO COM SUPABASE...\n');

try {
  // 1. Gerar Prisma Client
  console.log('1️⃣ Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado\n');

  // 2. Aplicar mudanças no banco
  console.log('2️⃣ Aplicando mudanças no banco Supabase...');
  console.log('⚠️  ATENÇÃO: Isso pode criar/alterar tabelas no Supabase!\n');
  
  // Usar db push para desenvolvimento
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('\n✅ Schema sincronizado com Supabase\n');

  console.log('='.repeat(70));
  console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!\n');
  console.log('📝 Próximos passos:');
  console.log('   1. Verificar tabelas no Supabase Dashboard');
  console.log('   2. Executar seed se necessário: npm run seed');
  console.log('   3. Testar a aplicação: npm run dev\n');
  console.log('='.repeat(70));

} catch (error) {
  console.log('\n❌ Erro durante sincronização:', error.message);
  console.log('\n💡 Possíveis soluções:');
  console.log('   1. Verifique se DATABASE_URL está correto no .env');
  console.log('   2. Verifique se o Supabase está acessível');
  console.log('   3. Verifique suas credenciais do Supabase\n');
  process.exit(1);
}
