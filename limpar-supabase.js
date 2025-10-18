const { PrismaClient } = require('@prisma/client');

console.log('\n🗑️  LIMPEZA COMPLETA DO BANCO SUPABASE\n');
console.log('='.repeat(70));
console.log('\n⚠️  ATENÇÃO: Isso irá DELETAR TODAS AS TABELAS!\n');
console.log('Project: FinanceUP');
console.log('Project ID: lfzqihajyvmdwrjtefco\n');
console.log('='.repeat(70));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function limparBanco() {
  try {
    console.log('\n1️⃣ Conectando ao Supabase...');
    await prisma.$connect();
    console.log('✅ Conectado!\n');

    console.log('2️⃣ Deletando todas as tabelas...\n');
    
    // Lista de todas as tabelas na ordem correta (respeitando foreign keys)
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

    let deletadas = 0;
    let erros = 0;

    for (const tabela of tabelas) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tabela}" CASCADE`);
        console.log(`   ✅ Deletada: ${tabela}`);
        deletadas++;
      } catch (error) {
        console.log(`   ⚠️  Erro ao deletar ${tabela}: ${error.message.split('\n')[0]}`);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RESULTADO DA LIMPEZA:\n');
    console.log(`   ✅ Tabelas deletadas: ${deletadas}`);
    console.log(`   ⚠️  Erros: ${erros}\n`);

    if (deletadas > 0) {
      console.log('✅ BANCO LIMPO COM SUCESSO!\n');
      console.log('📝 Próximos passos:\n');
      console.log('1. Acesse o Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco\n');
      console.log('2. Vá em: SQL Editor\n');
      console.log('3. Copie e execute o SQL de:');
      console.log('   scripts/utils/banco-completo-corrigido.sql\n');
      console.log('4. Depois execute:');
      console.log('   npm run seed\n');
    } else {
      console.log('⚠️  Nenhuma tabela foi deletada.\n');
      console.log('💡 Possíveis causas:');
      console.log('   - Banco já estava vazio');
      console.log('   - Problema de conexão\n');
    }

    console.log('='.repeat(70));

    await prisma.$disconnect();

  } catch (error) {
    console.log('\n❌ Erro durante limpeza:', error.message);
    console.log('\n💡 Verifique:');
    console.log('   1. DATABASE_URL no .env está correto');
    console.log('   2. Supabase está acessível');
    console.log('   3. Execute: node corrigir-env-supabase.js\n');
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

limparBanco();
