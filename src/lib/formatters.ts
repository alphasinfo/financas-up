import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('pt-br');
dayjs.tz.setDefault('America/Sao_Paulo');

/**
 * Arredonda valor para 2 casas decimais
 */
export function arredondarValor(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula parcelas distribuindo centavos corretamente
 * Garante que a soma das parcelas seja exatamente igual ao valor total
 */
export function calcularParcelas(valorTotal: number, numeroParcelas: number): number[] {
  const valorBase = Math.floor((valorTotal * 100) / numeroParcelas) / 100;
  const centavosRestantes = Math.round((valorTotal - (valorBase * numeroParcelas)) * 100);
  
  const parcelas: number[] = [];
  for (let i = 0; i < numeroParcelas; i++) {
    // Distribui os centavos restantes nas primeiras parcelas
    const valorParcela = i < centavosRestantes 
      ? arredondarValor(valorBase + 0.01)
      : valorBase;
    parcelas.push(valorParcela);
  }
  
  return parcelas;
}

/**
 * Formata valor monetário para BRL
 */
export function formatarMoeda(valor: number): string {
  // Arredondar para evitar problemas de precisão de ponto flutuante
  const valorArredondado = arredondarValor(valor);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorArredondado);
}

/**
 * Formata data para padrão brasileiro
 */
export function formatarData(data: Date | string, formato: string = 'DD/MM/YYYY'): string {
  return dayjs(data).tz('America/Sao_Paulo').format(formato);
}

/**
 * Formata data e hora para padrão brasileiro
 */
export function formatarDataHora(data: Date | string): string {
  return dayjs(data).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
}

/**
 * Retorna data atual no timezone de São Paulo
 */
export function dataAtual(): Date {
  return dayjs().tz('America/Sao_Paulo').toDate();
}

/**
 * Converte string de data para Date no timezone correto
 */
export function parseData(dataStr: string, formato: string = 'DD/MM/YYYY'): Date {
  return dayjs.tz(dataStr, formato, 'America/Sao_Paulo').toDate();
}

/**
 * Calcula a fatura correta baseado na data de fechamento
 * 
 * REGRA CORRETA DE CARTÃO DE CRÉDITO:
 * - O dia de fechamento NÃO é faturado, entra na próxima fatura
 * - Compras ATÉ o dia ANTERIOR ao fechamento entram na fatura atual
 * - Compras A PARTIR do dia de fechamento entram na PRÓXIMA fatura
 * 
 * Exemplo: Fechamento dia 5, Vencimento dia 15
 * - Compras entre 05/09 e 04/10 → Fatura de OUTUBRO (fecha 05/10, vence 15/10)
 * - Compras entre 05/10 e 04/11 → Fatura de NOVEMBRO (fecha 05/11, vence 15/11)
 * 
 * Implementação:
 * - Se dia da compra >= dia de fechamento: fatura do PRÓXIMO mês
 * - Se dia da compra < dia de fechamento: fatura do MÊS ATUAL
 */
export function calcularFaturaCartao(
  dataCompra: Date,
  diaFechamento: number
): { mes: number; ano: number } {
  // Garantir que estamos trabalhando com timezone correto
  const data = dayjs(dataCompra).tz('America/Sao_Paulo');
  const diaCompra = data.date();
  const mesCompra = data.month() + 1; // 1-12
  const anoCompra = data.year();
  
  console.log(`📅 Calculando fatura: Compra ${diaCompra}/${mesCompra}/${anoCompra}, Fechamento dia ${diaFechamento}`);
  
  // Se a compra foi feita NO DIA DE FECHAMENTO OU DEPOIS
  // ela entra na fatura do PRÓXIMO mês
  if (diaCompra >= diaFechamento) {
    const proximaFatura = data.add(1, 'month');
    const resultado = {
      mes: proximaFatura.month() + 1, // dayjs retorna 0-11
      ano: proximaFatura.year(),
    };
    console.log(`✅ Compra NO/APÓS fechamento (dia ${diaCompra} >= ${diaFechamento}) → Fatura ${resultado.mes}/${resultado.ano}`);
    return resultado;
  }
  
  // Se a compra foi feita ANTES do dia de fechamento
  // ela entra na fatura do MÊS ATUAL
  const resultado = {
    mes: mesCompra,
    ano: anoCompra,
  };
  console.log(`✅ Compra ANTES fechamento (dia ${diaCompra} < ${diaFechamento}) → Fatura ${resultado.mes}/${resultado.ano}`);
  return resultado;
}

/**
 * Formata número de parcela (ex: "1/12")
 */
export function formatarParcela(atual: number, total: number): string {
  return `${atual}/${total}`;
}

/**
 * Calcula porcentagem
 */
export function calcularPorcentagem(valor: number, total: number): number {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

/**
 * Formata porcentagem
 */
export function formatarPorcentagem(valor: number): string {
  return `${valor.toFixed(1)}%`;
}
