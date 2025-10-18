import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const notificacoesSchema = z.object({
  notificacaoEmail: z.boolean(),
  notificacaoVencimento: z.boolean(),
  notificacaoOrcamento: z.boolean(),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const dados = notificacoesSchema.parse(body);

    // Por enquanto, apenas retornar sucesso
    // Em produção, você salvaria essas preferências no banco de dados
    // Pode adicionar uma tabela de configurações do usuário

    return NextResponse.json({
      mensagem: "Notificações atualizadas com sucesso",
      configuracoes: dados,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar notificações:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
