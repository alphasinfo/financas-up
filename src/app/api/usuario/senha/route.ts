import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const dados = senhaSchema.parse(body);

    // Buscar usuário com senha
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (!usuario.senha) {
      return NextResponse.json(
        { erro: "Usuário não possui senha cadastrada" },
        { status: 400 }
      );
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(dados.senhaAtual, usuario.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { erro: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(dados.novaSenha, 10);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { senha: novaSenhaHash },
    });

    return NextResponse.json({
      mensagem: "Senha alterada com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
