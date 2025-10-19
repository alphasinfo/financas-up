import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        moedaPadrao: true,
        tema: true,
      },
    });

    return NextResponse.json(usuario || { moedaPadrao: 'BRL', tema: 'light' });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json({ error: 'Erro ao buscar preferências' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { moedaPadrao, tema } = body;

    const usuario = await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        ...(moedaPadrao && { moedaPadrao }),
        ...(tema && { tema }),
      },
    });

    return NextResponse.json({ success: true, usuario });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json({ error: 'Erro ao atualizar preferências' }, { status: 500 });
  }
}
