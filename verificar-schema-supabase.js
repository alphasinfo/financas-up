const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

console.log('\n🔍 VERIFICAÇÃO DO SCHEMA SUPABASE\n');
console.log('='.repeat(70));

// Verificar configuração
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const isSupabase = env.includes('postgresql://');
const isLocal = env.includes('file:./dev.db');

console.log(`📝 Configuração atual: ${isSupabase ? 'Supabase (PostgreSQL)' : isLocal ? 'Local (SQLite)' : 'Desconhecida'}\n`);

if (!isSupabase) {
  console.log('⚠️  Este script é para verificar o Supabase');
  console.log('💡 Para usar Supabase, execute: copy .env.supabase .env');
  process.exit(0);
}

// Conectar ao banco
const prisma = new PrismaClient();

async function verificarSchema() {
  try {
    console.log('🔌 Conectando ao Supabase...\n');

    // Verificar cada tabela
    const tabelas = [
      { nome: 'usuarios', model: 'usuario' },
      { nome: 'categorias', model: 'categoria' },
      { nome: 'contas_bancarias', model: 'contaBancaria' },
      { nome: 'cartoes_credito', model: 'cartaoCredito' },
      { nome: 'faturas', model: 'fatura' },
      { nome: 'pagamentos_fatura', model: 'pagamentoFatura' },
      { nome: 'transacoes', model: 'transacao' },
      { nome: 'emprestimos', model: 'emprestimo' },
      { nome: 'parcelas_emprestimo', model: 'parcelaEmprestimo' },
      { nome: 'investimentos', model: 'investimento' },
      { nome: 'orcamentos', model: 'orcamento' },
      { nome: 'metas', model: 'meta' },
      { nome: 'conciliacoes', model: 'conciliacao' },
      { nome: 'compartilhamentos_conta', model: 'compartilhamentoConta' },
      { nome: 'convites_compartilhamento', model: 'conviteCompartilhamento' },
      { nome: 'logs_acesso', model: 'logAcesso' },
    ];

    console.log('📊 TABELAS E REGISTROS:\n');

    const resultados = [];
    
    for (const tabela of tabelas) {
      try {
        const count = await prisma[tabela.model].count();
        const status = count > 0 ? '✅' : '⚠️ ';
        console.log(`${status} ${tabela.nome.padEnd(30)} ${count.toString().padStart(5)} registros`);
        resultados.push({ tabela: tabela.nome, count, existe: true });
      } catch (error) {
        console.log(`❌ ${tabela.nome.padEnd(30)} ERRO: ${error.message.split('\n')[0]}`);
        resultados.push({ tabela: tabela.nome, count: 0, existe: false, erro: error.message });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 RESUMO:\n');

    const tabelasComErro = resultados.filter(r => !r.existe);
    const tabelasVazias = resultados.filter(r => r.existe && r.count === 0);
    const tabelasPopuladas = resultados.filter(r => r.existe && r.count > 0);

    console.log(`✅ Tabelas OK: ${tabelasPopuladas.length}`);
    console.log(`⚠️  Tabelas vazias: ${tabelasVazias.length}`);
    console.log(`❌ Tabelas com erro: ${tabelasComErro.length}`);

    if (tabelasComErro.length > 0) {
      console.log('\n❌ TABELAS COM PROBLEMAS:\n');
      tabelasComErro.forEach(t => {
        console.log(`   • ${t.tabela}`);
        console.log(`     Erro: ${t.erro.split('\n')[0]}`);
      });
      
      console.log('\n💡 SOLUÇÃO:');
      console.log('   Execute: node sync-supabase-schema.js');
      console.log('   Isso irá sincronizar o schema com o Supabase\n');
    }

    if (tabelasVazias.length > 0 && tabelasComErro.length === 0) {
      console.log('\n⚠️  BANCO VAZIO:');
      console.log('   Execute: npm run seed\n');
    }

    if (tabelasComErro.length === 0 && tabelasVazias.length === 0) {
      console.log('\n✅ TUDO OK! Banco Supabase está sincronizado e populado.\n');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.log('\n❌ Erro ao conectar:', error.message);
    console.log('\n💡 Verifique:');
    console.log('   1. DATABASE_URL no .env está correto');
    console.log('   2. Supabase está acessível');
    console.log('   3. Credenciais estão corretas\n');
  } finally {
    await prisma.$disconnect();
  }
}

verificarSchema();
