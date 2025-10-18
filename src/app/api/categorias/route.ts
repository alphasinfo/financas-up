import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    const where: any = { usuarioId: session.user.id };
    if (tipo) {
      where.tipo = tipo;
    }

    console.log('🔍 Buscando categorias:', { usuarioId: session.user.id, tipo, where });

    const categorias = await prisma.categoria.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    console.log(`✅ Categorias encontradas: ${categorias.length}`, categorias.map(c => c.nome));

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  cor: z.string().optional(),
  icone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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

    const { nome, tipo, cor, icone } = validacao.data;

    // Verificar se já existe categoria com mesmo nome
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome,
        tipo,
        usuarioId: session.user.id,
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { erro: "Já existe uma categoria com este nome" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        tipo,
        cor,
        icone,
        usuarioId: session.user.id,
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
