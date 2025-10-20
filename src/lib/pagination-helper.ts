/**
 * Helper de Paginação
 * 
 * Utilitários para paginação de dados:
 * - Cálculo de offset
 * - Validação de parâmetros
 * - Metadados de paginação
 * - Limites de página
 */

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationValidation {
  isValid: boolean;
  errors: string[];
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
  startItem: number;
  endItem: number;
  prevPage: number | null;
  nextPage: number | null;
  firstPage: number;
  lastPage: number;
}

/**
 * Calcular paginação básica
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 50
): PaginationResult {
  // Validar e corrigir valores
  const validPage = Math.max(1, Math.floor(page) || 1);
  const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 50));
  
  // Calcular offset
  const offset = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
}

/**
 * Validar parâmetros de paginação
 */
export function validatePaginationParams(params: PaginationParams): PaginationValidation {
  const errors: string[] = [];
  
  // Converter para números
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : (params.page || 1);
  const limit = typeof params.limit === 'string' ? parseInt(params.limit, 10) : (params.limit || 50);
  
  // Validar página
  if (isNaN(page) || page < 1) {
    errors.push('Página deve ser maior que 0');
  }
  
  // Validar limite
  if (isNaN(limit) || limit < 1 || limit > 100) {
    errors.push('Limite deve ser entre 1 e 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    page: Math.max(1, page || 1),
    limit: Math.min(100, Math.max(1, limit || 50)),
  };
}

/**
 * Criar resposta de paginação
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Obter metadados de paginação
 */
export function getPaginationMetadata(
  total: number,
  page: number,
  limit: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  // Calcular range de itens
  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + limit, total);
  
  // Calcular páginas de navegação
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  
  return {
    total,
    page,
    limit,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    startItem,
    endItem,
    prevPage,
    nextPage,
    firstPage: 1,
    lastPage: totalPages,
  };
}

/**
 * Gerar links de paginação
 */
export function generatePaginationLinks(
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  limit: number,
  maxLinks: number = 5
): Array<{
  page: number;
  url: string;
  label: string;
  active: boolean;
  disabled: boolean;
}> {
  const links = [];
  
  // Calcular range de páginas a mostrar
  const halfMax = Math.floor(maxLinks / 2);
  let startPage = Math.max(1, currentPage - halfMax);
  let endPage = Math.min(totalPages, currentPage + halfMax);
  
  // Ajustar se não temos páginas suficientes
  if (endPage - startPage + 1 < maxLinks) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxLinks - 1);
    } else {
      startPage = Math.max(1, endPage - maxLinks + 1);
    }
  }
  
  // Link "Anterior"
  links.push({
    page: currentPage - 1,
    url: `${baseUrl}?page=${currentPage - 1}&limit=${limit}`,
    label: 'Anterior',
    active: false,
    disabled: currentPage <= 1,
  });
  
  // Links das páginas
  for (let page = startPage; page <= endPage; page++) {
    links.push({
      page,
      url: `${baseUrl}?page=${page}&limit=${limit}`,
      label: page.toString(),
      active: page === currentPage,
      disabled: false,
    });
  }
  
  // Link "Próximo"
  links.push({
    page: currentPage + 1,
    url: `${baseUrl}?page=${currentPage + 1}&limit=${limit}`,
    label: 'Próximo',
    active: false,
    disabled: currentPage >= totalPages,
  });
  
  return links;
}

/**
 * Calcular estatísticas de paginação
 */
export function calculatePaginationStats(
  total: number,
  page: number,
  limit: number
): {
  showing: string;
  pages: string;
  items: string;
} {
  const metadata = getPaginationMetadata(total, page, limit);
  
  return {
    showing: total === 0 
      ? 'Nenhum item encontrado'
      : `Mostrando ${metadata.startItem} a ${metadata.endItem} de ${total} itens`,
    pages: `Página ${page} de ${metadata.totalPages}`,
    items: `${total} item${total !== 1 ? 's' : ''} no total`,
  };
}

/**
 * Obter parâmetros de paginação da URL
 */
export function getPaginationFromUrl(searchParams: URLSearchParams): PaginationResult {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  return calculatePagination(page, limit);
}

/**
 * Criar URL com parâmetros de paginação
 */
export function createPaginationUrl(
  baseUrl: string,
  page: number,
  limit: number,
  additionalParams?: Record<string, string>
): string {
  const url = new URL(baseUrl, 'http://localhost');
  
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.pathname + url.search;
}

/**
 * Constantes de paginação
 */
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  MAX_LINKS: 5,
} as const;/**

 * Funções compatíveis com os testes
 */

/**
 * Extrair parâmetros de paginação de URLSearchParams
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  orderBy?: string;
} {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const orderBy = searchParams.get('orderBy') || undefined;
  
  // Validações que lançam erro
  if (limit > 100) {
    throw new Error('Limite máximo é 100');
  }
  
  if (page < 1) {
    throw new Error('Página deve ser maior que 0');
  }
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    order,
    orderBy,
  };
}

/**
 * Obter skip e take para Prisma
 */
export function getPrismaSkipTake(params: { page: number; limit: number; order: 'asc' | 'desc' }): {
  skip: number;
  take: number;
} {
  const skip = (params.page - 1) * params.limit;
  const take = params.limit;
  
  return { skip, take };
}

/**
 * Criar resposta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: { page: number; limit: number; order: 'asc' | 'desc' }
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

/**
 * Schema de validação de paginação (compatível com testes)
 */
export const paginationSchema = {
  safeParse: (data: any) => {
    // Não aplicar valores padrão se os valores foram explicitamente fornecidos
    const page = data.page !== undefined ? data.page : 1;
    const limit = data.limit !== undefined ? data.limit : 50;
    const order = data.order || 'desc';
    
    // Validações mais rigorosas
    let finalPage = page;
    let finalLimit = limit;
    
    // Validar page
    if (typeof page === 'string') {
      const parsedPage = parseInt(page, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        return { success: false };
      }
      finalPage = parsedPage;
    } else if (typeof page === 'number') {
      if (page < 1) {
        return { success: false };
      }
      finalPage = page;
    } else if (page !== undefined && (page === 0 || page < 0)) {
      return { success: false };
    }
    
    // Validar limit
    if (typeof limit === 'string') {
      const parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return { success: false };
      }
      finalLimit = parsedLimit;
    } else if (typeof limit === 'number') {
      if (limit < 1 || limit > 100) {
        return { success: false };
      }
      finalLimit = limit;
    }
    
    return {
      success: true,
      data: {
        page: finalPage,
        limit: finalLimit,
        order,
      },
    };
  },
};