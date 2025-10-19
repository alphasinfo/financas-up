import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesAno = searchParams.get("mesAno");
    
    console.log('📊 Buscando relatórios:', { usuarioId: session.user.id, mesAno });

    let inicioMes: Date;
    let fimMes: Date;

    if (mesAno) {
      const [ano, mes] = mesAno.split("-").map(Number);
      inicioMes = new Date(ano, mes - 1, 1);
      fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);
    } else {
      inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      fimMes = new Date();
      fimMes.setMonth(fimMes.getMonth() + 1);
      fimMes.setDate(0);
      fimMes.setHours(23, 59, 59, 999);
    }

    // Buscar transações do período
    const transacoes = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        dataCompetencia: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
      include: {
        categoria: true,
        contaBancaria: true,
        cartaoCredito: true,
        fatura: true,
      },
      orderBy: {
        dataCompetencia: 'desc',
      },
    });

    console.log(`✅ Transações encontradas: ${transacoes.length}`);

    // Calcular totais - APENAS transações PAGAS/RECEBIDAS
    const receitasMes = transacoes
      .filter((t) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO"))
      .reduce((acc, t) => acc + t.valor, 0);

    const despesasMes = transacoes
      .filter((t) => t.tipo === "DESPESA" && t.status === "PAGO")
      .reduce((acc, t) => acc + t.valor, 0);

    const saldoMes = receitasMes - despesasMes;

    // Agrupar receitas por categoria - APENAS RECEBIDAS
    const receitasPorCategoria = transacoes
      .filter((t) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO") && t.categoria)
      .reduce((acc: any[], t) => {
        const categoriaExistente = acc.find(
          (c) => c.categoria === t.categoria!.nome
        );
        if (categoriaExistente) {
          categoriaExistente.valor += t.valor;
        } else {
          acc.push({
            categoria: t.categoria!.nome,
            valor: t.valor,
          });
        }
        return acc;
      }, []);

    // Agrupar despesas por categoria - APENAS PAGAS
    const despesasPorCategoria = transacoes
      .filter((t) => t.tipo === "DESPESA" && t.status === "PAGO" && t.categoria)
      .reduce((acc: any[], t) => {
        const categoriaExistente = acc.find(
          (c) => c.categoria === t.categoria!.nome
        );
        if (categoriaExistente) {
          categoriaExistente.valor += t.valor;
        } else {
          acc.push({
            categoria: t.categoria!.nome,
            valor: t.valor,
          });
        }
        return acc;
      }, []);

    // Evolução mensal (últimos 6 meses)
    const evolucaoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - i);
      dataInicio.setDate(1);
      dataInicio.setHours(0, 0, 0, 0);

      const dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + 1);
      dataFim.setDate(0);
      dataFim.setHours(23, 59, 59, 999);

      const transacoesMes = await prisma.transacao.findMany({
        where: {
          usuarioId: session.user.id,
          dataCompetencia: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
      });

      const receitas = transacoesMes
        .filter((t) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO"))
        .reduce((acc, t) => acc + t.valor, 0);

      const despesas = transacoesMes
        .filter((t) => t.tipo === "DESPESA" && t.status === "PAGO")
        .reduce((acc, t) => acc + t.valor, 0);

      evolucaoMensal.push({
        mes: dataInicio.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        }),
        receitas,
        despesas,
      });
    }

    // COMPARAÇÃO COM MÊS ANTERIOR
    const mesAnteriorInicio = new Date(inicioMes);
    mesAnteriorInicio.setMonth(mesAnteriorInicio.getMonth() - 1);
    const mesAnteriorFim = new Date(fimMes);
    mesAnteriorFim.setMonth(mesAnteriorFim.getMonth() - 1);

    const transacoesMesAnterior = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        dataCompetencia: {
          gte: mesAnteriorInicio,
          lte: mesAnteriorFim,
        },
      },
    });

    const receitasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO"))
      .reduce((acc, t) => acc + t.valor, 0);

    const despesasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === "DESPESA" && t.status === "PAGO")
      .reduce((acc, t) => acc + t.valor, 0);

    const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;

    const comparacao = {
      mesAtual: { receitas: receitasMes, despesas: despesasMes, saldo: saldoMes },
      mesAnterior: { receitas: receitasMesAnterior, despesas: despesasMesAnterior, saldo: saldoMesAnterior },
      variacao: {
        receitas: receitasMesAnterior > 0 ? ((receitasMes - receitasMesAnterior) / receitasMesAnterior) * 100 : 0,
        despesas: despesasMesAnterior > 0 ? ((despesasMes - despesasMesAnterior) / despesasMesAnterior) * 100 : 0,
        saldo: saldoMesAnterior !== 0 ? ((saldoMes - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100 : 0,
      },
    };

    // PREVISÕES (baseadas na média dos últimos 3 meses)
    const previsoes = [];
    const mediaReceitas = evolucaoMensal.slice(-3).reduce((acc, m) => acc + m.receitas, 0) / 3;
    const mediaDespesas = evolucaoMensal.slice(-3).reduce((acc, m) => acc + m.despesas, 0) / 3;

    for (let i = 1; i <= 3; i++) {
      const dataPrevisao = new Date();
      dataPrevisao.setMonth(dataPrevisao.getMonth() + i);
      
      previsoes.push({
        mes: dataPrevisao.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        receitaPrevista: mediaReceitas,
        despesaPrevista: mediaDespesas,
        saldoPrevisto: mediaReceitas - mediaDespesas,
        confianca: 70 - (i * 10), // Confiança diminui com o tempo
      });
    }

    // INSIGHTS AUTOMÁTICOS
    const insights = [];

    // Insight 1: Comparação com mês anterior
    if (saldoMes > saldoMesAnterior) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Saldo melhorou!',
        descricao: `Seu saldo aumentou ${Math.abs(comparacao.variacao.saldo).toFixed(1)}% em relação ao mês anterior`,
        valor: saldoMes - saldoMesAnterior,
      });
    } else if (saldoMes < saldoMesAnterior) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Saldo piorou',
        descricao: `Seu saldo diminuiu ${Math.abs(comparacao.variacao.saldo).toFixed(1)}% em relação ao mês anterior`,
        valor: saldoMes - saldoMesAnterior,
      });
    }

    // Insight 2: Categoria com mais gastos
    if (despesasPorCategoria.length > 0) {
      const maiorGasto = despesasPorCategoria.reduce((max, cat) => cat.valor > max.valor ? cat : max);
      const percentual = (maiorGasto.valor / despesasMes) * 100;
      
      insights.push({
        tipo: 'neutro',
        titulo: `Maior gasto: ${maiorGasto.categoria}`,
        descricao: `Representa ${percentual.toFixed(1)}% das suas despesas`,
        valor: maiorGasto.valor,
      });
    }

    // Insight 3: Economia ou déficit
    if (saldoMes > 0) {
      const taxaEconomia = (saldoMes / receitasMes) * 100;
      insights.push({
        tipo: 'positivo',
        titulo: `Você economizou ${taxaEconomia.toFixed(1)}%`,
        descricao: `Das suas receitas, você conseguiu economizar ${taxaEconomia.toFixed(1)}%`,
        valor: saldoMes,
      });
    } else if (saldoMes < 0) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Déficit no mês',
        descricao: 'Suas despesas superaram as receitas',
        valor: Math.abs(saldoMes),
      });
    }

    // Insight 4: Tendência de gastos
    if (evolucaoMensal.length >= 3) {
      const ultimos3Meses = evolucaoMensal.slice(-3);
      const tendencia = ultimos3Meses[2].despesas - ultimos3Meses[0].despesas;
      
      if (tendencia > 0) {
        insights.push({
          tipo: 'negativo',
          titulo: 'Gastos em alta',
          descricao: 'Suas despesas aumentaram nos últimos 3 meses',
          valor: tendencia,
        });
      } else if (tendencia < 0) {
        insights.push({
          tipo: 'positivo',
          titulo: 'Gastos em queda',
          descricao: 'Suas despesas diminuíram nos últimos 3 meses',
          valor: Math.abs(tendencia),
        });
      }
    }

    return NextResponse.json({
      receitasMes,
      despesasMes,
      saldoMes,
      receitasPorCategoria,
      despesasPorCategoria,
      evolucaoMensal,
      comparacao,
      previsoes,
      insights,
      transacoes: transacoes.map((t) => ({
        id: t.id,
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        status: t.status,
        dataCompetencia: t.dataCompetencia,
        categoria: t.categoria,
      })),
    });
  } catch (error: any) {
    console.error("Erro ao gerar relatórios:", error);
    console.error("Stack:", error?.stack);
    console.error("Message:", error?.message);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        detalhes: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
