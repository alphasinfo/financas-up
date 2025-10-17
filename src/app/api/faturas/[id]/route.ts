import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const faturaId = params.id;

    // Verificar se a fatura pertence ao usuário
    const fatura = await prisma.fatura.findFirst({
      where: {
        id: faturaId,
        cartao: {
          usuarioId: session.user.id,
        },
      },
      include: {
        cartao: true,
      },
    });

    if (!fatura) {
      return NextResponse.json({ erro: "Fatura não encontrada" }, { status: 404 });
    }

    // Buscar transações associadas à fatura
    const transacoes = await prisma.transacao.findMany({
      where: { faturaId },
    });

    // Liberar o limite do cartão (somar o valor das transações de volta)
    const valorTotal = transacoes.reduce((sum, t) => sum + t.valor, 0);

    // Remover associação das transações com a fatura (não deletar as transações)
    await prisma.transacao.updateMany({
      where: { faturaId },
      data: { faturaId: null },
    });

    // Atualizar limite do cartão
    await prisma.cartaoCredito.update({
      where: { id: fatura.cartaoId },
      data: {
        limiteDisponivel: {
          increment: valorTotal,
        },
      },
    });

    // Deletar a fatura
    await prisma.fatura.delete({
      where: { id: faturaId },
    });

    return NextResponse.json({
      mensagem: "Fatura excluída com sucesso",
      valorLiberado: valorTotal,
    });
  } catch (error) {
    console.error("Erro ao excluir fatura:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
