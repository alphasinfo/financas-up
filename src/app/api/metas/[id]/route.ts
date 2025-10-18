import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const atualizarMetaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional().nullable(),
  valorAlvo: z.number().positive("Valor alvo deve ser positivo"),
  dataPrazo: z.string().optional().nullable(),
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

    const meta = await prisma.meta.findUnique({
      where: { id: params.id },
    });

    if (!meta) {
      return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });
    }

    if (meta.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(meta);
  } catch (error: any) {
    console.error("Erro ao buscar meta:", error);
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

    const meta = await prisma.meta.findUnique({
      where: { id: params.id },
    });

    if (!meta) {
      return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });
    }

    if (meta.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validacao = atualizarMetaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { titulo, descricao, valorAlvo, dataPrazo } = validacao.data;

    const metaAtualizada = await prisma.meta.update({
      where: { id: params.id },
      data: {
        titulo,
        descricao,
        valorAlvo,
        dataPrazo: dataPrazo ? new Date(dataPrazo) : null,
      },
    });

    return NextResponse.json(metaAtualizada);
  } catch (error: any) {
    console.error("Erro ao atualizar meta:", error);
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

    const meta = await prisma.meta.findUnique({
      where: { id: params.id },
    });

    if (!meta) {
      return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });
    }

    if (meta.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    await prisma.meta.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ mensagem: "Meta excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}
