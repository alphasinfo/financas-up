import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { buscarLogsUsuario } from "@/lib/log-acesso";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/logs
 * Buscar logs de acesso do usuário
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get("limite") || "50");

    const logs = await buscarLogsUsuario(session.user.id, limite);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Erro ao buscar logs:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar logs", detalhes: error?.message },
      { status: 500 }
    );
  }
}
