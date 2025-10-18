import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const metaSchema = z.object({
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional().nullable(),
  valorAlvo: z.number().positive("Valor alvo deve ser maior que zero"),
  valorAtual: z.number().min(0, "Valor atual não pode ser negativo"),
  dataInicio: z.coerce.date(),
  dataPrazo: z.coerce.date().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const metas = await prisma.meta.findMany({
      where: {
        usuarioId: session.user.id,
      },
      orderBy: {
        dataInicio: "desc",
      },
    });

    return NextResponse.json(metas);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
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
    const validacao = metaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;

    // Determinar status inicial
    const status = dados.valorAtual >= dados.valorAlvo ? "CONCLUIDA" : "EM_ANDAMENTO";

    const meta = await prisma.meta.create({
      data: {
        ...dados,
        status,
        usuarioId: session.user.id,
      },
    });

    return NextResponse.json(meta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
