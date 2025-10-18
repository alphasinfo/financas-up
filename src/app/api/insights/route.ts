import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarInsightsFinanceiros } from "@/lib/openai";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesAno = searchParams.get("mesAno");

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
      },
      orderBy: {
        valor: "desc",
      },
    });

    // Calcular totais
    const receitas = transacoes
      .filter((t) => t.tipo === "RECEITA")
      .reduce((acc, t) => acc + t.valor, 0);

    const despesas = transacoes
      .filter((t) => t.tipo === "DESPESA")
      .reduce((acc, t) => acc + t.valor, 0);

    const saldo = receitas - despesas;

    // Agrupar despesas por categoria
    const categorias = transacoes
      .filter((t) => t.tipo === "DESPESA" && t.categoria)
      .reduce((acc: any[], t) => {
        const categoriaExistente = acc.find(
          (c) => c.nome === t.categoria!.nome
        );
        if (categoriaExistente) {
          categoriaExistente.valor += t.valor;
        } else {
          acc.push({
            nome: t.categoria!.nome,
            valor: t.valor,
          });
        }
        return acc;
      }, []);

    // Preparar dados para IA
    const dadosFinanceiros = {
      receitas,
      despesas,
      saldo,
      categorias,
      transacoes: transacoes.map((t) => ({
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
      })),
    };

    // Gerar insights com IA
    const insights = await gerarInsightsFinanceiros(dadosFinanceiros);

    return NextResponse.json({
      insights,
      resumo: {
        receitas,
        despesas,
        saldo,
        categorias,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
