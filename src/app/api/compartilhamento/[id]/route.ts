import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Revogar/Deletar convite de compartilhamento
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é um convite ou compartilhamento ativo
    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { id: params.id },
    });

    if (convite) {
      // Verificar se o usuário é o criador do convite
      if (convite.criadoPor !== session.user.id) {
        return NextResponse.json(
          { erro: "Você não tem permissão para revogar este convite" },
          { status: 403 }
        );
      }

      // Deletar convite
      await prisma.conviteCompartilhamento.delete({
        where: { id: params.id },
      });

      return NextResponse.json({
        sucesso: true,
        mensagem: "Convite revogado com sucesso",
      });
    }

    // Se não for convite, verificar se é compartilhamento ativo
    const compartilhamento = await prisma.compartilhamentoConta.findUnique({
      where: { id: params.id },
    });

    if (compartilhamento) {
      // Verificar se o usuário é o criador do compartilhamento
      if (compartilhamento.criadoPor !== session.user.id) {
        return NextResponse.json(
          { erro: "Você não tem permissão para revogar este compartilhamento" },
          { status: 403 }
        );
      }

      // Desativar compartilhamento
      await prisma.compartilhamentoConta.update({
        where: { id: params.id },
        data: { ativo: false },
      });

      return NextResponse.json({
        sucesso: true,
        mensagem: "Compartilhamento revogado com sucesso",
      });
    }

    return NextResponse.json(
      { erro: "Convite ou compartilhamento não encontrado" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Erro ao revogar:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao revogar" },
      { status: 500 }
    );
  }
}
