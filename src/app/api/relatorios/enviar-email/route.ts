import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enviarEmail, gerarRelatorioHTML } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Calcular período (mês atual)
    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const ultimoDiaMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

    // Buscar transações do mês
    const transacoes = await prisma.transacao.findMany({
      where: {
        usuarioId: usuario.id,
        dataCompetencia: {
          gte: primeiroDiaMes,
          lte: ultimoDiaMes,
        },
      },
    });

    // Calcular totais
    const receitas = transacoes
      .filter(t => t.tipo === "RECEITA")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transacoes
      .filter(t => t.tipo === "DESPESA")
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const saldo = receitas - despesas;

    // Gerar HTML do relatório
    const periodo = agora.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });

    const htmlRelatorio = gerarRelatorioHTML({
      periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
      receitas,
      despesas,
      saldo,
      transacoes: transacoes.length,
      nomeUsuario: usuario.nome || 'Usuário',
    });

    // Enviar email
    try {
      const resultado = await enviarEmail({
        para: session.user.email,
        assunto: `Relatório Financeiro - ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`,
        html: htmlRelatorio,
        usuarioId: usuario.id, // Passa o ID para usar config SMTP do usuário
      });

      if (!resultado.success) {
        console.error('❌ Erro ao enviar email:', resultado.error);
        return NextResponse.json(
          { 
            erro: "Erro ao enviar relatório. Verifique as configurações de email.",
            detalhes: resultado.error 
          },
          { status: 500 }
        );
      }
    } catch (emailError: any) {
      console.error('❌ Exceção ao enviar email:', emailError);
      return NextResponse.json(
        { 
          erro: "Erro ao enviar relatório. Verifique as configurações de email.",
          detalhes: emailError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Relatório enviado com sucesso!",
      dados: {
        receitas,
        despesas,
        saldo,
        transacoes: transacoes.length,
      }
    });

  } catch (error) {
    console.error("Erro ao enviar relatório:", error);
    return NextResponse.json(
      { erro: "Erro ao enviar relatório" },
      { status: 500 }
    );
  }
}
