import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const dados = await request.json();

    // Validar estrutura básica
    if (!dados.versao || !dados.dados) {
      return NextResponse.json(
        { error: "Formato de arquivo inválido" },
        { status: 400 }
      );
    }

    let importados = {
      contas: 0,
      cartoes: 0,
      transacoes: 0,
      categorias: 0,
      emprestimos: 0,
      investimentos: 0,
      orcamentos: 0,
      metas: 0,
    };

    // Importar categorias primeiro (são referenciadas por outros)
    if (dados.dados.categorias && Array.isArray(dados.dados.categorias)) {
      const mapCategorias = new Map();
      
      for (const cat of dados.dados.categorias) {
        const novaCat = await prisma.categoria.create({
          data: {
            nome: cat.nome,
            tipo: cat.tipo,
            cor: cat.cor,
            icone: cat.icone,
            usuarioId: session.user.id,
          },
        });
        mapCategorias.set(cat.id, novaCat.id);
        importados.categorias++;
      }
    }

    // Importar contas
    if (dados.dados.contas && Array.isArray(dados.dados.contas)) {
      const mapContas = new Map();
      
      for (const conta of dados.dados.contas) {
        const novaConta = await prisma.contaBancaria.create({
          data: {
            nome: conta.nome,
            instituicao: conta.instituicao,
            agencia: conta.agencia,
            numero: conta.numero,
            tipo: conta.tipo,
            saldoInicial: conta.saldoInicial,
            saldoAtual: conta.saldoAtual,
            saldoDisponivel: conta.saldoDisponivel,
            cor: conta.cor,
            ativa: conta.ativa ?? true,
            usuarioId: session.user.id,
          },
        });
        mapContas.set(conta.id, novaConta.id);
        importados.contas++;
      }
    }

    // Importar cartões
    if (dados.dados.cartoes && Array.isArray(dados.dados.cartoes)) {
      for (const cartao of dados.dados.cartoes) {
        await prisma.cartaoCredito.create({
          data: {
            nome: cartao.nome,
            banco: cartao.banco,
            bandeira: cartao.bandeira,
            apelido: cartao.apelido,
            numeroMascara: cartao.numeroMascara,
            limiteTotal: cartao.limiteTotal,
            limiteDisponivel: cartao.limiteDisponivel,
            diaFechamento: cartao.diaFechamento,
            diaVencimento: cartao.diaVencimento,
            cor: cartao.cor,
            ativo: cartao.ativo ?? true,
            usuarioId: session.user.id,
          },
        });
        importados.cartoes++;
      }
    }

    // Importar empréstimos
    if (dados.dados.emprestimos && Array.isArray(dados.dados.emprestimos)) {
      for (const emp of dados.dados.emprestimos) {
        await prisma.emprestimo.create({
          data: {
            instituicao: emp.instituicao || "Não informado",
            descricao: emp.descricao,
            valorTotal: emp.valorTotal,
            valorParcela: emp.valorParcela,
            numeroParcelas: emp.numeroParcelas,
            parcelasPagas: emp.parcelasPagas || 0,
            taxaJurosMensal: emp.taxaJurosMensal || emp.taxaJuros || null,
            taxaJurosAnual: emp.taxaJurosAnual || null,
            sistemaAmortizacao: emp.sistemaAmortizacao || "PRICE",
            dataContratacao: emp.dataContratacao || emp.dataInicio,
            diaVencimento: emp.diaVencimento || 10,
            status: emp.status || "ATIVO",
            usuarioId: session.user.id,
          },
        });
        importados.emprestimos++;
      }
    }

    // Importar investimentos
    if (dados.dados.investimentos && Array.isArray(dados.dados.investimentos)) {
      for (const inv of dados.dados.investimentos) {
        await prisma.investimento.create({
          data: {
            nome: inv.nome,
            tipo: inv.tipo,
            valorAplicado: inv.valorAplicado || inv.valorInvestido,
            valorAtual: inv.valorAtual,
            taxaRendimento: inv.taxaRendimento || inv.rentabilidade,
            dataAplicacao: inv.dataAplicacao || inv.dataInicio,
            dataVencimento: inv.dataVencimento,
            instituicao: inv.instituicao,
            observacoes: inv.observacoes,
            usuarioId: session.user.id,
          },
        });
        importados.investimentos++;
      }
    }

    // Importar orçamentos
    if (dados.dados.orcamentos && Array.isArray(dados.dados.orcamentos)) {
      for (const orc of dados.dados.orcamentos) {
        await prisma.orcamento.create({
          data: {
            nome: orc.nome,
            valorLimite: orc.valorLimite || orc.valor,
            valorGasto: orc.valorGasto || 0,
            mesReferencia: orc.mesReferencia || orc.mes,
            anoReferencia: orc.anoReferencia || orc.ano,
            categoriaId: orc.categoriaId,
            usuarioId: session.user.id,
          },
        });
        importados.orcamentos++;
      }
    }

    // Importar metas
    if (dados.dados.metas && Array.isArray(dados.dados.metas)) {
      for (const meta of dados.dados.metas) {
        await prisma.meta.create({
          data: {
            titulo: meta.titulo || meta.nome,
            descricao: meta.descricao,
            valorAlvo: meta.valorAlvo,
            valorAtual: meta.valorAtual || 0,
            dataInicio: meta.dataInicio || new Date(),
            dataPrazo: meta.dataPrazo || meta.dataAlvo,
            status: meta.status || "EM_ANDAMENTO",
            usuarioId: session.user.id,
          },
        });
        importados.metas++;
      }
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Dados importados com sucesso",
      importados,
    });
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return NextResponse.json(
      { error: "Erro ao importar dados" },
      { status: 500 }
    );
  }
}
