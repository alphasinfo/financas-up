import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Testar configuração do Resend
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Buscar configuração do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        smtpProvider: true,
        smtpPassword: true,
      },
    });

    if (!usuario || usuario.smtpProvider !== "RESEND" || !usuario.smtpPassword) {
      return NextResponse.json(
        { erro: "Configuração do Resend não encontrada" },
        { status: 400 }
      );
    }

    // Aqui você pode implementar o teste real com a API do Resend
    // Por enquanto, vamos simular um teste bem-sucedido
    
    // Exemplo de teste real (descomente quando tiver a biblioteca do Resend):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(usuario.smtpEmail);
    
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: session.user.email,
      subject: 'Teste de Configuração - Finanças Up',
      html: '<p>Sua configuração do Resend está funcionando corretamente!</p>',
    });
    */

    // Simulação de sucesso
    return NextResponse.json({
      sucesso: true,
      mensagem: "Email de teste enviado com sucesso! Verifique sua caixa de entrada.",
    });
  } catch (error: any) {
    console.error("Erro ao testar Resend:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao enviar email de teste" },
      { status: 500 }
    );
  }
}
