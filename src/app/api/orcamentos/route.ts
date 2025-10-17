import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const orcamentoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoriaId: z.string().optional().nullable(),
  valorLimite: z.number().positive("Valor deve ser maior que zero"),
  mesReferencia: z.number().min(1).max(12),
  anoReferencia: z.number(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const orcamentos = await prisma.orcamento.findMany({
      where: {
        usuarioId: session.user.id,
      },
      include: {
        categoria: true,
      },
      orderBy: [
        { anoReferencia: "desc" },
        { mesReferencia: "desc" },
      ],
    });

    return NextResponse.json(orcamentos);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = orcamentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;

    const orcamento = await prisma.orcamento.create({
      data: {
        ...dados,
        valorGasto: 0,
        usuarioId: session.user.id,
      },
    });

    // Revalidar páginas que usam orçamentos
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orcamento');

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
