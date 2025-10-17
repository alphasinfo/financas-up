import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Desabilitar cache para esta rota
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
      include: {
        categoria: true,
        contaBancaria: true,
        cartaoCredito: true,
      },
    });

    if (!transacao) {
      return NextResponse.json(
        { erro: "Transação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(transacao);
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      descricao,
      valor,
      dataCompetencia,
      status,
      categoriaId,
      contaBancariaId,
      cartaoCreditoId,
    } = body;

    // Verificar se a transação pertence ao usuário
    const transacaoAntiga = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
      include: {
        contaBancaria: true,
        cartaoCredito: true,
        fatura: true,
      },
    });

    if (!transacaoAntiga) {
      return NextResponse.json(
        { erro: "Transação não encontrada" },
        { status: 404 }
      );
    }

    console.log(`✏️  Editando transação: ${transacaoAntiga.tipo} - R$ ${transacaoAntiga.valor} → R$ ${valor}`);

    // Reverter valores antigos primeiro
    // Se tinha conta bancária, reverter o saldo
    if (transacaoAntiga.contaBancariaId && transacaoAntiga.contaBancaria) {
      if (transacaoAntiga.tipo === "DESPESA") {
        // Devolver valor à conta
        await prisma.contaBancaria.update({
          where: { id: transacaoAntiga.contaBancariaId },
          data: {
            saldoAtual: { increment: transacaoAntiga.valor },
            saldoDisponivel: { increment: transacaoAntiga.valor },
          },
        });
      } else if (transacaoAntiga.tipo === "RECEITA") {
        // Remover valor da conta
        await prisma.contaBancaria.update({
          where: { id: transacaoAntiga.contaBancariaId },
          data: {
            saldoAtual: { decrement: transacaoAntiga.valor },
            saldoDisponivel: { decrement: transacaoAntiga.valor },
          },
        });
      }
    }

    // Se tinha cartão, reverter limite e fatura
    if (transacaoAntiga.cartaoCreditoId && transacaoAntiga.cartaoCredito) {
      await prisma.cartaoCredito.update({
        where: { id: transacaoAntiga.cartaoCreditoId },
        data: {
          limiteDisponivel: { increment: transacaoAntiga.valor },
        },
      });

      if (transacaoAntiga.faturaId) {
        await prisma.fatura.update({
          where: { id: transacaoAntiga.faturaId },
          data: {
            valorTotal: { decrement: transacaoAntiga.valor },
          },
        });
      }
    }

    // Atualizar transação
    const transacaoAtualizada = await prisma.transacao.update({
      where: { id: params.id },
      data: {
        descricao,
        valor,
        dataCompetencia: new Date(dataCompetencia),
        status,
        categoriaId,
        contaBancariaId,
        cartaoCreditoId,
        dataLiquidacao: status === "PAGO" || status === "RECEBIDO" ? new Date() : null,
      },
      include: {
        categoria: true,
        contaBancaria: true,
        cartaoCredito: true,
      },
    });

    // Aplicar novos valores
    // Se tem conta bancária nova, aplicar o saldo
    if (contaBancariaId) {
      if (transacaoAtualizada.tipo === "DESPESA") {
        // Buscar conta para validar crédito
        const conta = await prisma.contaBancaria.findUnique({
          where: { id: contaBancariaId },
        });

        if (!conta) {
          return NextResponse.json(
            { erro: "Conta não encontrada" },
            { status: 404 }
          );
        }

        // Validar saldo e crédito especial apenas se status for PAGO
        if (status === "PAGO") {
          const novoSaldo = conta.saldoAtual - valor;

          // Se não tem crédito especial, não pode ficar negativo
          if (!conta.temLimiteCredito && novoSaldo < 0) {
            return NextResponse.json(
              { 
                erro: "Saldo insuficiente. Esta conta não possui crédito especial.",
                detalhes: {
                  saldoAtual: conta.saldoAtual,
                  valorDespesa: valor,
                  saldoAposOperacao: novoSaldo,
                }
              },
              { status: 400 }
            );
          }

          // Se tem crédito, verificar se não excede o limite
          if (conta.temLimiteCredito && novoSaldo < -conta.limiteCredito) {
            const limiteDisponivel = conta.limiteCredito + conta.saldoAtual;
            return NextResponse.json(
              { 
                erro: `Limite de crédito excedido. Limite disponível: R$ ${limiteDisponivel.toFixed(2)}`,
                detalhes: {
                  limiteCredito: conta.limiteCredito,
                  saldoAtual: conta.saldoAtual,
                  limiteDisponivel: limiteDisponivel,
                  valorDespesa: valor,
                  saldoAposOperacao: novoSaldo,
                }
              },
              { status: 400 }
            );
          }
        }

        // Descontar da conta
        await prisma.contaBancaria.update({
          where: { id: contaBancariaId },
          data: {
            saldoAtual: { decrement: valor },
            saldoDisponivel: { decrement: valor },
          },
        });
      } else if (transacaoAtualizada.tipo === "RECEITA") {
        // Adicionar à conta
        await prisma.contaBancaria.update({
          where: { id: contaBancariaId },
          data: {
            saldoAtual: { increment: valor },
            saldoDisponivel: { increment: valor },
          },
        });
      }
    }

    // Se tem cartão novo, aplicar limite
    if (cartaoCreditoId && transacaoAtualizada.tipo === "DESPESA") {
      await prisma.cartaoCredito.update({
        where: { id: cartaoCreditoId },
        data: {
          limiteDisponivel: { decrement: valor },
        },
      });
    }

    console.log(`✅ Transação atualizada com sucesso`);

    // Revalidar páginas que usam transações
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/financeiro');
    revalidatePath('/dashboard/calendario');

    return NextResponse.json(transacaoAtualizada);
  } catch (error) {
    console.error("❌ Erro ao atualizar transação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { erro: "Status é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a transação pertence ao usuário
    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!transacao) {
      return NextResponse.json(
        { erro: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar status
    const transacaoAtualizada = await prisma.transacao.update({
      where: { id: params.id },
      data: {
        status,
        dataLiquidacao: status === "PAGO" || status === "RECEBIDO" ? new Date() : null,
      },
    });

    return NextResponse.json(transacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a transação pertence ao usuário
    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
      include: {
        cartaoCredito: true,
        contaBancaria: true,
        fatura: true,
      },
    });

    if (!transacao) {
      return NextResponse.json(
        { erro: "Transação não encontrada" },
        { status: 404 }
      );
    }

    console.log(`🗑️  Excluindo transação: ${transacao.tipo} - R$ ${transacao.valor}`);

    // Se for transação de cartão de crédito
    if (transacao.cartaoCreditoId && transacao.cartaoCredito) {
      console.log(`💳 Devolvendo limite ao cartão: R$ ${transacao.valor}`);
      
      // Devolver limite ao cartão
      await prisma.cartaoCredito.update({
        where: { id: transacao.cartaoCreditoId },
        data: {
          limiteDisponivel: {
            increment: transacao.valor,
          },
        },
      });

      // Atualizar valor da fatura
      if (transacao.faturaId) {
        console.log(`📄 Atualizando fatura: -R$ ${transacao.valor}`);
        await prisma.fatura.update({
          where: { id: transacao.faturaId },
          data: {
            valorTotal: {
              decrement: transacao.valor,
            },
          },
        });
      }
    }

    // Se for transação de conta bancária
    if (transacao.contaBancariaId && transacao.contaBancaria) {
      console.log(`🏦 Atualizando saldo da conta: ${transacao.contaBancaria.nome}`);
      
      if (transacao.tipo === "DESPESA") {
        // Devolver valor à conta (incrementar saldo)
        console.log(`   Devolvendo R$ ${transacao.valor} à conta`);
        await prisma.contaBancaria.update({
          where: { id: transacao.contaBancariaId },
          data: {
            saldoAtual: {
              increment: transacao.valor,
            },
            saldoDisponivel: {
              increment: transacao.valor,
            },
          },
        });
      } else if (transacao.tipo === "RECEITA") {
        // Remover valor da conta (decrementar saldo)
        console.log(`   Removendo R$ ${transacao.valor} da conta`);
        await prisma.contaBancaria.update({
          where: { id: transacao.contaBancariaId },
          data: {
            saldoAtual: {
              decrement: transacao.valor,
            },
            saldoDisponivel: {
              decrement: transacao.valor,
            },
          },
        });
      }
    }

    // Excluir transação
    await prisma.transacao.delete({
      where: { id: params.id },
    });

    console.log(`✅ Transação excluída com sucesso`);

    // Revalidar páginas que usam transações
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/financeiro');
    revalidatePath('/dashboard/calendario');
    revalidatePath('/dashboard/relatorios');
    revalidatePath('/dashboard/cartoes');
    
    // Se tinha cartão, revalidar página específica do cartão
    if (transacao.cartaoCreditoId) {
      revalidatePath(`/dashboard/cartoes/${transacao.cartaoCreditoId}`);
    }

    return NextResponse.json(
      { 
        mensagem: "Transação excluída com sucesso",
        transacao: {
          id: transacao.id,
          descricao: transacao.descricao,
          valor: transacao.valor
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao excluir transação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
