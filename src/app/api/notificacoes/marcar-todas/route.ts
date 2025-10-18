import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Por enquanto, apenas retorna sucesso
    // Em uma implementação completa, você salvaria o estado no banco
    return NextResponse.json({ mensagem: "Todas as notificações foram marcadas como lidas" });
  } catch (error) {
    console.error("Erro ao marcar todas as notificações:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
