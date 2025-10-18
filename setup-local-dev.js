const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CONFIGURAÇÃO DE DESENVOLVIMENTO LOCAL\n');
console.log('='.repeat(60));

// 1. Verificar se .env existe
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('\n❌ Arquivo .env não encontrado!');
  console.log('📝 Criando .env a partir do .env.example...\n');
  
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  // Criar .env com configurações padrão para desenvolvimento local
  const envContent = `# ============================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ============================================

# OPÇÃO 1: SQLite (Desenvolvimento Local) - RECOMENDADO PARA TESTES
DATABASE_URL="file:./dev.db"

# OPÇÃO 2: PostgreSQL/Supabase (Produção)
# Descomente a linha abaixo e adicione sua URL do Supabase
# DATABASE_URL="postgresql://postgres.xxxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ============================================
# NEXTAUTH (Autenticação)
# ============================================

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-use-openssl-rand-base64-32"

# ============================================
# EMAIL (Resend - Opcional para desenvolvimento)
# ============================================

RESEND_API_KEY=""
RESEND_FROM_EMAIL="Finanças UP <onboarding@resend.dev>"
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Arquivo .env criado com sucesso!\n');
} else {
  console.log('\n✅ Arquivo .env já existe\n');
}

// 2. Verificar configuração do schema
console.log('📋 Verificando schema do Prisma...');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

if (schema.includes('provider = "postgresql"') && !schema.includes('// provider = "postgresql"')) {
  console.log('⚠️  Schema configurado para PostgreSQL');
  console.log('💡 Para usar SQLite local, execute: npm run db:local\n');
} else if (schema.includes('provider = "sqlite"')) {
  console.log('✅ Schema configurado para SQLite (desenvolvimento local)\n');
}

// 3. Verificar se o banco existe
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
if (fs.existsSync(dbPath)) {
  console.log('✅ Banco de dados SQLite encontrado\n');
  
  // Verificar se há usuários
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.usuario.count().then(count => {
      console.log(`📊 Usuários no banco: ${count}\n`);
      
      if (count === 0) {
        console.log('⚠️  Nenhum usuário encontrado!');
        console.log('💡 Execute: npm run seed (para criar usuários de teste)\n');
      } else {
        console.log('✅ Banco de dados populado\n');
        console.log('👤 Usuário de teste padrão:');
        console.log('   Email: admin@financas.com');
        console.log('   Senha: admin123\n');
      }
      
      prisma.$disconnect();
    }).catch(err => {
      console.log('⚠️  Erro ao verificar usuários:', err.message);
      console.log('💡 Execute: npx prisma generate && npx prisma db push\n');
      prisma.$disconnect();
    });
  } catch (err) {
    console.log('⚠️  Prisma Client não gerado');
    console.log('💡 Execute: npx prisma generate\n');
  }
} else {
  console.log('❌ Banco de dados não encontrado');
  console.log('💡 Execute: npx prisma db push (para criar o banco)\n');
}

console.log('='.repeat(60));
console.log('\n📝 PRÓXIMOS PASSOS:\n');
console.log('1. Verifique o arquivo .env e ajuste se necessário');
console.log('2. Se usar SQLite: npm run db:local');
console.log('3. Gerar Prisma Client: npx prisma generate');
console.log('4. Criar banco: npx prisma db push');
console.log('5. Popular banco: npm run seed');
console.log('6. Iniciar servidor: npm run dev\n');
console.log('='.repeat(60));
