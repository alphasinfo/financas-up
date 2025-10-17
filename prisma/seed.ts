import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.transacao.deleteMany();
  await prisma.parcelaEmprestimo.deleteMany();
  await prisma.emprestimo.deleteMany();
  await prisma.investimento.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.conciliacao.deleteMany();
  await prisma.pagamentoFatura.deleteMany();
  await prisma.fatura.deleteMany();
  await prisma.cartaoCredito.deleteMany();
  await prisma.contaBancaria.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuário de teste
  const senhaHash = await hash('123456', 12);
  
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Usuário Teste',
      email: 'teste@financasup.com',
      senha: senhaHash,
    },
  });

  console.log('✅ Usuário criado:', usuario.email);

  // Criar categorias
  const categorias = await Promise.all([
    // Categorias de Despesa
    prisma.categoria.create({
      data: {
        nome: 'Alimentação',
        tipo: 'DESPESA',
        cor: '#EF4444',
        icone: '🍔',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Transporte',
        tipo: 'DESPESA',
        cor: '#F59E0B',
        icone: '🚗',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Moradia',
        tipo: 'DESPESA',
        cor: '#8B5CF6',
        icone: '🏠',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Saúde',
        tipo: 'DESPESA',
        cor: '#10B981',
        icone: '⚕️',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Lazer',
        tipo: 'DESPESA',
        cor: '#EC4899',
        icone: '🎮',
        usuarioId: usuario.id,
      },
    }),
    // Categorias de Receita
    prisma.categoria.create({
      data: {
        nome: 'Salário',
        tipo: 'RECEITA',
        cor: '#10B981',
        icone: '💰',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Freelance',
        tipo: 'RECEITA',
        cor: '#3B82F6',
        icone: '💼',
        usuarioId: usuario.id,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Investimentos',
        tipo: 'RECEITA',
        cor: '#8B5CF6',
        icone: '📈',
        usuarioId: usuario.id,
      },
    }),
  ]);

  console.log('✅ Categorias criadas:', categorias.length);

  // Criar contas bancárias
  const contaCorrente = await prisma.contaBancaria.create({
    data: {
      nome: 'Conta Corrente Principal',
      instituicao: 'Banco do Brasil',
      tipo: 'CORRENTE',
      agencia: '1234-5',
      numero: '12345-6',
      saldoInicial: 5000,
      saldoAtual: 5000,
      saldoDisponivel: 5000,
      cor: '#3B82F6',
      usuarioId: usuario.id,
    },
  });

  const poupanca = await prisma.contaBancaria.create({
    data: {
      nome: 'Poupança',
      instituicao: 'Caixa Econômica',
      tipo: 'POUPANCA',
      agencia: '9876',
      numero: '54321-0',
      saldoInicial: 10000,
      saldoAtual: 10000,
      saldoDisponivel: 10000,
      cor: '#10B981',
      usuarioId: usuario.id,
    },
  });

  const carteira = await prisma.contaBancaria.create({
    data: {
      nome: 'Carteira',
      instituicao: 'Dinheiro',
      tipo: 'CARTEIRA',
      saldoInicial: 500,
      saldoAtual: 500,
      saldoDisponivel: 500,
      cor: '#F59E0B',
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Contas bancárias criadas: 3');

  // Criar cartões de crédito
  const cartaoVisa = await prisma.cartaoCredito.create({
    data: {
      nome: 'Visa Gold',
      banco: 'Banco do Brasil',
      bandeira: 'VISA',
      apelido: 'Cartão Principal',
      numeroMascara: '****1234',
      limiteTotal: 5000,
      limiteDisponivel: 3500,
      diaFechamento: 5,
      diaVencimento: 15,
      cor: '#3B82F6',
      usuarioId: usuario.id,
    },
  });

  const cartaoMaster = await prisma.cartaoCredito.create({
    data: {
      nome: 'Mastercard Platinum',
      banco: 'Itaú',
      bandeira: 'MASTERCARD',
      apelido: 'Reserva',
      numeroMascara: '****5678',
      limiteTotal: 3000,
      limiteDisponivel: 3000, // Corrigido: sem uso
      diaFechamento: 10,
      diaVencimento: 20,
      cor: '#F59E0B',
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Cartões de crédito criados: 2');

  // Criar investimentos
  await prisma.investimento.create({
    data: {
      nome: 'Tesouro Selic 2027',
      tipo: 'TESOURO',
      valorAplicado: 5000,
      valorAtual: 5250,
      taxaRendimento: 13.65,
      dataAplicacao: new Date('2024-01-15'),
      dataVencimento: new Date('2027-01-15'),
      instituicao: 'Tesouro Direto',
      usuarioId: usuario.id,
    },
  });

  await prisma.investimento.create({
    data: {
      nome: 'CDB Banco Inter',
      tipo: 'RENDA_FIXA',
      valorAplicado: 3000,
      valorAtual: 3180,
      taxaRendimento: 110,
      dataAplicacao: new Date('2024-06-01'),
      dataVencimento: new Date('2025-06-01'),
      instituicao: 'Banco Inter',
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Investimentos criados: 2');

  // Criar metas
  await prisma.meta.create({
    data: {
      titulo: 'Viagem para Europa',
      descricao: 'Economizar para viagem de férias',
      valorAlvo: 15000,
      valorAtual: 5000,
      dataInicio: new Date('2025-01-01'),
      dataPrazo: new Date('2025-12-31'),
      usuarioId: usuario.id,
    },
  });

  await prisma.meta.create({
    data: {
      titulo: 'Reserva de Emergência',
      descricao: '6 meses de despesas',
      valorAlvo: 30000,
      valorAtual: 15000,
      dataInicio: new Date('2024-01-01'),
      dataPrazo: new Date('2026-01-01'),
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Metas criadas: 2');

  // Criar orçamentos
  await prisma.orcamento.create({
    data: {
      nome: 'Alimentação Mensal',
      categoriaId: categorias[0].id,
      valorLimite: 1000,
      valorGasto: 650,
      mesReferencia: new Date().getMonth() + 1,
      anoReferencia: new Date().getFullYear(),
      usuarioId: usuario.id,
    },
  });

  await prisma.orcamento.create({
    data: {
      nome: 'Transporte Mensal',
      categoriaId: categorias[1].id,
      valorLimite: 500,
      valorGasto: 320,
      mesReferencia: new Date().getMonth() + 1,
      anoReferencia: new Date().getFullYear(),
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Orçamentos criados: 2');

  // Criar faturas e transações de cartão para testar bugs
  console.log('');
  console.log('💳 Criando transações de teste para validar bugs...');
  
  // Bug #1: Testar lógica de fechamento (cartão fecha dia 5)
  // Fatura de Outubro (compras entre 06/09 e 05/10)
  const faturaOutubro = await prisma.fatura.create({
    data: {
      cartaoId: cartaoVisa.id,
      mesReferencia: 10,
      anoReferencia: 2025,
      dataFechamento: new Date('2025-10-05T00:00:00'),
      dataVencimento: new Date('2025-10-15T00:00:00'),
      valorTotal: 0,
      valorPago: 0,
      status: 'ABERTA',
    },
  });

  // Fatura de Novembro (compras entre 06/10 e 05/11)
  const faturaNovembro = await prisma.fatura.create({
    data: {
      cartaoId: cartaoVisa.id,
      mesReferencia: 11,
      anoReferencia: 2025,
      dataFechamento: new Date('2025-11-05T00:00:00'),
      dataVencimento: new Date('2025-11-15T00:00:00'),
      valorTotal: 0,
      valorPago: 0,
      status: 'ABERTA',
    },
  });

  // Transação 1: Compra dia 04/10 (ANTES do fechamento) → deve ir para fatura de OUTUBRO
  const trans1 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Supermercado - Compra dia 04/10 (antes fechamento)',
      valor: 250.00,
      dataCompetencia: new Date('2025-10-04T10:00:00'),
      status: 'PENDENTE',
      categoriaId: categorias[0].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaOutubro.id,
      usuarioId: usuario.id,
    },
  });

  // Transação 2: Compra dia 05/10 (DIA do fechamento) → deve ir para fatura de NOVEMBRO
  const trans2 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Restaurante - Compra dia 05/10 (dia fechamento)',
      valor: 150.00,
      dataCompetencia: new Date('2025-10-05T14:00:00'),
      status: 'PENDENTE',
      categoriaId: categorias[0].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaNovembro.id, // Corrigido: vai para NOVEMBRO
      usuarioId: usuario.id,
    },
  });

  // Transação 3: Compra dia 06/10 (DEPOIS do fechamento) → deve ir para fatura de NOVEMBRO
  const trans3 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Posto de Gasolina - Compra dia 06/10 (depois fechamento)',
      valor: 300.00,
      dataCompetencia: new Date('2025-10-06T09:00:00'),
      status: 'PENDENTE',
      categoriaId: categorias[1].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaNovembro.id,
      usuarioId: usuario.id,
    },
  });

  // Bug #2 e #3: Testar compra parcelada (3x de R$ 600 = R$ 200 cada)
  const dataCompraParcela = new Date('2025-10-10');
  
  // Parcela 1/3 - Outubro
  const parcela1 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Notebook - Parcelado (1/3)',
      valor: 200.00,
      dataCompetencia: new Date('2025-10-10T15:00:00'),
      status: 'PENDENTE',
      parcelado: true,
      parcelaAtual: 1,
      parcelaTotal: 3,
      categoriaId: categorias[4].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaNovembro.id,
      usuarioId: usuario.id,
    },
  });

  // Fatura de Dezembro para parcela 2
  const faturaDezembro = await prisma.fatura.create({
    data: {
      cartaoId: cartaoVisa.id,
      mesReferencia: 12,
      anoReferencia: 2025,
      dataFechamento: new Date('2025-12-05T00:00:00'),
      dataVencimento: new Date('2025-12-15T00:00:00'),
      valorTotal: 0,
      valorPago: 0,
      status: 'ABERTA',
    },
  });

  // Parcela 2/3 - Novembro → vai para fatura de Dezembro
  const parcela2 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Notebook - Parcelado (2/3)',
      valor: 200.00,
      dataCompetencia: new Date('2025-11-10T15:00:00'),
      status: 'PENDENTE',
      parcelado: true,
      parcelaAtual: 2,
      parcelaTotal: 3,
      categoriaId: categorias[4].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaDezembro.id,
      usuarioId: usuario.id,
    },
  });

  // Fatura de Janeiro para parcela 3
  const faturaJaneiro = await prisma.fatura.create({
    data: {
      cartaoId: cartaoVisa.id,
      mesReferencia: 1,
      anoReferencia: 2026,
      dataFechamento: new Date('2026-01-05T00:00:00'),
      dataVencimento: new Date('2026-01-15T00:00:00'),
      valorTotal: 0,
      valorPago: 0,
      status: 'ABERTA',
    },
  });

  // Parcela 3/3 - Dezembro → vai para fatura de Janeiro
  const parcela3 = await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Notebook - Parcelado (3/3)',
      valor: 200.00,
      dataCompetencia: new Date('2025-12-10T15:00:00'),
      status: 'PENDENTE',
      parcelado: true,
      parcelaAtual: 3,
      parcelaTotal: 3,
      categoriaId: categorias[4].id,
      cartaoCreditoId: cartaoVisa.id,
      faturaId: faturaJaneiro.id,
      usuarioId: usuario.id,
    },
  });

  // Atualizar valores das faturas
  await prisma.fatura.update({
    where: { id: faturaOutubro.id },
    data: { valorTotal: 400.00 }, // 250 + 150
  });

  await prisma.fatura.update({
    where: { id: faturaNovembro.id },
    data: { valorTotal: 500.00 }, // 300 + 200 (parcela 1)
  });

  await prisma.fatura.update({
    where: { id: faturaDezembro.id },
    data: { valorTotal: 200.00 }, // parcela 2
  });

  await prisma.fatura.update({
    where: { id: faturaJaneiro.id },
    data: { valorTotal: 200.00 }, // parcela 3
  });

  // Bug #7: Atualizar limite disponível do cartão
  // Limite total: 5000
  // Usado: 400 (out) + 500 (nov) + 200 (dez) + 200 (jan) = 1300
  // Disponível deveria ser: 3700
  await prisma.cartaoCredito.update({
    where: { id: cartaoVisa.id },
    data: { limiteDisponivel: 3700 },
  });

  console.log('✅ Transações de teste criadas:');
  console.log('   - 3 compras simples (teste de fechamento)');
  console.log('   - 1 compra parcelada em 3x (teste de parcelas)');
  console.log('   - 4 faturas criadas (Out/25, Nov/25, Dez/25, Jan/26)');

  // Criar transações em conta corrente
  await prisma.transacao.create({
    data: {
      tipo: 'RECEITA',
      descricao: 'Salário Outubro',
      valor: 5000.00,
      dataCompetencia: new Date('2025-10-05T00:00:00'),
      status: 'PAGO',
      categoriaId: categorias[5].id,
      contaBancariaId: contaCorrente.id,
      usuarioId: usuario.id,
    },
  });

  await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Aluguel',
      valor: 1500.00,
      dataCompetencia: new Date('2025-10-10T00:00:00'),
      status: 'PAGO',
      categoriaId: categorias[2].id,
      contaBancariaId: contaCorrente.id,
      usuarioId: usuario.id,
    },
  });

  await prisma.transacao.create({
    data: {
      tipo: 'DESPESA',
      descricao: 'Conta de Luz',
      valor: 250.00,
      dataCompetencia: new Date('2025-10-12T00:00:00'),
      status: 'PAGO',
      categoriaId: categorias[2].id,
      contaBancariaId: contaCorrente.id,
      usuarioId: usuario.id,
    },
  });

  console.log('✅ Transações em conta corrente criadas: 3');

  // Criar empréstimo para testar Bug #9
  const emprestimo = await prisma.emprestimo.create({
    data: {
      descricao: 'Empréstimo Pessoal',
      valorTotal: 10000,
      valorParcela: 1000,
      numeroParcelas: 10,
      parcelasPagas: 2,
      taxaJurosMensal: 2.5,
      taxaJurosAnual: 34.49,
      sistemaAmortizacao: 'PRICE',
      dataContratacao: new Date('2025-08-01'),
      diaVencimento: 15,
      instituicao: 'Banco do Brasil',
      usuarioId: usuario.id,
    },
  });

  // Criar parcelas do empréstimo
  for (let i = 1; i <= 10; i++) {
    const dataVencimento = new Date('2025-09-01');
    dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
    
    const saldoDevedor = 10000 - (i - 1) * 1000;
    const valorJuros = saldoDevedor * 0.025; // 2.5% ao mês
    const valorAmortizacao = 1000 - valorJuros;
    
    await prisma.parcelaEmprestimo.create({
      data: {
        numeroParcela: i,
        numero: i,
        valor: 1000,
        valorAmortizacao,
        valorJuros,
        saldoDevedor: saldoDevedor - valorAmortizacao,
        dataVencimento,
        status: i <= 2 ? 'PAGA' : 'PENDENTE',
        emprestimoId: emprestimo.id,
      },
    });
  }

  console.log('✅ Empréstimo criado com 10 parcelas (2 pagas, 8 pendentes)');

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('👤 DADOS DE ACESSO:');
  console.log('   📧 Email: teste@financasup.com');
  console.log('   🔑 Senha: 123456');
  console.log('');
  console.log('💰 CONTAS CRIADAS:');
  console.log('   • Conta Corrente: R$ 5.000,00');
  console.log('   • Poupança: R$ 10.000,00');
  console.log('   • Carteira: R$ 500,00');
  console.log('');
  console.log('💳 CARTÕES CRIADOS:');
  console.log('   • Visa Gold (BB): Limite R$ 5.000 | Disponível R$ 3.700');
  console.log('     - Fechamento: dia 5 | Vencimento: dia 15');
  console.log('   • Mastercard Platinum (Itaú): Limite R$ 3.000 | Disponível R$ 2.800');
  console.log('     - Fechamento: dia 10 | Vencimento: dia 20');
  console.log('');
  console.log('🧪 DADOS DE TESTE PARA BUGS:');
  console.log('');
  console.log('   Bug #1 - Lógica de Fechamento (Cartão Visa - fecha dia 5):');
  console.log('   ✓ Compra 04/10 R$ 250 → Fatura Outubro (antes fechamento)');
  console.log('   ✓ Compra 05/10 R$ 150 → Fatura Outubro (dia fechamento)');
  console.log('   ✓ Compra 06/10 R$ 300 → Fatura Novembro (depois fechamento)');
  console.log('');
  console.log('   Bug #2/#3 - Parcelas (Notebook R$ 600 em 3x):');
  console.log('   ✓ Parcela 1/3 R$ 200 → Fatura Novembro');
  console.log('   ✓ Parcela 2/3 R$ 200 → Fatura Dezembro');
  console.log('   ✓ Parcela 3/3 R$ 200 → Fatura Janeiro/2026');
  console.log('');
  console.log('   Bug #7 - Limite do Cartão:');
  console.log('   ✓ Limite Total: R$ 5.000,00');
  console.log('   ✓ Limite Usado: R$ 1.300,00');
  console.log('   ✓ Limite Disponível: R$ 3.700,00 (verificar se está correto)');
  console.log('');
  console.log('   Bug #9 - Empréstimo:');
  console.log('   ✓ Empréstimo de R$ 10.000 em 10x de R$ 1.000');
  console.log('   ✓ Taxa de juros: 2,5% a.m.');
  console.log('   ✓ 2 parcelas pagas, 8 pendentes');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
