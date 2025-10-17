/**
 * Biblioteca de cálculos de empréstimos
 * Suporta sistemas Price (parcelas fixas) e SAC (parcelas decrescentes)
 */

import { arredondarValor } from "./formatters";

export interface ParcelaCalculada {
  numero: number;
  valorParcela: number;
  valorAmortizacao: number;
  valorJuros: number;
  saldoDevedor: number;
}

export interface ResultadoCalculo {
  parcelas: ParcelaCalculada[];
  valorTotalPago: number;
  valorTotalJuros: number;
  valorPrincipal: number;
}

/**
 * Converte taxa de juros anual para mensal
 * Fórmula: (1 + taxa_anual)^(1/12) - 1
 */
export function converterTaxaAnualParaMensal(taxaAnual: number): number {
  return (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
}

/**
 * Converte taxa de juros mensal para anual
 * Fórmula: (1 + taxa_mensal)^12 - 1
 */
export function converterTaxaMensalParaAnual(taxaMensal: number): number {
  return (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100;
}

/**
 * Sistema PRICE (Tabela Price)
 * Parcelas FIXAS com juros decrescentes e amortização crescente
 * Usado em: Empréstimos pessoais, financiamentos de veículos
 * 
 * Fórmula da parcela:
 * PMT = PV × [i × (1 + i)^n] / [(1 + i)^n - 1]
 * 
 * Onde:
 * - PMT = Valor da parcela
 * - PV = Valor presente (principal)
 * - i = Taxa de juros por período (decimal)
 * - n = Número de períodos
 */
export function calcularEmprestimoPrice(
  valorPrincipal: number,
  taxaJurosMensal: number,
  numeroParcelas: number
): ResultadoCalculo {
  const taxa = taxaJurosMensal / 100; // Converter para decimal
  
  // Calcular valor da parcela fixa (PMT)
  const valorParcela = valorPrincipal * 
    (taxa * Math.pow(1 + taxa, numeroParcelas)) / 
    (Math.pow(1 + taxa, numeroParcelas) - 1);
  
  const parcelas: ParcelaCalculada[] = [];
  let saldoDevedor = valorPrincipal;
  let totalJuros = 0;
  
  for (let i = 1; i <= numeroParcelas; i++) {
    // Juros sobre o saldo devedor
    const valorJuros = saldoDevedor * taxa;
    
    // Amortização = Parcela - Juros
    const valorAmortizacao = valorParcela - valorJuros;
    
    // Novo saldo devedor
    saldoDevedor = saldoDevedor - valorAmortizacao;
    
    // Ajustar última parcela para zerar saldo (evitar erros de arredondamento)
    if (i === numeroParcelas) {
      saldoDevedor = 0;
    }
    
    totalJuros += valorJuros;
    
    parcelas.push({
      numero: i,
      valorParcela: arredondarValor(valorParcela),
      valorAmortizacao: arredondarValor(valorAmortizacao),
      valorJuros: arredondarValor(valorJuros),
      saldoDevedor: arredondarValor(Math.max(0, saldoDevedor)),
    });
  }
  
  return {
    parcelas,
    valorTotalPago: arredondarValor(valorParcela * numeroParcelas),
    valorTotalJuros: arredondarValor(totalJuros),
    valorPrincipal: arredondarValor(valorPrincipal),
  };
}

/**
 * Sistema SAC (Sistema de Amortização Constante)
 * Amortização FIXA com parcelas decrescentes
 * Usado em: Financiamentos imobiliários (casa própria)
 * 
 * Características:
 * - Amortização constante = Valor Principal / Número de Parcelas
 * - Juros decrescentes (calculados sobre saldo devedor)
 * - Parcela = Amortização + Juros
 * - Parcelas decrescem ao longo do tempo
 */
export function calcularEmprestimoSAC(
  valorPrincipal: number,
  taxaJurosMensal: number,
  numeroParcelas: number
): ResultadoCalculo {
  const taxa = taxaJurosMensal / 100; // Converter para decimal
  
  // Amortização constante
  const valorAmortizacao = valorPrincipal / numeroParcelas;
  
  const parcelas: ParcelaCalculada[] = [];
  let saldoDevedor = valorPrincipal;
  let totalJuros = 0;
  let totalPago = 0;
  
  for (let i = 1; i <= numeroParcelas; i++) {
    // Juros sobre o saldo devedor
    const valorJuros = saldoDevedor * taxa;
    
    // Parcela = Amortização + Juros
    const valorParcela = valorAmortizacao + valorJuros;
    
    // Novo saldo devedor
    saldoDevedor = saldoDevedor - valorAmortizacao;
    
    // Ajustar última parcela para zerar saldo
    if (i === numeroParcelas) {
      saldoDevedor = 0;
    }
    
    totalJuros += valorJuros;
    totalPago += valorParcela;
    
    parcelas.push({
      numero: i,
      valorParcela: arredondarValor(valorParcela),
      valorAmortizacao: arredondarValor(valorAmortizacao),
      valorJuros: arredondarValor(valorJuros),
      saldoDevedor: arredondarValor(Math.max(0, saldoDevedor)),
    });
  }
  
  return {
    parcelas,
    valorTotalPago: arredondarValor(totalPago),
    valorTotalJuros: arredondarValor(totalJuros),
    valorPrincipal: arredondarValor(valorPrincipal),
  };
}

/**
 * Calcula empréstimo baseado no sistema escolhido
 */
export function calcularEmprestimo(
  valorPrincipal: number,
  taxaJurosMensal: number,
  numeroParcelas: number,
  sistemaAmortizacao: "PRICE" | "SAC" = "PRICE"
): ResultadoCalculo {
  if (sistemaAmortizacao === "SAC") {
    return calcularEmprestimoSAC(valorPrincipal, taxaJurosMensal, numeroParcelas);
  }
  return calcularEmprestimoPrice(valorPrincipal, taxaJurosMensal, numeroParcelas);
}

/**
 * Valida se os valores calculados estão corretos
 * Útil para mostrar ao usuário se há divergência
 */
export function validarCalculoEmprestimo(
  valorPrincipal: number,
  valorParcelaInformado: number,
  taxaJurosMensal: number,
  numeroParcelas: number,
  sistemaAmortizacao: "PRICE" | "SAC" = "PRICE"
): {
  valido: boolean;
  valorCalculado: number;
  diferenca: number;
  mensagem: string;
} {
  const resultado = calcularEmprestimo(
    valorPrincipal,
    taxaJurosMensal,
    numeroParcelas,
    sistemaAmortizacao
  );
  
  // Para SAC, comparar com a primeira parcela (maior)
  const valorCalculado = sistemaAmortizacao === "SAC" 
    ? resultado.parcelas[0].valorParcela
    : resultado.parcelas[0].valorParcela;
  
  const diferenca = Math.abs(valorCalculado - valorParcelaInformado);
  const margemErro = 0.50; // R$ 0,50 de margem
  
  const valido = diferenca <= margemErro;
  
  let mensagem = "";
  if (!valido) {
    if (sistemaAmortizacao === "PRICE") {
      mensagem = `Valor informado: R$ ${valorParcelaInformado.toFixed(2)}. ` +
                 `Valor calculado (PRICE): R$ ${valorCalculado.toFixed(2)}. ` +
                 `Diferença: R$ ${diferenca.toFixed(2)}`;
    } else {
      mensagem = `Valor informado: R$ ${valorParcelaInformado.toFixed(2)}. ` +
                 `Primeira parcela (SAC): R$ ${valorCalculado.toFixed(2)}. ` +
                 `Diferença: R$ ${diferenca.toFixed(2)}. ` +
                 `Nota: No SAC as parcelas diminuem ao longo do tempo.`;
    }
  }
  
  return {
    valido,
    valorCalculado,
    diferenca,
    mensagem,
  };
}

/**
 * Gera resumo comparativo entre Price e SAC
 * Útil para o usuário decidir qual sistema usar
 */
export function compararSistemasAmortizacao(
  valorPrincipal: number,
  taxaJurosMensal: number,
  numeroParcelas: number
): {
  price: {
    parcelaFixa: number;
    totalPago: number;
    totalJuros: number;
  };
  sac: {
    primeiraParcela: number;
    ultimaParcela: number;
    parcelaMedia: number;
    totalPago: number;
    totalJuros: number;
  };
  economia: number;
  recomendacao: string;
} {
  const resultadoPrice = calcularEmprestimoPrice(valorPrincipal, taxaJurosMensal, numeroParcelas);
  const resultadoSAC = calcularEmprestimoSAC(valorPrincipal, taxaJurosMensal, numeroParcelas);
  
  const economia = resultadoPrice.valorTotalJuros - resultadoSAC.valorTotalJuros;
  
  let recomendacao = "";
  if (economia > 100) {
    recomendacao = `SAC é mais econômico: você economiza R$ ${economia.toFixed(2)} em juros. ` +
                   `Ideal para financiamentos de longo prazo (casa, apartamento).`;
  } else if (economia > 0) {
    recomendacao = `SAC é um pouco mais econômico (R$ ${economia.toFixed(2)}), mas a diferença é pequena. ` +
                   `PRICE oferece parcelas fixas, mais fáceis de planejar.`;
  } else {
    recomendacao = `Ambos os sistemas têm custo similar. PRICE oferece parcelas fixas e previsíveis.`;
  }
  
  return {
    price: {
      parcelaFixa: resultadoPrice.parcelas[0].valorParcela,
      totalPago: resultadoPrice.valorTotalPago,
      totalJuros: resultadoPrice.valorTotalJuros,
    },
    sac: {
      primeiraParcela: resultadoSAC.parcelas[0].valorParcela,
      ultimaParcela: resultadoSAC.parcelas[resultadoSAC.parcelas.length - 1].valorParcela,
      parcelaMedia: resultadoSAC.valorTotalPago / numeroParcelas,
      totalPago: resultadoSAC.valorTotalPago,
      totalJuros: resultadoSAC.valorTotalJuros,
    },
    economia: arredondarValor(economia),
    recomendacao,
  };
}
