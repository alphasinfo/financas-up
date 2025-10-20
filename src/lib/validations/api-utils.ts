import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export async function validateRequest<T>({
  request,
  schema,
}: {
  request: NextRequest;
  schema: ZodSchema<T>;
}): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      );
      return { success: false, errors };
    }
  } catch (error) {
    return { success: false, errors: ['Invalid JSON body'] };
  }
}

export function validationErrorResponse(errors: string[]) {
  return NextResponse.json(
    { error: 'Validation failed', details: errors },
    { status: 400 }
  );
}
