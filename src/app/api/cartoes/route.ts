import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arredondarValor } from "@/lib/formatters";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const cartaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  banco: z.string().min(2, "Banco deve ter no mínimo 2 caracteres"),
  bandeira: z.string().min(2, "Bandeira é obrigatória"),
  apelido: z.string().optional(),
  numeroMascara: z.string().optional(),
  limiteTotal: z.number().positive("Limite deve ser maior que zero"),
  diaFechamento: z.number().min(1).max(31),
  diaVencimento: z.number().min(1).max(31),
  cor: z.string().optional(),
});

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Permitir filtrar apenas cartões ativos via query parameter
    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get("ativos") === "true";

    const cartoes = await prisma.cartaoCredito.findMany({
      where: { 
        usuarioId: session.user.id,
        ...(apenasAtivos && { ativo: true }),
      },
      orderBy: { criadoEm: "desc" },
      include: {
        faturas: {
          where: {
            status: { in: ["ABERTA", "FECHADA"] },
          },
          orderBy: { dataVencimento: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(cartoes);
  } catch (error) {
    console.error("Erro ao buscar cartões:", error);
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
    const validacao = cartaoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { limiteTotal, diaFechamento, diaVencimento, ...dados } = validacao.data;

    // Validar que vencimento é após fechamento
    if (diaVencimento <= diaFechamento) {
      return NextResponse.json(
        { erro: "Dia de vencimento deve ser após o dia de fechamento" },
        { status: 400 }
      );
    }

    // Formatar número mascara
    let numeroMascaraFormatado = dados.numeroMascara;
    if (numeroMascaraFormatado && numeroMascaraFormatado.length === 4) {
      numeroMascaraFormatado = `****${numeroMascaraFormatado}`;
    }

    const limiteArredondado = arredondarValor(limiteTotal);

    const cartao = await prisma.cartaoCredito.create({
      data: {
        ...dados,
        numeroMascara: numeroMascaraFormatado,
        limiteTotal: limiteArredondado,
        limiteDisponivel: limiteArredondado,
        diaFechamento,
        diaVencimento,
        usuarioId: session.user.id,
      },
    });

    // Revalidar cache das páginas que usam cartões
    revalidatePath('/dashboard/cartoes');
    revalidatePath('/dashboard/financeiro');
    revalidatePath('/dashboard/conciliacao');

    return NextResponse.json(cartao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
