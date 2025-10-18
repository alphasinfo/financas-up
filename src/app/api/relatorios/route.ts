import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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

    return NextResponse.json({
      receitasMes,
      despesasMes,
      saldoMes,
      receitasPorCategoria,
      despesasPorCategoria,
      evolucaoMensal,
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
