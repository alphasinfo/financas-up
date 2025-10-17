import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { logo: true },
    });

    return NextResponse.json({
      foto: usuario?.logo || null, // Campo logo agora retorna foto do usuário
    });
  } catch (error) {
    console.error("Erro ao buscar logo:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
