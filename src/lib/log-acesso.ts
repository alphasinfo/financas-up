import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Registra um log de acesso no sistema
 */
export async function registrarLogAcesso(
  usuarioId: string,
  acao: "LOGIN" | "LOGOUT" | "CRIAR" | "EDITAR" | "EXCLUIR" | "VISUALIZAR",
  recurso?: string,
  recursoId?: string
) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.logAcesso.create({
      data: {
        usuarioId,
        acao,
        recurso,
        recursoId,
        ip,
        userAgent,
      },
    });

    console.log(`📝 Log registrado: ${acao} ${recurso || ""} ${recursoId || ""} por ${usuarioId}`);
  } catch (error) {
    console.error("❌ Erro ao registrar log:", error);
    // Não lançar erro para não quebrar a aplicação
  }
}

/**
 * Buscar logs de um usuário
 */
export async function buscarLogsUsuario(
  usuarioId: string,
  limite: number = 50
) {
  return await prisma.logAcesso.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: {
      usuario: {
        select: {
          nome: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Buscar logs de um recurso específico
 */
export async function buscarLogsRecurso(
  recurso: string,
  recursoId: string,
  limite: number = 50
) {
  return await prisma.logAcesso.findMany({
    where: {
      recurso,
      recursoId,
    },
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: {
      usuario: {
        select: {
          nome: true,
          email: true,
        },
      },
    },
  });
}
