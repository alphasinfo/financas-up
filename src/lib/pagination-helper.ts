/**
 * Helper de Paginação
 * Implementa paginação consistente em todas as APIs
 */

import { z } from 'zod';

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Schema de validação para paginação
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Extrai parâmetros de paginação da URL
 */
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const params = {
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '50',
    orderBy: searchParams.get('orderBy') || undefined,
    order: searchParams.get('order') || 'desc',
  };

  const validated = paginationSchema.parse(params);
  return validated;
}

/**
 * Calcula skip e take para Prisma
 */
export function getPrismaSkipTake(params: PaginationParams) {
  const skip = (params.page - 1) * params.limit;
  const take = params.limit;
  
  return { skip, take };
}

/**
 * Cria resposta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
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
 * Helper completo para paginação com Prisma
 */
export async function paginateQuery<T>(
  query: {
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  },
  params: PaginationParams,
  prismaModel: any
): Promise<PaginatedResponse<T>> {
  const { skip, take } = getPrismaSkipTake(params);

  // Construir orderBy
  const orderBy = params.orderBy
    ? { [params.orderBy]: params.order }
    : query.orderBy;

  // Executar queries em paralelo
  const [data, total] = await Promise.all([
    prismaModel.findMany({
      ...query,
      orderBy,
      skip,
      take,
    }),
    prismaModel.count({ where: query.where }),
  ]);

  return createPaginatedResponse(data, total, params);
}

/**
 * Paginação cursor-based (mais eficiente para grandes datasets)
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function paginateWithCursor<T extends { id: string }>(
  query: {
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  },
  params: CursorPaginationParams,
  prismaModel: any
): Promise<CursorPaginatedResponse<T>> {
  const { cursor, limit, orderBy: orderByField, order } = params;

  // Buscar limit + 1 para saber se há mais
  const data = await prismaModel.findMany({
    ...query,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Pular o cursor
    orderBy: orderByField ? { [orderByField]: order } : query.orderBy,
  });

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    data: items,
    nextCursor,
    hasMore,
  };
}

/**
 * Exemplo de uso:
 * 
 * // Paginação offset-based (simples)
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const params = getPaginationParams(searchParams);
 *   
 *   const result = await paginateQuery(
 *     {
 *       where: { usuarioId },
 *       orderBy: { criadoEm: 'desc' },
 *     },
 *     params,
 *     prisma.transacao
 *   );
 *   
 *   return NextResponse.json(result);
 * }
 * 
 * // Paginação cursor-based (performance)
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const cursor = searchParams.get('cursor') || undefined;
 *   const limit = parseInt(searchParams.get('limit') || '50');
 *   
 *   const result = await paginateWithCursor(
 *     {
 *       where: { usuarioId },
 *       orderBy: { criadoEm: 'desc' },
 *     },
 *     { cursor, limit },
 *     prisma.transacao
 *   );
 *   
 *   return NextResponse.json(result);
 * }
 */
