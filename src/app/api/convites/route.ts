import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Listar convites recebidos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Buscar convites pendentes para o email do usuário
    const convites = await prisma.conviteCompartilhamento.findMany({
      where: {
        email: session.user.email,
        aceito: false,
        expiraEm: {
          gt: new Date(),
        },
      },
      include: {
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return NextResponse.json(convites);
  } catch (error: any) {
    console.error("Erro ao listar convites:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao listar convites" },
      { status: 500 }
    );
  }
}
