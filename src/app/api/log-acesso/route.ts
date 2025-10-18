import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Listar logs de acesso
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filtro = searchParams.get("filtro") || "TODOS";
    const periodo = parseInt(searchParams.get("periodo") || "30");

    // Calcular data inicial baseado no período
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - periodo);

    // Buscar logs (simulado - você pode criar uma tabela de logs se necessário)
    // Por enquanto, vou retornar logs baseados nas transações como exemplo
    const logs = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        criadoEm: {
          gte: dataInicial,
        },
      },
      select: {
        id: true,
        tipo: true,
        descricao: true,
        valor: true,
        criadoEm: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      take: 100,
    });

    // Transformar em formato de log
    const logsFormatados = logs.map(log => ({
      id: log.id,
      tipo: log.tipo === 'RECEITA' ? 'CRIACAO' : 'EDICAO',
      descricao: `${log.tipo}: ${log.descricao}`,
      valor: log.valor,
      data: log.criadoEm,
      usuario: session.user.name,
    }));

    return NextResponse.json(logsFormatados);
  } catch (error: any) {
    console.error("Erro ao listar logs:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao listar logs" },
      { status: 500 }
    );
  }
}
