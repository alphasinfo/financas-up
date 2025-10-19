import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Por enquanto, retornar 0 pendências
    // Futuramente, implementar lógica de sincronização offline
    return NextResponse.json({ quantidade: 0, pendencias: [] });
  } catch (error) {
    console.error('Erro ao buscar pendências:', error);
    return NextResponse.json({ error: 'Erro ao buscar pendências' }, { status: 500 });
  }
}
