import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const conta = await prisma.contaBancaria.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    return NextResponse.json(conta);
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conta" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    const contaAtual = await prisma.contaBancaria.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!contaAtual) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const contaAtualizada = await prisma.contaBancaria.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        instituicao: data.instituicao,
        agencia: data.agencia,
        numero: data.numero,
        tipo: data.tipo,
        cor: data.cor,
        ativa: data.ativa,
        temLimiteCredito: data.temLimiteCredito ?? false,
        limiteCredito: data.limiteCredito ?? 0,
        // Só atualiza saldo inicial se mudou
        ...(data.saldoInicial !== contaAtual.saldoInicial && {
          saldoInicial: data.saldoInicial,
          saldoAtual: contaAtual.saldoAtual + (data.saldoInicial - contaAtual.saldoInicial),
        }),
      },
    });

    return NextResponse.json(contaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const conta = await prisma.contaBancaria.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    await prisma.contaBancaria.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Conta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json(
      { error: "Erro ao excluir conta" },
      { status: 500 }
    );
  }
}
