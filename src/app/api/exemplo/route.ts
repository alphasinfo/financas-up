import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = RequestSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  
  return NextResponse.json({ success: true, data: validation.data });
}
