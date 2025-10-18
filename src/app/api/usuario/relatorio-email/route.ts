import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { enviarRelatorioEmail, diaEnvioRelatorio } = body;

    // Atualizar configurações do usuário
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        enviarRelatorioEmail,
        diaEnvioRelatorio,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Configurações de relatório atualizadas",
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        enviarRelatorioEmail: true,
        diaEnvioRelatorio: true,
        ultimoEnvioRelatorio: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}
