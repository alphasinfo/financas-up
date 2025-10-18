const fs = require('fs');
const path = require('path');

console.log('\n🔍 DIAGNÓSTICO COMPLETO DO PROJETO FINANÇAS UP\n');
console.log('='.repeat(70));

// Função auxiliar para verificar arquivo
function verificarArquivo(caminho, descricao) {
  const existe = fs.existsSync(caminho);
  const status = existe ? '✅' : '❌';
  console.log(`${status} ${descricao}: ${existe ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
  if (existe && caminho.endsWith('.env')) {
    try {
      const conteudo = fs.readFileSync(caminho, 'utf8');
      const linhas = conteudo.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      console.log(`   📄 Linhas de configuração: ${linhas.length}`);
      if (conteudo.includes('postgresql://')) {
        console.log('   🗄️  Tipo: PostgreSQL/Supabase');
      } else if (conteudo.includes('file:./dev.db')) {
        console.log('   🗄️  Tipo: SQLite Local');
      }
    } catch (err) {
      console.log(`   ⚠️  Erro ao ler: ${err.message}`);
    }
  }
  return existe;
}

// Função para verificar diretório
function verificarDiretorio(caminho, descricao) {
  const existe = fs.existsSync(caminho);
  const status = existe ? '✅' : '❌';
  let info = '';
  if (existe) {
    const itens = fs.readdirSync(caminho);
    info = ` (${itens.length} itens)`;
  }
  console.log(`${status} ${descricao}: ${existe ? 'ENCONTRADO' + info : 'NÃO ENCONTRADO'}`);
  return existe;
}

console.log('\n📁 ESTRUTURA DO PROJETO');
console.log('-'.repeat(70));

// Arquivos de configuração
console.log('\n🔧 Arquivos de Configuração:');
verificarArquivo('.env', '.env (principal)');
verificarArquivo('.env.example', '.env.example (template)');
verificarArquivo('.env.supabase', '.env.supabase (backup Supabase)');
verificarArquivo('.env.local', '.env.local');
verificarArquivo('package.json', 'package.json');
verificarArquivo('tsconfig.json', 'tsconfig.json');
verificarArquivo('next.config.mjs', 'next.config.mjs');

// Backups
console.log('\n💾 Backups:');
verificarDiretorio('bkp', 'Pasta bkp/');
if (fs.existsSync('bkp')) {
  verificarArquivo('bkp/.env.local.bkp', 'Backup .env.local');
  verificarArquivo('bkp/.env.supabase.bkp', 'Backup .env.supabase');
}

// Scripts
console.log('\n📜 Scripts:');
verificarDiretorio('scripts', 'Pasta scripts/');
if (fs.existsSync('scripts')) {
  verificarDiretorio('scripts/utils', 'scripts/utils/');
  verificarDiretorio('scripts/windows', 'scripts/windows/');
  verificarDiretorio('scripts/debian', 'scripts/debian/');
  verificarDiretorio('scripts/manjaro', 'scripts/manjaro/');
}

// Prisma
console.log('\n🗄️  Banco de Dados:');
verificarDiretorio('prisma', 'Pasta prisma/');
if (fs.existsSync('prisma')) {
  verificarArquivo('prisma/schema.prisma', 'Schema do Prisma');
  verificarArquivo('prisma/dev.db', 'Banco SQLite (dev.db)');
  verificarArquivo('prisma/seed.ts', 'Script de seed');
}

// Node modules
console.log('\n📦 Dependências:');
const nodeModulesExiste = verificarDiretorio('node_modules', 'node_modules/');
if (nodeModulesExiste) {
  const prismaClient = fs.existsSync('node_modules/@prisma/client');
  console.log(`${prismaClient ? '✅' : '❌'} Prisma Client gerado`);
  const nextAuth = fs.existsSync('node_modules/next-auth');
  console.log(`${nextAuth ? '✅' : '❌'} NextAuth instalado`);
}

// Build
console.log('\n🏗️  Build:');
verificarDiretorio('.next', 'Pasta .next/ (build)');

// Documentação
console.log('\n📚 Documentação:');
verificarArquivo('README.md', 'README.md');
verificarArquivo('SETUP-LOCAL.md', 'SETUP-LOCAL.md');
verificarArquivo('CORRECOES-TYPESCRIPT.md', 'CORRECOES-TYPESCRIPT.md');

// Verificar schema do Prisma
console.log('\n⚙️  CONFIGURAÇÃO ATUAL');
console.log('-'.repeat(70));

if (fs.existsSync('prisma/schema.prisma')) {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  if (schema.includes('provider = "postgresql"') && !schema.includes('// provider = "postgresql"')) {
    console.log('🗄️  Schema: PostgreSQL/Supabase');
  } else if (schema.includes('provider = "sqlite"') && !schema.includes('// provider = "sqlite"')) {
    console.log('🗄️  Schema: SQLite Local');
  } else {
    console.log('⚠️  Schema: Configuração não identificada');
  }
}

// Verificar .env atual
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  console.log('\n📝 Arquivo .env atual:');
  if (env.includes('postgresql://')) {
    console.log('   ✅ Configurado para PostgreSQL/Supabase');
    const match = env.match(/DATABASE_URL="([^"]+)"/);
    if (match) {
      const url = match[1];
      const maskedUrl = url.replace(/:([^@]+)@/, ':***@');
      console.log(`   🔗 URL: ${maskedUrl}`);
    }
  } else if (env.includes('file:./dev.db')) {
    console.log('   ✅ Configurado para SQLite Local');
  }
  
  if (env.includes('NEXTAUTH_URL')) {
    const match = env.match(/NEXTAUTH_URL="([^"]+)"/);
    if (match) {
      console.log(`   🌐 NEXTAUTH_URL: ${match[1]}`);
    }
  }
  
  if (env.includes('NEXTAUTH_SECRET')) {
    console.log('   🔐 NEXTAUTH_SECRET: Configurado');
  }
}

// Verificar usuários no banco
console.log('\n👥 USUÁRIOS NO BANCO');
console.log('-'.repeat(70));

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.usuario.count().then(async count => {
    console.log(`📊 Total de usuários: ${count}`);
    
    if (count > 0) {
      const usuarios = await prisma.usuario.findMany({
        select: { email: true, nome: true, criadoEm: true }
      });
      console.log('\n👤 Usuários cadastrados:');
      usuarios.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.nome} (${u.email})`);
      });
    } else {
      console.log('⚠️  Nenhum usuário encontrado!');
      console.log('💡 Execute: npm run seed');
    }
    
    await prisma.$disconnect();
    
    // Resumo final
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 RESUMO E RECOMENDAÇÕES\n');
    
    if (!nodeModulesExiste) {
      console.log('❌ CRÍTICO: node_modules não encontrado');
      console.log('   → Execute: npm install\n');
    }
    
    if (count === 0) {
      console.log('⚠️  AVISO: Banco sem usuários');
      console.log('   → Execute: npm run seed\n');
    }
    
    console.log('✅ Para iniciar o desenvolvimento:');
    if (!nodeModulesExiste) {
      console.log('   1. npm install');
    }
    console.log('   2. npm run dev');
    console.log('   3. Acesse: http://localhost:3000\n');
    
    console.log('='.repeat(70));
    
  }).catch(err => {
    console.log('❌ Erro ao conectar ao banco:', err.message);
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verifique se DATABASE_URL está correto no .env');
    console.log('   2. Execute: npx prisma generate');
    console.log('   3. Execute: npx prisma db push\n');
    prisma.$disconnect();
  });
  
} catch (err) {
  console.log('⚠️  Prisma Client não disponível');
  console.log('💡 Execute: npx prisma generate\n');
  console.log('='.repeat(70));
}
