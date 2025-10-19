/**
 * Helper para Validação Consistente com Zod
 * Garante que todas as APIs validem entrada de forma padronizada
 */

import { NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

/**
 * Valida dados com schema Zod e retorna resposta de erro se inválido
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return {
      success: false,
      response: NextResponse.json(
        {
          erro: firstError.message,
          campo: firstError.path.join('.'),
          detalhes: process.env.NODE_ENV === 'development' ? result.error.errors : undefined,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Middleware de validação para rotas API
 */
export async function withValidation<T>(
  request: Request,
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = validateRequest(schema, body);

    if (!validation.success) {
      return validation.response;
    }

    return await handler(validation.data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { erro: 'JSON inválido' },
        { status: 400 }
      );
    }
    throw error;
  }
}

/**
 * Schemas comuns reutilizáveis
 */
export const commonSchemas = {
  id: z.string().uuid('ID inválido'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  senha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim(),
  
  valor: z.number()
    .positive('Valor deve ser positivo')
    .finite('Valor deve ser finito')
    .refine((val) => Number.isFinite(val), 'Valor inválido'),
  
  data: z.string()
    .datetime('Data inválida')
    .or(z.date()),
  
  status: z.enum(['ATIVO', 'INATIVO', 'PENDENTE', 'CANCELADO']),
  
  tipo: z.enum(['RECEITA', 'DESPESA', 'TRANSFERENCIA']),
  
  paginacao: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(50),
  }),
};

/**
 * Validador de query params
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const params: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    // Tentar converter números
    if (!isNaN(Number(value))) {
      params[key] = Number(value);
    } else if (value === 'true' || value === 'false') {
      params[key] = value === 'true';
    } else {
      params[key] = value;
    }
  });

  return validateRequest(schema, params);
}

/**
 * Sanitizar dados de entrada
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Exemplo de uso:
 * 
 * // Em uma rota API
 * import { withValidation, commonSchemas } from '@/lib/validation-helper';
 * import { z } from 'zod';
 * 
 * const schema = z.object({
 *   nome: commonSchemas.nome,
 *   email: commonSchemas.email,
 *   valor: commonSchemas.valor,
 * });
 * 
 * export async function POST(request: Request) {
 *   return withValidation(request, schema, async (data) => {
 *     // data já está validado e tipado
 *     const result = await createSomething(data);
 *     return NextResponse.json(result);
 *   });
 * }
 */
