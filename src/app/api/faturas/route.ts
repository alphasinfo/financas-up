import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Filtros opcionais de data (para calendário)
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const where: any = {
      cartao: {
        usuarioId: session.user.id,
      },
    };

    // Filtrar por range de data se fornecido
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      where.OR = [
        { dataVencimento: { gte: inicio, lte: fim } },
        { dataFechamento: { gte: inicio, lte: fim } },
      ];
    }

    // Buscar faturas dos cartões do usuário
    const faturas = await prisma.fatura.findMany({
      where,
      include: {
        cartao: {
          select: {
            id: true,
            nome: true,
            banco: true,
            diaFechamento: true,
            diaVencimento: true,
          },
        },
      },
      orderBy: [
        { anoReferencia: "desc" },
        { mesReferencia: "desc" },
      ],
    });

    return NextResponse.json(faturas);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Erro ao buscar faturas:", error);
    }
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
