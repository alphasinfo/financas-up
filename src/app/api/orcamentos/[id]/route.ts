import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const atualizarOrcamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valorLimite: z.number().positive("Valor limite deve ser positivo"),
  categoriaId: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: params.id },
      include: { categoria: true },
    });

    if (!orcamento) {
      return NextResponse.json({ erro: "Orçamento não encontrado" }, { status: 404 });
    }

    if (orcamento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(orcamento);
  } catch (error: any) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: params.id },
    });

    if (!orcamento) {
      return NextResponse.json({ erro: "Orçamento não encontrado" }, { status: 404 });
    }

    if (orcamento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validacao = atualizarOrcamentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nome, valorLimite, categoriaId } = validacao.data;

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: params.id },
      data: {
        nome,
        valorLimite,
        categoriaId,
      },
    });

    return NextResponse.json(orcamentoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
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

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: params.id },
    });

    if (!orcamento) {
      return NextResponse.json({ erro: "Orçamento não encontrado" }, { status: 404 });
    }

    if (orcamento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    await prisma.orcamento.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ mensagem: "Orçamento excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir orçamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}
