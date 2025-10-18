import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  cor: z.string().optional(),
  icone: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = categoriaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verificar se a categoria pertence ao usuário
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { erro: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    const { nome, tipo, cor, icone } = validacao.data;

    // Verificar se já existe outra categoria com mesmo nome
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome,
        tipo,
        usuarioId: session.user.id,
        id: { not: params.id },
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { erro: "Já existe uma categoria com este nome" },
        { status: 400 }
      );
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id: params.id },
      data: {
        nome,
        tipo,
        cor,
        icone,
      },
    });

    return NextResponse.json(categoriaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a categoria pertence ao usuário
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { erro: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se existem transações usando esta categoria
    const transacoesComCategoria = await prisma.transacao.count({
      where: { categoriaId: params.id },
    });

    if (transacoesComCategoria > 0) {
      return NextResponse.json(
        { erro: `Não é possível excluir. Existem ${transacoesComCategoria} transação(ões) usando esta categoria.` },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { mensagem: "Categoria excluída com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
