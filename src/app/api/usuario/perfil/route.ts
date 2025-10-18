import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const perfilSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const dados = perfilSchema.parse(body);

    // Verificar se o e-mail já está em uso por outro usuário
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        email: dados.email,
        NOT: { id: session.user.id },
      },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        nome: dados.nome,
        email: dados.email,
      },
    });

    return NextResponse.json({
      mensagem: "Perfil atualizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
