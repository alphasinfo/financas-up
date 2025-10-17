import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calcularEmprestimo, converterTaxaAnualParaMensal, converterTaxaMensalParaAnual } from "@/lib/emprestimo";
import { arredondarValor } from "@/lib/formatters";

const emprestimoSchema = z.object({
  instituicao: z.string().min(2, "Instituição deve ter no mínimo 2 caracteres"),
  descricao: z.string().optional().nullable(),
  valorTotal: z.number().positive("Valor deve ser maior que zero"),
  numeroParcelas: z.number().min(1).max(360),
  taxaJurosMensal: z.number().optional().nullable(),
  taxaJurosAnual: z.number().optional().nullable(),
  sistemaAmortizacao: z.enum(["PRICE", "SAC"]).default("PRICE"),
  dataContratacao: z.coerce.date(),
  diaVencimento: z.number().min(1).max(31),
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

    const emprestimos = await prisma.emprestimo.findMany({
      where: {
        usuarioId: session.user.id,
      },
      include: {
        parcelas: {
          where: dataInicio && dataFim ? {
            dataVencimento: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim),
            }
          } : undefined,
          orderBy: {
            numeroParcela: "asc",
          },
        },
      },
      orderBy: {
        dataContratacao: "desc",
      },
    });

    return NextResponse.json(emprestimos);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Erro ao buscar empréstimos:", error);
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
    const validacao = emprestimoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;
    
    // Determinar taxa de juros mensal
    let taxaJurosMensal = dados.taxaJurosMensal || 0;
    let taxaJurosAnual = dados.taxaJurosAnual || 0;
    
    // Se forneceu taxa anual, converter para mensal
    if (dados.taxaJurosAnual && !dados.taxaJurosMensal) {
      taxaJurosMensal = converterTaxaAnualParaMensal(dados.taxaJurosAnual);
    }
    // Se forneceu taxa mensal, calcular anual
    else if (dados.taxaJurosMensal && !dados.taxaJurosAnual) {
      taxaJurosAnual = converterTaxaMensalParaAnual(dados.taxaJurosMensal);
    }
    
    console.log(`📊 Calculando empréstimo ${dados.sistemaAmortizacao}:`);
    console.log(`   Valor: R$ ${dados.valorTotal}`);
    console.log(`   Parcelas: ${dados.numeroParcelas}`);
    console.log(`   Taxa Mensal: ${taxaJurosMensal.toFixed(2)}%`);
    console.log(`   Taxa Anual: ${taxaJurosAnual.toFixed(2)}%`);
    
    // Calcular parcelas usando Price ou SAC
    const resultado = calcularEmprestimo(
      dados.valorTotal,
      taxaJurosMensal,
      dados.numeroParcelas,
      dados.sistemaAmortizacao
    );
    
    // Valor da parcela (primeira parcela para referência)
    const valorParcela = resultado.parcelas[0].valorParcela;
    
    console.log(`   Primeira parcela: R$ ${valorParcela}`);
    console.log(`   Total de juros: R$ ${resultado.valorTotalJuros}`);
    console.log(`   Total a pagar: R$ ${resultado.valorTotalPago}`);

    // Criar empréstimo
    const emprestimo = await prisma.emprestimo.create({
      data: {
        instituicao: dados.instituicao,
        descricao: dados.descricao,
        valorTotal: arredondarValor(dados.valorTotal),
        valorParcela: arredondarValor(valorParcela),
        numeroParcelas: dados.numeroParcelas,
        parcelasPagas: 0,
        taxaJurosMensal: arredondarValor(taxaJurosMensal),
        taxaJurosAnual: arredondarValor(taxaJurosAnual),
        sistemaAmortizacao: dados.sistemaAmortizacao,
        dataContratacao: dados.dataContratacao,
        diaVencimento: dados.diaVencimento,
        status: "ATIVO",
        usuarioId: session.user.id,
      },
    });

    // Criar parcelas com valores calculados
    const parcelas = [];
    for (let i = 0; i < resultado.parcelas.length; i++) {
      const parcelaCalc = resultado.parcelas[i];
      const dataVencimento = new Date(dados.dataContratacao);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i + 1));
      dataVencimento.setDate(dados.diaVencimento);

      parcelas.push({
        emprestimoId: emprestimo.id,
        numeroParcela: parcelaCalc.numero,
        numero: parcelaCalc.numero,
        valor: parcelaCalc.valorParcela,
        valorAmortizacao: parcelaCalc.valorAmortizacao,
        valorJuros: parcelaCalc.valorJuros,
        saldoDevedor: parcelaCalc.saldoDevedor,
        dataVencimento,
        status: "PENDENTE",
      });
    }

    await prisma.parcelaEmprestimo.createMany({
      data: parcelas,
    });

    return NextResponse.json(emprestimo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
