import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { token: params.token },
      include: {
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!convite) {
      return NextResponse.json(
        { erro: "Convite não encontrado" },
        { status: 404 }
      );
    }

    if (convite.aceito) {
      return NextResponse.json(
        { erro: "Este convite já foi aceito" },
        { status: 400 }
      );
    }

    if (convite.expiraEm < new Date()) {
      return NextResponse.json(
        { erro: "Este convite expirou" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      id: convite.id,
      email: convite.email,
      tipo: convite.tipo,
      permissao: convite.permissao,
      expiraEm: convite.expiraEm,
      criador: convite.criador,
    });
  } catch (error: any) {
    console.error("Erro ao validar convite:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao validar convite" },
      { status: 500 }
    );
  }
}
