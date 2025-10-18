import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Criptografar senha (base64 simples - em produção use crypto)
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

// GET - Buscar configurações SMTP
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: {
        smtpProvider: true,
        smtpEmail: true,
        smtpHost: true,
        smtpPort: true,
        smtpNome: true,
        // Não retornar a senha por segurança
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      provider: usuario.smtpProvider || null,
      email: usuario.smtpEmail || null,
      host: usuario.smtpHost || null,
      port: usuario.smtpPort || null,
      nome: usuario.smtpNome || "Finanças UP",
      configured: !!usuario.smtpProvider,
    });

  } catch (error) {
    console.error("Erro ao buscar configurações SMTP:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// POST - Salvar configurações SMTP
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    const { provider, email, password, nome, host: customHost, port: customPort } = await req.json();

    if (!provider || !password) {
      return NextResponse.json(
        { erro: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Normalizar provider para maiúsculas
    const providerUpper = provider.toUpperCase();

    // Configurações pré-definidas
    let host = '';
    let port = 587;

    if (providerUpper === 'GMAIL') {
      host = 'smtp.gmail.com';
      port = 587;
    } else if (providerUpper === 'OUTLOOK' || providerUpper === 'HOTMAIL') {
      host = 'smtp-mail.outlook.com';
      port = 587;
    } else if (providerUpper === 'YAHOO') {
      host = 'smtp.mail.yahoo.com';
      port = 587;
    } else if (providerUpper === 'RESEND') {
      host = 'smtp.resend.com';
      port = 587;
    } else if (providerUpper === 'OUTRO') {
      // Para configuração manual, usar valores fornecidos
      if (!customHost || !customPort || !email) {
        return NextResponse.json(
          { erro: "Para configuração manual, forneça host, porta e email" },
          { status: 400 }
        );
      }
      host = customHost;
      port = customPort;
    } else {
      return NextResponse.json(
        { erro: "Provedor não suportado" },
        { status: 400 }
      );
    }

    // Criptografar senha
    const encryptedPassword = encryptPassword(password);

    // Salvar no banco
    const usuario = await prisma.usuario.update({
      where: { email: session.user.email },
      data: {
        smtpProvider: providerUpper, // Salvar normalizado
        smtpEmail: email,
        smtpPassword: encryptedPassword,
        smtpHost: host,
        smtpPort: port,
        smtpNome: nome || "Finanças UP",
      },
    });

    console.log(`✅ Configuração SMTP salva: ${providerUpper} - ${email}`);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Configurações SMTP salvas com sucesso",
      provider: usuario.smtpProvider,
    });

  } catch (error) {
    console.error("Erro ao salvar configurações SMTP:", error);
    return NextResponse.json(
      { erro: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}

// DELETE - Remover configurações SMTP
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    await prisma.usuario.update({
      where: { email: session.user.email },
      data: {
        smtpProvider: null,
        smtpEmail: null,
        smtpPassword: null,
        smtpHost: null,
        smtpPort: null,
        smtpNome: null,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Configurações SMTP removidas",
    });

  } catch (error) {
    console.error("Erro ao remover configurações SMTP:", error);
    return NextResponse.json(
      { erro: "Erro ao remover configurações" },
      { status: 500 }
    );
  }
}
