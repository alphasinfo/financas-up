import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const atualizarInvestimentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  instituicao: z.string().optional().nullable(),
  valorAplicado: z.number().positive("Valor aplicado deve ser positivo"),
  valorAtual: z.number().optional().nullable(),
  taxaRendimento: z.number().optional().nullable(),
  dataVencimento: z.string().optional().nullable(),
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

    const investimento = await prisma.investimento.findUnique({
      where: { id: params.id },
    });

    if (!investimento) {
      return NextResponse.json({ erro: "Investimento não encontrado" }, { status: 404 });
    }

    if (investimento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(investimento);
  } catch (error: any) {
    console.error("Erro ao buscar investimento:", error);
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

    const investimento = await prisma.investimento.findUnique({
      where: { id: params.id },
    });

    if (!investimento) {
      return NextResponse.json({ erro: "Investimento não encontrado" }, { status: 404 });
    }

    if (investimento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validacao = atualizarInvestimentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nome, tipo, instituicao, valorAplicado, valorAtual, taxaRendimento, dataVencimento } = validacao.data;

    const investimentoAtualizado = await prisma.investimento.update({
      where: { id: params.id },
      data: {
        nome,
        tipo,
        instituicao,
        valorAplicado,
        valorAtual,
        taxaRendimento,
        dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
      },
    });

    return NextResponse.json(investimentoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar investimento:", error);
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

    const investimento = await prisma.investimento.findUnique({
      where: { id: params.id },
    });

    if (!investimento) {
      return NextResponse.json({ erro: "Investimento não encontrado" }, { status: 404 });
    }

    if (investimento.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    await prisma.investimento.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ mensagem: "Investimento excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir investimento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}
