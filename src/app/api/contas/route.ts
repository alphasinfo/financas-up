import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arredondarValor } from "@/lib/formatters";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const contaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  instituicao: z.string().min(2, "Instituição deve ter no mínimo 2 caracteres"),
  tipo: z.enum(["CORRENTE", "POUPANCA", "CARTEIRA"]),
  agencia: z.string().optional(),
  numero: z.string().optional(),
  saldoInicial: z.number(),
  cor: z.string().optional(),
  temLimiteCredito: z.boolean().optional().default(false),
  limiteCredito: z.number().optional().default(0),
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

    // Permitir filtrar apenas contas ativas via query parameter
    const { searchParams } = new URL(request.url);
    const apenasAtivas = searchParams.get("ativas") === "true";

    const contas = await prisma.contaBancaria.findMany({
      where: { 
        usuarioId: session.user.id,
        ...(apenasAtivas && { ativa: true }),
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(contas);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
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
    const validacao = contaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { saldoInicial, limiteCredito, ...dados } = validacao.data;
    const saldoArredondado = arredondarValor(saldoInicial);
    const limiteCreditoArredondado = arredondarValor(limiteCredito || 0);

    const conta = await prisma.contaBancaria.create({
      data: {
        ...dados,
        saldoInicial: saldoArredondado,
        saldoAtual: saldoArredondado,
        saldoDisponivel: saldoArredondado,
        limiteCredito: limiteCreditoArredondado,
        usuarioId: session.user.id,
      },
    });

    // Revalidar cache das páginas que usam contas
    revalidatePath('/dashboard/contas');
    revalidatePath('/dashboard/financeiro');
    revalidatePath('/dashboard/conciliacao');

    return NextResponse.json(conta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
