const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

console.log('\n🔄 RESET MANUAL DO BANCO SUPABASE\n');
console.log('='.repeat(70));
console.log('\n⚠️  ATENÇÃO: Isso irá APAGAR TODOS OS DADOS!\n');
console.log('Project: FinanceUP');
console.log('Project ID: lfzqihajyvmdwrjtefco\n');
console.log('='.repeat(70));

const prisma = new PrismaClient();

async function resetarBanco() {
  try {
    console.log('\n1️⃣ Conectando ao Supabase...');
    await prisma.$connect();
    console.log('✅ Conectado!\n');

    console.log('2️⃣ Deletando todas as tabelas na ordem correta...\n');
    
    // Ordem de deleção (respeita foreign keys)
    const tabelas = [
      'logs_acesso',
      'convites_compartilhamento',
      'compartilhamentos_conta',
      'conciliacoes',
      'metas',
      'orcamentos',
      'investimentos',
      'parcelas_emprestimo',
      'emprestimos',
      'pagamentos_fatura',
      'transacoes',
      'faturas',
      'cartoes_credito',
      'contas_bancarias',
      'categorias',
      'usuarios',
    ];

    for (const tabela of tabelas) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tabela}" CASCADE`);
        console.log(`   ✅ Deletada: ${tabela}`);
      } catch (error) {
        console.log(`   ⚠️  ${tabela}: ${error.message}`);
      }
    }

    console.log('\n✅ Todas as tabelas deletadas!\n');
    await prisma.$disconnect();

    console.log('3️⃣ Recriando tabelas com Prisma...\n');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    
    console.log('\n4️⃣ Gerando Prisma Client...\n');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('\n5️⃣ Populando banco com dados de teste...\n');
    execSync('npm run seed', { stdio: 'inherit' });

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

  } catch (error) {
    console.log('\n❌ Erro durante reset:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetarBanco();
