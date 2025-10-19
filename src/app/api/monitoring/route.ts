import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { monitoring } from "@/lib/monitoring";

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'resumo';

    switch (tipo) {
      case 'resumo':
        return NextResponse.json({
          queries: monitoring.getEstatisticasQueries(),
          apis: monitoring.getEstatisticasAPIs(),
        });

      case 'queries-lentas':
        const limite = parseInt(searchParams.get('limite') || '10');
        return NextResponse.json({
          queriesLentas: monitoring.getQueriesLentas(limite),
        });

      case 'apis-lentas':
        const limiteAPIs = parseInt(searchParams.get('limite') || '10');
        return NextResponse.json({
          apisLentas: monitoring.getAPIsLentas(limiteAPIs),
        });

      case 'erros':
        const limiteErros = parseInt(searchParams.get('limite') || '20');
        return NextResponse.json({
          erros: monitoring.getErrosRecentes(limiteErros),
        });

      default:
        return NextResponse.json(
          { error: "Tipo inválido. Use: resumo, queries-lentas, apis-lentas, erros" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Erro ao buscar métricas de monitoramento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Resetar métricas
    monitoring.reset();

    return NextResponse.json({
      mensagem: "Métricas resetadas com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao resetar métricas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
