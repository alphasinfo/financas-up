import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const atualizarEmprestimoSchema = z.object({
  instituicao: z.string().min(1, "Instituição é obrigatória"),
  descricao: z.string().optional().nullable(),
  valorTotal: z.number().positive("Valor total deve ser positivo"),
  valorParcela: z.number().positive("Valor da parcela deve ser positivo"),
  numeroParcelas: z.number().int().positive("Número de parcelas deve ser positivo"),
  taxaJuros: z.number().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: params.id },
      include: {
        parcelas: {
          orderBy: { numeroParcela: "asc" },
        },
      },
    });

    if (!emprestimo) {
      return NextResponse.json({ erro: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (emprestimo.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(emprestimo);
  } catch (error: any) {
    console.error("Erro ao buscar empréstimo:", error);
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: params.id },
    });

    if (!emprestimo) {
      return NextResponse.json({ erro: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (emprestimo.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validacao = atualizarEmprestimoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { instituicao, descricao, valorTotal, valorParcela, numeroParcelas, taxaJuros } = validacao.data;

    const emprestimoAtualizado = await prisma.emprestimo.update({
      where: { id: params.id },
      data: {
        instituicao,
        descricao,
        valorTotal,
        valorParcela,
        numeroParcelas,
        taxaJuros,
      },
    });

    return NextResponse.json(emprestimoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar empréstimo:", error);
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: params.id },
      include: { parcelas: true },
    });

    if (!emprestimo) {
      return NextResponse.json({ erro: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (emprestimo.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    // Excluir parcelas primeiro
    await prisma.parcelaEmprestimo.deleteMany({
      where: { emprestimoId: params.id },
    });

    // Depois excluir o empréstimo
    await prisma.emprestimo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ mensagem: "Empréstimo excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir empréstimo:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}
