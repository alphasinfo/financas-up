import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar dados do mês atual
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const [transacoes, contas, cartoes, usuario] = await Promise.all([
      prisma.transacao.findMany({
        where: {
          usuarioId: session.user.id,
          dataCompetencia: {
            gte: primeiroDia,
            lte: ultimoDia,
          },
        },
        include: {
          categoria: true,
        },
      }),
      prisma.contaBancaria.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.cartaoCredito.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.usuario.findUnique({
        where: { id: session.user.id },
      }),
    ]);

    // Calcular estatísticas
    const receitas = transacoes
      .filter((t) => t.tipo === "RECEITA")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = transacoes
      .filter((t) => t.tipo === "DESPESA")
      .reduce((sum, t) => sum + t.valor, 0);

    const saldo = receitas - despesas;

    // Preparar dados do relatório
    const relatorio = {
      periodo: `${primeiroDia.toLocaleDateString('pt-BR')} - ${ultimoDia.toLocaleDateString('pt-BR')}`,
      usuario: {
        nome: usuario?.nome,
        email: usuario?.email,
      },
      resumo: {
        receitas,
        despesas,
        saldo,
        totalTransacoes: transacoes.length,
      },
      contas: contas.map((c) => ({
        nome: c.nome,
        saldo: c.saldoAtual,
      })),
      cartoes: cartoes.map((c) => ({
        nome: c.nome,
        limiteDisponivel: c.limiteDisponivel,
      })),
      transacoes: transacoes.map((t) => ({
        data: t.dataCompetencia,
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        categoria: t.categoria?.nome,
      })),
    };

    // NOTA: Aqui você integraria com um serviço de email (Resend, SendGrid, etc.)
    // Por enquanto, vamos apenas retornar os dados que seriam enviados
    
    // Exemplo de integração (comentado):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'Finanças Up <noreply@financasup.com>',
      to: usuario?.email,
      subject: `Relatório Mensal - ${primeiroDia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      html: gerarHTMLRelatorio(relatorio),
      attachments: [
        {
          filename: 'relatorio.json',
          content: JSON.stringify(relatorio, null, 2),
        },
      ],
    });
    */

    // Atualizar data do último envio
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        ultimoEnvioRelatorio: new Date(),
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Relatório preparado com sucesso",
      preview: relatorio,
      nota: "Para enviar por email, configure um serviço de email (Resend, SendGrid, etc.)",
    });
  } catch (error) {
    console.error("Erro ao enviar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao enviar relatório" },
      { status: 500 }
    );
  }
}
