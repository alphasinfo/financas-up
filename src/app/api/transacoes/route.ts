import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calcularFaturaCartao, arredondarValor } from "@/lib/formatters";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { registrarLogAcesso } from "@/lib/log-acesso";

// Desabilitar cache para esta rota
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const transacaoSchema = z.object({
  tipo: z.enum(["RECEITA", "DESPESA", "TRANSFERENCIA"]),
  descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  dataCompetencia: z.string().transform((val) => {
    // Normalizar data para meio-dia no fuso local para evitar problemas
    // Formato esperado: YYYY-MM-DD
    const [ano, mes, dia] = val.split('T')[0].split('-').map(Number);
    const data = new Date(ano, mes - 1, dia, 12, 0, 0, 0);
    console.log(`📅 Data recebida: ${val} → Normalizada: ${data.toISOString()} (Local: ${data.toLocaleDateString('pt-BR')})`);
    return data;
  }),
  status: z.enum(["PENDENTE", "PAGO", "RECEBIDO", "AGENDADO", "VENCIDO", "CANCELADO"]).optional().default("PAGO"),
  categoriaId: z.string().optional().nullable(),
  contaBancariaId: z.string().optional().nullable(),
  cartaoCreditoId: z.string().optional().nullable(),
  parcelado: z.boolean().optional().default(false),
  numeroParcelas: z.number().optional().default(1),
  observacoes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Filtros opcionais de data (para calendário)
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const where: any = { usuarioId: session.user.id };

    // Aplicar filtro de data se fornecido
    if (dataInicio && dataFim) {
      where.dataCompetencia = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    const transacoes = await prisma.transacao.findMany({
      where,
      orderBy: { dataCompetencia: "desc" },
      include: {
        categoria: true,
        contaBancaria: true,
        cartaoCredito: true,
      },
    });

    return NextResponse.json(transacoes);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Erro ao buscar transações:", error);
    }
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = transacaoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;

    // Se for despesa com cartão de crédito
    if (dados.tipo === "DESPESA" && dados.cartaoCreditoId) {
      const cartao = await prisma.cartaoCredito.findUnique({
        where: { id: dados.cartaoCreditoId },
      });

      if (!cartao) {
        return NextResponse.json(
          { erro: "Cartão não encontrado" },
          { status: 404 }
        );
      }

      // Verificar limite disponível
      // IMPORTANTE: Validamos o valor TOTAL da compra, não apenas uma parcela
      // O limite é bloqueado pelo valor total, mesmo que seja parcelado
      const valorTotalCompra = dados.valor;
      
      if (cartao.limiteDisponivel < valorTotalCompra) {
        return NextResponse.json(
          { 
            erro: "Limite insuficiente no cartão",
            detalhes: {
              valorCompra: valorTotalCompra,
              limiteDisponivel: cartao.limiteDisponivel,
              limiteTotal: cartao.limiteTotal,
              faltam: arredondarValor(valorTotalCompra - cartao.limiteDisponivel)
            }
          },
          { status: 400 }
        );
      }
      
      console.log(`✅ Limite OK: Compra R$ ${dados.valor} | Disponível R$ ${cartao.limiteDisponivel}`);

      // Calcular fatura correta baseado na data de fechamento
      const { mes, ano } = calcularFaturaCartao(
        dados.dataCompetencia,
        cartao.diaFechamento
      );

      // Buscar ou criar fatura
      let fatura = await prisma.fatura.findUnique({
        where: {
          cartaoId_mesReferencia_anoReferencia: {
            cartaoId: cartao.id,
            mesReferencia: mes,
            anoReferencia: ano,
          },
        },
      });

      if (!fatura) {
        // Criar fatura
        // Fechamento: mês ANTERIOR ao mês de referência
        // Exemplo: Fatura de Novembro fecha em 10/Outubro
        const dataFechamento = dayjs()
          .year(ano)
          .month(mes - 2) // Mês anterior
          .date(cartao.diaFechamento)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toDate();
        
        // Vencimento: no mês de referência
        // Exemplo: Fatura de Novembro vence em 20/Novembro
        const dataVencimento = dayjs()
          .year(ano)
          .month(mes - 1)
          .date(cartao.diaVencimento)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toDate();

        fatura = await prisma.fatura.create({
          data: {
            cartaoId: cartao.id,
            mesReferencia: mes,
            anoReferencia: ano,
            dataFechamento,
            dataVencimento,
            valorTotal: 0,
            valorPago: 0,
            status: "ABERTA",
          },
        });
      }

      // Criar transações (uma para cada parcela se parcelado)
      if (dados.parcelado && dados.numeroParcelas && dados.numeroParcelas > 1) {
        // Calcular parcelas com distribuição correta de centavos
        const { calcularParcelas } = await import("@/lib/formatters");
        const valoresParcelas = calcularParcelas(dados.valor, dados.numeroParcelas);
        const transacoes = [];

        for (let i = 0; i < dados.numeroParcelas; i++) {
          const valorParcela = valoresParcelas[i];
          const dataParcela = new Date(dados.dataCompetencia);
          dataParcela.setMonth(dataParcela.getMonth() + i);

          const { mes: mesParcela, ano: anoParcela } = calcularFaturaCartao(
            dataParcela,
            cartao.diaFechamento
          );

          // Buscar ou criar fatura da parcela
          let faturaParcela = await prisma.fatura.findUnique({
            where: {
              cartaoId_mesReferencia_anoReferencia: {
                cartaoId: cartao.id,
                mesReferencia: mesParcela,
                anoReferencia: anoParcela,
              },
            },
          });

          if (!faturaParcela) {
            const dataFechamentoParcela = dayjs()
              .year(anoParcela)
              .month(mesParcela - 2) // Mês anterior
              .date(cartao.diaFechamento)
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate();
            
            const dataVencimentoParcela = dayjs()
              .year(anoParcela)
              .month(mesParcela - 1)
              .date(cartao.diaVencimento)
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate();

            faturaParcela = await prisma.fatura.create({
              data: {
                cartaoId: cartao.id,
                mesReferencia: mesParcela,
                anoReferencia: anoParcela,
                dataFechamento: dataFechamentoParcela,
                dataVencimento: dataVencimentoParcela,
                valorTotal: 0,
                valorPago: 0,
                status: "ABERTA",
              },
            });
          }

          const transacao = await prisma.transacao.create({
            data: {
              tipo: dados.tipo,
              descricao: `${dados.descricao} (${i + 1}/${dados.numeroParcelas})`,
              valor: arredondarValor(valorParcela),
              dataCompetencia: dataParcela,
              status: "PENDENTE",
              parcelado: true,
              parcelaAtual: i + 1,
              parcelaTotal: dados.numeroParcelas,
              categoriaId: dados.categoriaId,
              cartaoCreditoId: dados.cartaoCreditoId,
              faturaId: faturaParcela.id,
              observacoes: dados.observacoes,
              usuarioId: session.user.id,
            },
          });

          // Atualizar valor da fatura
          await prisma.fatura.update({
            where: { id: faturaParcela.id },
            data: {
              valorTotal: {
                increment: arredondarValor(valorParcela),
              },
            },
          });

          transacoes.push(transacao);
        }

        // Atualizar limite disponível do cartão
        // Decrementa apenas o valor da compra, não o total das parcelas
        await prisma.cartaoCredito.update({
          where: { id: cartao.id },
          data: {
            limiteDisponivel: {
              decrement: arredondarValor(dados.valor),
            },
          },
        });

        // Revalidar páginas que usam transações
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/financeiro');
        revalidatePath('/dashboard/calendario');
        revalidatePath('/dashboard/relatorios');
        revalidatePath('/dashboard/cartoes');
        revalidatePath(`/dashboard/cartoes/${cartao.id}`);

        return NextResponse.json(
          { mensagem: "Despesa parcelada criada com sucesso", transacoes },
          { status: 201 }
        );
      } else {
        // Transação única
        const transacao = await prisma.transacao.create({
          data: {
            tipo: dados.tipo,
            descricao: dados.descricao,
            valor: arredondarValor(dados.valor),
            dataCompetencia: dados.dataCompetencia,
            status: "PENDENTE",
            categoriaId: dados.categoriaId,
            cartaoCreditoId: dados.cartaoCreditoId,
            faturaId: fatura.id,
            observacoes: dados.observacoes,
            usuarioId: session.user.id,
          },
        });

        // Atualizar valor da fatura
        await prisma.fatura.update({
          where: { id: fatura.id },
          data: {
            valorTotal: {
              increment: arredondarValor(dados.valor),
            },
          },
        });

        // Atualizar limite disponível do cartão
        await prisma.cartaoCredito.update({
          where: { id: cartao.id },
          data: {
            limiteDisponivel: {
              decrement: arredondarValor(dados.valor),
            },
          },
        });

        // Revalidar páginas que usam transações
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/financeiro');
        revalidatePath('/dashboard/calendario');
        revalidatePath('/dashboard/relatorios');
        revalidatePath('/dashboard/cartoes');
        revalidatePath(`/dashboard/cartoes/${cartao.id}`);

        return NextResponse.json(transacao, { status: 201 });
      }
    }

    // Se for despesa com conta bancária
    if (dados.tipo === "DESPESA" && dados.contaBancariaId) {
      const conta = await prisma.contaBancaria.findUnique({
        where: { id: dados.contaBancariaId },
      });

      if (!conta) {
        return NextResponse.json(
          { erro: "Conta não encontrada" },
          { status: 404 }
        );
      }

      const valorArredondado = arredondarValor(dados.valor);
      const statusTransacao = dados.status || "PAGO";
      
      // Validar saldo e crédito especial apenas se for PAGO
      if (statusTransacao === "PAGO") {
        const novoSaldo = conta.saldoAtual - valorArredondado;

        // Se não tem crédito especial, não pode ficar negativo
        if (!conta.temLimiteCredito && novoSaldo < 0) {
          return NextResponse.json(
            { 
              erro: "Saldo insuficiente. Esta conta não possui crédito especial.",
              detalhes: {
                saldoAtual: conta.saldoAtual,
                valorDespesa: valorArredondado,
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
                valorDespesa: valorArredondado,
                saldoAposOperacao: novoSaldo,
              }
            },
            { status: 400 }
          );
        }
      }
      
      const transacao = await prisma.transacao.create({
        data: {
          tipo: dados.tipo,
          descricao: dados.descricao,
          valor: valorArredondado,
          dataCompetencia: dados.dataCompetencia,
          dataLiquidacao: (statusTransacao === "PAGO" || statusTransacao === "RECEBIDO") ? dados.dataCompetencia : null,
          status: statusTransacao,
          categoriaId: dados.categoriaId,
          contaBancariaId: dados.contaBancariaId,
          observacoes: dados.observacoes,
          usuarioId: session.user.id,
        },
      });

      // Atualizar saldo da conta apenas se status for PAGO
      if (statusTransacao === "PAGO") {
        await prisma.contaBancaria.update({
          where: { id: conta.id },
          data: {
            saldoAtual: {
              decrement: valorArredondado,
            },
            saldoDisponivel: {
              decrement: valorArredondado,
            },
          },
        });
      }

      // Revalidar páginas que usam transações
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/financeiro');
      revalidatePath('/dashboard/calendario');
      revalidatePath('/dashboard/relatorios');

      return NextResponse.json(transacao, { status: 201 });
    }

    // Se for receita
    if (dados.tipo === "RECEITA") {
      const valorArredondado = arredondarValor(dados.valor);
      const statusTransacao = dados.status || "RECEBIDO";
      
      const transacao = await prisma.transacao.create({
        data: {
          tipo: dados.tipo,
          descricao: dados.descricao,
          valor: valorArredondado,
          dataCompetencia: dados.dataCompetencia,
          dataLiquidacao: (statusTransacao === "RECEBIDO" || statusTransacao === "PAGO") ? dados.dataCompetencia : null,
          status: statusTransacao,
          categoriaId: dados.categoriaId,
          contaBancariaId: dados.contaBancariaId,
          observacoes: dados.observacoes,
          usuarioId: session.user.id,
        },
      });

      // Se tiver conta bancária e status for RECEBIDO, atualizar saldo
      if (dados.contaBancariaId && statusTransacao === "RECEBIDO") {
        await prisma.contaBancaria.update({
          where: { id: dados.contaBancariaId },
          data: {
            saldoAtual: {
              increment: valorArredondado,
            },
            saldoDisponivel: {
              increment: valorArredondado,
            },
          },
        });
      }

      // Registrar log de acesso
      await registrarLogAcesso(
        session.user.id,
        'CRIAR',
        'TRANSACAO',
        transacao.id
      );

      // Revalidar páginas que usam transações
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/financeiro');
      revalidatePath('/dashboard/calendario');
      revalidatePath('/dashboard/relatorios');

      return NextResponse.json(transacao, { status: 201 });
    }

    return NextResponse.json(
      { erro: "Tipo de transação inválido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
