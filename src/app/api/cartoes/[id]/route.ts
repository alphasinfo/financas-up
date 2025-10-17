import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const cartaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  banco: z.string().min(2, "Banco deve ter no mínimo 2 caracteres"),
  bandeira: z.string(),
  apelido: z.string().optional().nullable(),
  numeroMascara: z.string().optional().nullable(),
  limiteTotal: z.number().positive("Limite deve ser maior que zero"),
  diaFechamento: z.number().min(1).max(31),
  diaVencimento: z.number().min(1).max(31),
  cor: z.string().optional().default("#F59E0B"),
  ativo: z.boolean().optional().default(true),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const cartao = await prisma.cartaoCredito.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!cartao) {
      return NextResponse.json({ erro: "Cartão não encontrado" }, { status: 404 });
    }

    return NextResponse.json(cartao);
  } catch (error) {
    console.error("Erro ao buscar cartão:", error);
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
    const validacao = cartaoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;

    // Verificar se o cartão pertence ao usuário
    const cartaoExistente = await prisma.cartaoCredito.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!cartaoExistente) {
      return NextResponse.json({ erro: "Cartão não encontrado" }, { status: 404 });
    }

    // Calcular novo limite disponível se o limite total mudou
    let novoLimiteDisponivel = cartaoExistente.limiteDisponivel;
    
    if (dados.limiteTotal !== cartaoExistente.limiteTotal) {
      const diferenca = dados.limiteTotal - cartaoExistente.limiteTotal;
      novoLimiteDisponivel = cartaoExistente.limiteDisponivel + diferenca;
      
      // Garantir que não fique negativo
      if (novoLimiteDisponivel < 0) {
        novoLimiteDisponivel = 0;
      }
    }

    // Atualizar cartão
    const cartaoAtualizado = await prisma.cartaoCredito.update({
      where: { id: params.id },
      data: {
        nome: dados.nome,
        banco: dados.banco,
        bandeira: dados.bandeira,
        apelido: dados.apelido,
        numeroMascara: dados.numeroMascara,
        limiteTotal: dados.limiteTotal,
        limiteDisponivel: novoLimiteDisponivel,
        diaFechamento: dados.diaFechamento,
        diaVencimento: dados.diaVencimento,
        cor: dados.cor,
        ativo: dados.ativo,
      },
    });

    return NextResponse.json(cartaoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
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

    // Verificar se o cartão pertence ao usuário
    const cartao = await prisma.cartaoCredito.findFirst({
      where: {
        id: params.id,
        usuarioId: session.user.id,
      },
    });

    if (!cartao) {
      return NextResponse.json({ erro: "Cartão não encontrado" }, { status: 404 });
    }

    // Verificar se há transações associadas
    const transacoesCount = await prisma.transacao.count({
      where: { cartaoCreditoId: params.id },
    });

    if (transacoesCount > 0) {
      return NextResponse.json(
        { erro: "Não é possível excluir um cartão com transações associadas" },
        { status: 400 }
      );
    }

    // Deletar faturas do cartão
    await prisma.fatura.deleteMany({
      where: { cartaoId: params.id },
    });

    // Deletar cartão
    await prisma.cartaoCredito.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ mensagem: "Cartão excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cartão:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
