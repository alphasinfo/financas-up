/**
 * Script para gerar dados de teste realistas
 * 
 * Gera:
 * - Usuário de teste
 * - Contas bancárias
 * - Cartões de crédito
 * - Categorias personalizadas
 * - Transações dos últimos 12 meses
 * - Empréstimos
 * - Investimentos
 * - Metas financeiras
 * - Orçamentos
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Dados do usuário de teste
const USUARIO_TESTE = {
  email: 'teste@financasup.com',
  senha: 'Teste@123',
  nome: 'Usuário Teste',
};

// Categorias padrão
const CATEGORIAS = {
  receitas: [
    { nome: 'Salário', cor: '#10B981', icone: '💰' },
    { nome: 'Freelance', cor: '#3B82F6', icone: '💻' },
    { nome: 'Investimentos', cor: '#8B5CF6', icone: '📈' },
    { nome: 'Aluguel Recebido', cor: '#F59E0B', icone: '🏠' },
    { nome: 'Vendas', cor: '#EC4899', icone: '🛍️' },
  ],
  despesas: [
    { nome: 'Alimentação', cor: '#EF4444', icone: '🍔' },
    { nome: 'Transporte', cor: '#F59E0B', icone: '🚗' },
    { nome: 'Moradia', cor: '#8B5CF6', icone: '🏠' },
    { nome: 'Saúde', cor: '#10B981', icone: '🏥' },
    { nome: 'Educação', cor: '#3B82F6', icone: '📚' },
    { nome: 'Lazer', cor: '#EC4899', icone: '🎮' },
    { nome: 'Compras', cor: '#F97316', icone: '🛒' },
    { nome: 'Contas', cor: '#6366F1', icone: '📄' },
    { nome: 'Assinaturas', cor: '#14B8A6', icone: '📱' },
    { nome: 'Outros', cor: '#64748B', icone: '📦' },
  ],
};

// Contas bancárias
const CONTAS = [
  {
    nome: 'Nubank',
    banco: 'Nubank',
    tipo: 'CORRENTE' as const,
    saldoInicial: 5000,
    cor: '#8A05BE',
  },
  {
    nome: 'Inter',
    banco: 'Banco Inter',
    tipo: 'CORRENTE' as const,
    saldoInicial: 3000,
    cor: '#FF7A00',
  },
  {
    nome: 'Poupança Caixa',
    banco: 'Caixa Econômica',
    tipo: 'POUPANCA' as const,
    saldoInicial: 10000,
    cor: '#0066B3',
  },
];

// Cartões de crédito
const CARTOES = [
  {
    nome: 'Nubank Mastercard',
    banco: 'Nubank',
    bandeira: 'Mastercard',
    limiteTotal: 5000,
    diaFechamento: 10,
    diaVencimento: 20,
    cor: '#8A05BE',
  },
  {
    nome: 'Inter Visa',
    banco: 'Banco Inter',
    bandeira: 'Visa',
    limiteTotal: 3000,
    diaFechamento: 15,
    diaVencimento: 25,
    cor: '#FF7A00',
  },
];

// Função para gerar data aleatória nos últimos N meses
function gerarDataAleatoria(mesesAtras: number = 12): Date {
  const hoje = new Date();
  const dataInicio = new Date(hoje);
  dataInicio.setMonth(dataInicio.getMonth() - mesesAtras);
  
  const timestamp = dataInicio.getTime() + Math.random() * (hoje.getTime() - dataInicio.getTime());
  return new Date(timestamp);
}

// Função para gerar valor aleatório
function gerarValor(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Padrões de transações realistas
const PADROES_TRANSACOES = {
  receitas: [
    { descricao: 'Salário', valor: [3000, 8000], frequencia: 'mensal' },
    { descricao: 'Freelance - Projeto', valor: [500, 3000], frequencia: 'ocasional' },
    { descricao: 'Dividendos', valor: [50, 500], frequencia: 'mensal' },
  ],
  despesas: [
    // Fixas mensais
    { descricao: 'Aluguel', valor: [800, 2000], categoria: 'Moradia', frequencia: 'mensal' },
    { descricao: 'Condomínio', valor: [200, 600], categoria: 'Moradia', frequencia: 'mensal' },
    { descricao: 'Energia Elétrica', valor: [80, 300], categoria: 'Contas', frequencia: 'mensal' },
    { descricao: 'Água', valor: [40, 150], categoria: 'Contas', frequencia: 'mensal' },
    { descricao: 'Internet', valor: [80, 150], categoria: 'Contas', frequencia: 'mensal' },
    { descricao: 'Plano de Saúde', valor: [300, 800], categoria: 'Saúde', frequencia: 'mensal' },
    { descricao: 'Netflix', valor: [30, 60], categoria: 'Assinaturas', frequencia: 'mensal' },
    { descricao: 'Spotify', valor: [15, 30], categoria: 'Assinaturas', frequencia: 'mensal' },
    
    // Variáveis
    { descricao: 'Supermercado', valor: [150, 500], categoria: 'Alimentação', frequencia: 'semanal' },
    { descricao: 'Restaurante', valor: [30, 150], categoria: 'Alimentação', frequencia: 'frequente' },
    { descricao: 'Uber/99', valor: [15, 80], categoria: 'Transporte', frequencia: 'frequente' },
    { descricao: 'Combustível', valor: [100, 300], categoria: 'Transporte', frequencia: 'semanal' },
    { descricao: 'Farmácia', valor: [20, 200], categoria: 'Saúde', frequencia: 'ocasional' },
    { descricao: 'Academia', valor: [80, 200], categoria: 'Saúde', frequencia: 'mensal' },
    { descricao: 'Cinema', valor: [30, 80], categoria: 'Lazer', frequencia: 'ocasional' },
    { descricao: 'Compras Online', valor: [50, 500], categoria: 'Compras', frequencia: 'ocasional' },
  ],
};

async function main() {
  console.log('🚀 Iniciando geração de dados de teste...\n');

  // 1. Criar usuário de teste
  console.log('👤 Criando usuário de teste...');
  const senhaHash = await hash(USUARIO_TESTE.senha, 10);
  
  let usuario = await prisma.usuario.findUnique({
    where: { email: USUARIO_TESTE.email },
  });

  if (usuario) {
    console.log('⚠️  Usuário já existe, limpando dados antigos...');
    
    // Limpar dados antigos
    await prisma.transacao.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.fatura.deleteMany({ where: { cartao: { usuarioId: usuario.id } } });
    await prisma.cartaoCredito.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.contaBancaria.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.categoria.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.emprestimo.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.investimento.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.meta.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.orcamento.deleteMany({ where: { usuarioId: usuario.id } });
  } else {
    usuario = await prisma.usuario.create({
      data: {
        email: USUARIO_TESTE.email,
        senha: senhaHash,
        nome: USUARIO_TESTE.nome,
      },
    });
  }

  console.log(`✅ Usuário criado: ${usuario.email}\n`);

  // 2. Criar categorias
  console.log('📁 Criando categorias...');
  const categoriasReceitas = await Promise.all(
    CATEGORIAS.receitas.map(cat =>
      prisma.categoria.create({
        data: {
          nome: cat.nome,
          tipo: 'RECEITA',
          cor: cat.cor,
          usuarioId: usuario.id,
        },
      })
    )
  );

  const categoriasDespesas = await Promise.all(
    CATEGORIAS.despesas.map(cat =>
      prisma.categoria.create({
        data: {
          nome: cat.nome,
          tipo: 'DESPESA',
          cor: cat.cor,
          usuarioId: usuario.id,
        },
      })
    )
  );

  console.log(`✅ ${categoriasReceitas.length + categoriasDespesas.length} categorias criadas\n`);

  // 3. Criar contas bancárias
  console.log('🏦 Criando contas bancárias...');
  const contas = await Promise.all(
    CONTAS.map(conta =>
      prisma.contaBancaria.create({
        data: {
          nome: conta.nome,
          instituicao: conta.banco,
          tipo: conta.tipo,
          saldoInicial: conta.saldoInicial,
          saldoAtual: conta.saldoInicial,
          saldoDisponivel: conta.saldoInicial,
          cor: conta.cor,
          usuarioId: usuario.id,
        },
      })
    )
  );

  console.log(`✅ ${contas.length} contas criadas\n`);

  // 4. Criar cartões de crédito
  console.log('💳 Criando cartões de crédito...');
  const cartoes = await Promise.all(
    CARTOES.map(cartao =>
      prisma.cartaoCredito.create({
        data: {
          nome: cartao.nome,
          banco: cartao.banco,
          bandeira: cartao.bandeira,
          limiteTotal: cartao.limiteTotal,
          limiteDisponivel: cartao.limiteTotal,
          diaFechamento: cartao.diaFechamento,
          diaVencimento: cartao.diaVencimento,
          cor: cartao.cor,
          usuarioId: usuario.id,
        },
      })
    )
  );

  console.log(`✅ ${cartoes.length} cartões criados\n`);

  // 5. Gerar transações dos últimos 12 meses
  console.log('💰 Gerando transações dos últimos 12 meses...');
  let totalTransacoes = 0;

  // Receitas mensais (salário)
  for (let mes = 0; mes < 12; mes++) {
    const data = new Date();
    data.setMonth(data.getMonth() - mes);
    data.setDate(5); // Dia 5 de cada mês

    const categoriaSalario = categoriasReceitas.find(c => c.nome === 'Salário');
    const contaPrincipal = contas[0];

    await prisma.transacao.create({
      data: {
        descricao: 'Salário',
        valor: gerarValor(5000, 7000),
        tipo: 'RECEITA',
        status: 'RECEBIDO',
        dataCompetencia: data,
        dataLiquidacao: data,
        categoriaId: categoriaSalario?.id,
        contaBancariaId: contaPrincipal.id,
        usuarioId: usuario.id,
      },
    });
    totalTransacoes++;
  }

  // Despesas variadas
  for (let i = 0; i < 200; i++) {
    const padrao = PADROES_TRANSACOES.despesas[Math.floor(Math.random() * PADROES_TRANSACOES.despesas.length)];
    const categoria = categoriasDespesas.find(c => c.nome === padrao.categoria);
    const data = gerarDataAleatoria(12);
    
    // 70% nas contas, 30% no cartão
    const usarCartao = Math.random() > 0.7;
    
    if (usarCartao && cartoes.length > 0) {
      const cartao = cartoes[Math.floor(Math.random() * cartoes.length)];
      
      await prisma.transacao.create({
        data: {
          descricao: padrao.descricao,
          valor: gerarValor(padrao.valor[0], padrao.valor[1]),
          tipo: 'DESPESA',
          status: 'PENDENTE',
          dataCompetencia: data,
          categoriaId: categoria?.id,
          cartaoCreditoId: cartao.id,
          usuarioId: usuario.id,
        },
      });
    } else {
      const conta = contas[Math.floor(Math.random() * contas.length)];
      
      await prisma.transacao.create({
        data: {
          descricao: padrao.descricao,
          valor: gerarValor(padrao.valor[0], padrao.valor[1]),
          tipo: 'DESPESA',
          status: 'PAGO',
          dataCompetencia: data,
          dataLiquidacao: data,
          categoriaId: categoria?.id,
          contaBancariaId: conta.id,
          usuarioId: usuario.id,
        },
      });
    }
    totalTransacoes++;
  }

  console.log(`✅ ${totalTransacoes} transações criadas\n`);

  // 6. Criar empréstimos
  console.log('💵 Criando empréstimos...');
  await prisma.emprestimo.create({
    data: {
      descricao: 'Empréstimo Pessoal',
      valorTotal: 10000,
      valorParcela: 500,
      numeroParcelas: 20,
      parcelasPagas: 5,
      taxaJurosMensal: 1.5,
      dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 5)),
      status: 'ATIVO',
      usuarioId: usuario.id,
    },
  });

  console.log('✅ 1 empréstimo criado\n');

  // 7. Criar investimentos
  console.log('📈 Criando investimentos...');
  await prisma.investimento.create({
    data: {
      nome: 'Tesouro Selic 2027',
      tipo: 'RENDA_FIXA',
      valorInvestido: 5000,
      valorAtual: 5250,
      rentabilidadeAnual: 12.5,
      dataAplicacao: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      usuarioId: usuario.id,
    },
  });

  await prisma.investimento.create({
    data: {
      nome: 'Ações PETR4',
      tipo: 'ACOES',
      valorInvestido: 3000,
      valorAtual: 3450,
      rentabilidadeAnual: 18.0,
      dataAplicacao: new Date(new Date().setMonth(new Date().getMonth() - 8)),
      usuarioId: usuario.id,
    },
  });

  console.log('✅ 2 investimentos criados\n');

  // 8. Criar metas
  console.log('🎯 Criando metas financeiras...');
  await prisma.meta.create({
    data: {
      nome: 'Viagem para Europa',
      valorAlvo: 15000,
      valorAtual: 5000,
      dataAlvo: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      usuarioId: usuario.id,
    },
  });

  await prisma.meta.create({
    data: {
      nome: 'Reserva de Emergência',
      valorAlvo: 30000,
      valorAtual: 15000,
      dataAlvo: new Date(new Date().setMonth(new Date().getMonth() + 18)),
      usuarioId: usuario.id,
    },
  });

  console.log('✅ 2 metas criadas\n');

  // 9. Criar orçamentos
  console.log('📊 Criando orçamentos...');
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  for (const catDespesa of categoriasDespesas) {
    await prisma.orcamento.create({
      data: {
        categoriaId: catDespesa.id,
        valorLimite: gerarValor(300, 1500),
        mes: mesAtual,
        ano: anoAtual,
        usuarioId: usuario.id,
      },
    });
  }

  console.log(`✅ ${categoriasDespesas.length} orçamentos criados\n`);

  console.log('🎉 Dados de teste gerados com sucesso!\n');
  console.log('📧 Email: teste@financasup.com');
  console.log('🔑 Senha: Teste@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao gerar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
