import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { id: params.id },
    });

    if (!convite) {
      return NextResponse.json({ erro: "Convite não encontrado" }, { status: 404 });
    }

    if (convite.email !== session.user.email) {
      return NextResponse.json({ erro: "Este convite não é para você" }, { status: 403 });
    }

    if (convite.aceito) {
      return NextResponse.json({ erro: "Convite já foi aceito" }, { status: 400 });
    }

    if (convite.expiraEm < new Date()) {
      return NextResponse.json({ erro: "Convite expirado" }, { status: 400 });
    }

    // Marcar convite como aceito
    await prisma.conviteCompartilhamento.update({
      where: { id: params.id },
      data: {
        aceito: true,
        aceitoEm: new Date(),
      },
    });

    // Criar compartilhamento baseado no tipo
    if (convite.tipo === "CONTA" && convite.recursoId) {
      await prisma.compartilhamentoConta.create({
        data: {
          contaId: convite.recursoId,
          usuarioId: session.user.id,
          permissao: convite.permissao,
          criadoPor: convite.criadoPor,
          ativo: true,
        },
      });
    }

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Convite aceito com sucesso" 
    });
  } catch (error: any) {
    console.error("Erro ao aceitar convite:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao aceitar convite" },
      { status: 500 }
    );
  }
}
