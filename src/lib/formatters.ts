/**
 * Formatadores de Dados
 * 
 * Funções utilitárias para formatação de:
 * - Moeda (BRL, USD, EUR)
 * - Data (pt-BR, en-US)
 * - Porcentagem
 * - Números
 * - CPF/CNPJ
 * - Telefone
 * - CEP
 */

/**
 * Formatar valor monetário
 */
export function formatCurrency(
  value: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Ajustar símbolo para moedas específicas
  let formatted = formatter.format(value);
  
  if (currency === 'USD') {
    formatted = formatted.replace(/^US\$/, 'US$').replace(/^USUS\$/, 'US$');
  }
  
  return formatted;
}

/**
 * Alias para compatibilidade com testes
 */
export const formatarMoeda = formatCurrency;

/**
 * Formatar data
 */
export function formatDate(
  date: Date | string,
  format: 'date' | 'datetime' | 'time' = 'date',
  locale: string = 'pt-BR'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'date':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'datetime':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Alias para compatibilidade com testes
 */
export const formatarData = formatDate;

/**
 * Formatar porcentagem
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  locale: string = 'pt-BR'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}

/**
 * Formatar número
 */
export function formatNumber(
  value: number,
  decimals?: number,
  locale: string = 'pt-BR'
): string {
  const options: Intl.NumberFormatOptions = {};
  
  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }

  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formatar CPF
 */
export function formatCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Se não tem 11 dígitos, retorna como está
  if (cleaned.length !== 11) {
    return cpf;
  }
  
  // Aplica máscara: 000.000.000-00
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Se não tem 14 dígitos, retorna como está
  if (cleaned.length !== 14) {
    return cnpj;
  }
  
  // Aplica máscara: 00.000.000/0000-00
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formatar telefone
 */
export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Celular (11 dígitos): (00) 90000-0000
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // Fixo (10 dígitos): (00) 0000-0000
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Se não tem formato válido, retorna como está
  return phone;
}

/**
 * Formatar CEP
 */
export function formatCEP(cep: string): string {
  // Remove caracteres não numéricos
  const cleaned = cep.replace(/\D/g, '');
  
  // Se não tem 8 dígitos, retorna como está
  if (cleaned.length !== 8) {
    return cep;
  }
  
  // Aplica máscara: 00000-000
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formatar tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatar tempo relativo (ex: "há 2 horas")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `há ${diffInYears} ano${diffInYears > 1 ? 's' : ''}`;
}

/**
 * Truncar texto
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalizar primeira letra
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formatar nome próprio
 */
export function formatProperName(name: string): string {
  if (!name) return name;
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Não capitalizar preposições
      const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e'];
      if (prepositions.includes(word)) {
        return word;
      }
      return capitalize(word);
    })
    .join(' ');
}

/**
 * Arredondar valor para 2 casas decimais
 */
export function arredondarValor(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcular porcentagem
 */
export function calcularPorcentagem(valor: number, total: number): number {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

/**
 * Formatar porcentagem
 */
export function formatarPorcentagem(value: number, decimals: number = 1): string {
  return formatPercentage(value / 100, decimals);
}

/**
 * Calcular fatura do cartão (versão para transações)
 */
export function calcularFaturaCartao(transacoes: any[]): {
  total: number;
  vencimento: Date;
  fechamento: Date;
};

/**
 * Calcular fatura do cartão (versão para data e dia de fechamento)
 */
export function calcularFaturaCartao(data: Date, diaFechamento: number): {
  mes: number;
  ano: number;
};

/**
 * Implementação da função calcularFaturaCartao (overload)
 */
export function calcularFaturaCartao(
  param1: any[] | Date, 
  param2?: number
): any {
  // Se o primeiro parâmetro é um array, é a versão para transações
  if (Array.isArray(param1)) {
    const transacoes = param1;
    const total = transacoes.reduce((sum, t) => sum + (t.valor || 0), 0);
    const hoje = new Date();
    const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10);
    const fechamento = new Date(hoje.getFullYear(), hoje.getMonth(), 25);
    
    return {
      total: arredondarValor(total),
      vencimento,
      fechamento,
    };
  }
  
  // Se o primeiro parâmetro é uma Date, é a versão para data e dia de fechamento
  if (param1 instanceof Date && typeof param2 === 'number') {
    const data = param1;
    const diaFechamento = param2;
    
    let mes = data.getMonth() + 1; // getMonth() retorna 0-11
    let ano = data.getFullYear();
    
    // Se já passou do dia de fechamento, a fatura é do próximo mês
    if (data.getDate() > diaFechamento) {
      mes += 1;
      if (mes > 12) {
        mes = 1;
        ano += 1;
      }
    }
    
    return { mes, ano };
  }
  
  // Fallback
  return { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
}/**

 * Calcular parcelas com distribuição correta de centavos
 */
export function calcularParcelas(valorTotal: number, numeroParcelas: number): number[] {
  const valorParcela = Math.floor((valorTotal * 100) / numeroParcelas) / 100;
  const resto = Math.round((valorTotal - (valorParcela * numeroParcelas)) * 100) / 100;
  
  const parcelas: number[] = [];
  
  for (let i = 0; i < numeroParcelas; i++) {
    if (i === 0) {
      // Primeira parcela recebe o resto
      parcelas.push(arredondarValor(valorParcela + resto));
    } else {
      parcelas.push(arredondarValor(valorParcela));
    }
  }
  
  return parcelas;
}