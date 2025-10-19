import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const arquivo = formData.get("logo") as File;

    if (!arquivo) {
      return NextResponse.json(
        { erro: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json(
        { erro: "Tipo de arquivo não permitido. Use PNG, JPG, WEBP ou SVG" },
        { status: 400 }
      );
    }

    // Validar tamanho (max 2MB)
    if (arquivo.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { erro: "Arquivo muito grande. Tamanho máximo: 2MB" },
        { status: 400 }
      );
    }

    // Converter para Base64 (solução para Vercel read-only filesystem)
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${arquivo.type};base64,${base64}`;

    // Salvar diretamente no banco de dados como Data URL
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { logo: dataUrl },
    });

    return NextResponse.json({
      mensagem: "Foto do usuário atualizada com sucesso",
      foto: dataUrl,
    });
  } catch (error: any) {
    console.error("Erro ao fazer upload da foto:", error);
    console.error("Detalhes do erro:", error?.message, error?.stack);
    return NextResponse.json(
      { erro: `Erro ao fazer upload: ${error?.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      console.error('[Logo GET] Sessão inválida ou sem ID');
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    console.log('[Logo GET] Buscando logo para usuário:', session.user.id);

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { logo: true },
    });

    if (!usuario) {
      console.error('[Logo GET] Usuário não encontrado:', session.user.id);
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
    }

    console.log('[Logo GET] Logo encontrado:', usuario.logo ? 'Sim' : 'Não');

    return NextResponse.json({
      foto: usuario.logo || null,
    });
  } catch (error: any) {
    console.error("[Logo GET] Erro completo:", error);
    console.error("[Logo GET] Stack:", error?.stack);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Remover foto do usuário do banco
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { logo: null },
    });

    return NextResponse.json({
      mensagem: "Foto do usuário removida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover logo:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
