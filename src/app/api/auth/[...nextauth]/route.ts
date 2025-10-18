import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

// Wrapper para garantir headers corretos
export async function GET(req: NextRequest, context: any) {
  return handler(req, context);
}

export async function POST(req: NextRequest, context: any) {
  // Garantir que o body seja lido como JSON
  return handler(req, context);
}
