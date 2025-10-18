import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resendSchema = z.object({
  apiKey: z.string().min(1, "API Key é obrigatória"),
});

// Salvar configuração do Resend
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = resendSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { apiKey } = validacao.data;

    // Atualizar configuração do usuário
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        smtpProvider: "RESEND",
        smtpPassword: apiKey, // API Key armazenada no campo de senha
        smtpEmail: null,
        smtpHost: "smtp.resend.com",
        smtpPort: 587,
      },
    });

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Configuração do Resend salva com sucesso" 
    });
  } catch (error: any) {
    console.error("Erro ao salvar configuração do Resend:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}

// Buscar configuração do Resend
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        smtpProvider: true,
        smtpPassword: true,
        smtpHost: true,
        smtpPort: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
    }

    const configurado = usuario.smtpProvider === "RESEND" && usuario.smtpPassword;

    return NextResponse.json({
      configurado,
      provider: usuario.smtpProvider,
      apiKeyMascara: configurado 
        ? `${usuario.smtpPassword?.substring(0, 8)}...${usuario.smtpPassword?.substring(usuario.smtpPassword.length - 4)}`
        : null,
    });
  } catch (error: any) {
    console.error("Erro ao buscar configuração do Resend:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}

// Remover configuração do Resend
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        smtpProvider: null,
        smtpPassword: null,
        smtpEmail: null,
        smtpHost: null,
        smtpPort: null,
      },
    });

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Configuração do Resend removida com sucesso" 
    });
  } catch (error: any) {
    console.error("Erro ao remover configuração do Resend:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao remover configuração" },
      { status: 500 }
    );
  }
}
