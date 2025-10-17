import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const investimentoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  tipo: z.string(),
  valorAplicado: z.number().positive("Valor deve ser maior que zero"),
  valorAtual: z.number().optional().nullable(),
  taxaRendimento: z.number().optional().nullable(),
  dataAplicacao: z.coerce.date(),
  dataVencimento: z.coerce.date().optional().nullable(),
  instituicao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const investimentos = await prisma.investimento.findMany({
      where: {
        usuarioId: session.user.id,
      },
      orderBy: {
        dataAplicacao: "desc",
      },
    });

    return NextResponse.json(investimentos);
  } catch (error) {
    console.error("Erro ao buscar investimentos:", error);
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
    const validacao = investimentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;

    const investimento = await prisma.investimento.create({
      data: {
        ...dados,
        usuarioId: session.user.id,
      },
    });

    // Revalidar páginas que usam investimentos
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/investimentos');

    return NextResponse.json(investimento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar investimento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
