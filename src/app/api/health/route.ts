import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      status: "error", 
      database: "disconnected",
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}
