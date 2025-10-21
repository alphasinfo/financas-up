#!/usr/bin/env tsx

/**
 * Script para verificar estrutura do banco Supabase
 */

import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres';

async function verificarSupabase() {
  console.log('🔍 Verificando estrutura do Supabase...\n');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    // Testar conexão
    console.log('📡 Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida\n');

    // Verificar tabelas
    console.log('📋 Verificando tabelas...\n');

    const tabelas = [
      { nome: 'usuarios', model: prisma.usuario },
      { nome: 'categorias', model: prisma.categoria },
      { nome: 'contas_bancarias', model: prisma.contaBancaria },
      { nome: 'cartoes_credito', model: prisma.cartaoCredito },
      { nome: 'faturas', model: prisma.fatura },
      { nome: 'transacoes', model: prisma.transacao },
      { nome: 'emprestimos', model: prisma.emprestimo },
      { nome: 'parcelas_emprestimo', model: prisma.parcelasEmprestimo },
      { nome: 'investimentos', model: prisma.investimento },
      { nome: 'orcamentos', model: prisma.orcamento },
      { nome: 'metas', model: prisma.meta },
      { nome: 'conciliacoes', model: prisma.conciliacao },
      { nome: 'compartilhamentos_conta', model: prisma.compartilhamentoConta },
      { nome: 'convites_compartilhamento', model: prisma.conviteCompartilhamento },
      { nome: 'logs_acesso', model: prisma.logAcesso },
    ];

    for (const { nome, model } of tabelas) {
      try {
        const count = await model.count();
        console.log(`✅ ${nome.padEnd(30)} - ${count} registros`);
      } catch (error: any) {
        console.log(`❌ ${nome.padEnd(30)} - ERRO: ${error.message}`);
      }
    }

    console.log('\n📊 Resumo:');
    
    // Contar usuários
    const usuarios = await prisma.usuario.count();
    console.log(`   Usuários: ${usuarios}`);

    // Contar transações
    const transacoes = await prisma.transacao.count();
    console.log(`   Transações: ${transacoes}`);

    // Contar contas
    const contas = await prisma.contaBancaria.count();
    console.log(`   Contas: ${contas}`);

    // Contar cartões
    const cartoes = await prisma.cartaoCredito.count();
    console.log(`   Cartões: ${cartoes}`);

    console.log('\n✅ Verificação concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error('\n💡 Possíveis causas:');
    console.error('   1. Banco de dados não está acessível');
    console.error('   2. Credenciais incorretas');
    console.error('   3. Tabelas não foram criadas (execute migrations)');
    console.error('   4. Firewall bloqueando conexão');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSupabase();
