import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pagamentoSchema = z.object({
  valorPago: z.number().positive("Valor deve ser maior que zero"),
  contaBancariaId: z.string().optional().nullable(),
  dataPagamento: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = pagamentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;
    const emprestimoId = params.id;

    // Buscar empréstimo
    const emprestimo = await prisma.emprestimo.findFirst({
      where: {
        id: emprestimoId,
        usuarioId: session.user.id,
      },
    });

    if (!emprestimo) {
      return NextResponse.json({ erro: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (emprestimo.status === "QUITADO") {
      return NextResponse.json({ erro: "Empréstimo já está quitado" }, { status: 400 });
    }

    // Calcular quantas parcelas serão pagas
    const parcelasAPagar = Math.ceil(dados.valorPago / emprestimo.valorParcela);
    const novasParcelasPagas = emprestimo.parcelasPagas + parcelasAPagar;
    
    // Verificar se não ultrapassa o total de parcelas
    if (novasParcelasPagas > emprestimo.numeroParcelas) {
      return NextResponse.json(
        { 
          erro: "Valor ultrapassa o total restante do empréstimo",
          valorMaximo: (emprestimo.numeroParcelas - emprestimo.parcelasPagas) * emprestimo.valorParcela
        },
        { status: 400 }
      );
    }

    // Atualizar empréstimo
    const novoStatus = novasParcelasPagas >= emprestimo.numeroParcelas ? "QUITADO" : "ATIVO";
    
    const emprestimoAtualizado = await prisma.emprestimo.update({
      where: { id: emprestimoId },
      data: {
        parcelasPagas: novasParcelasPagas,
        status: novoStatus,
      },
    });

    // Criar parcelas de empréstimo pagas
    for (let i = 0; i < parcelasAPagar; i++) {
      const numeroParcela = emprestimo.parcelasPagas + i + 1;
      
      await prisma.parcelaEmprestimo.create({
        data: {
          emprestimoId,
          numeroParcela,
          valor: emprestimo.valorParcela,
          dataVencimento: dados.dataPagamento,
          dataPagamento: dados.dataPagamento,
          status: "PAGO",
        },
      });
    }

    // Se foi informada uma conta bancária, criar transação de débito
    if (dados.contaBancariaId) {
      const conta = await prisma.contaBancaria.findFirst({
        where: {
          id: dados.contaBancariaId,
          usuarioId: session.user.id,
        },
      });

      if (conta) {
        // Criar transação de pagamento
        await prisma.transacao.create({
          data: {
            tipo: "DESPESA",
            descricao: `Pagamento empréstimo ${emprestimo.instituicao} - ${parcelasAPagar} parcela(s)`,
            valor: dados.valorPago,
            dataCompetencia: dados.dataPagamento,
            status: "PAGO",
            contaBancariaId: dados.contaBancariaId,
            observacoes: dados.observacoes,
            usuarioId: session.user.id,
          },
        });

        // Atualizar saldo da conta
        await prisma.contaBancaria.update({
          where: { id: dados.contaBancariaId },
          data: {
            saldoAtual: {
              decrement: dados.valorPago,
            },
            saldoDisponivel: {
              decrement: dados.valorPago,
            },
          },
        });
      }
    }

    const parcelasRestantes = emprestimo.numeroParcelas - novasParcelasPagas;

    return NextResponse.json({
      mensagem: novoStatus === "QUITADO" 
        ? "Empréstimo quitado completamente!" 
        : `Pagamento registrado com sucesso! ${parcelasAPagar} parcela(s) paga(s).`,
      emprestimo: emprestimoAtualizado,
      parcelasPagas: parcelasAPagar,
      parcelasRestantes,
      valorPago: dados.valorPago,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
