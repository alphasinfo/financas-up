/**
 * Health Check Endpoint
 * 
 * Endpoint público para verificar saúde do sistema
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import MonitoringService from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Verificar conexão com banco de dados
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbDuration = Date.now() - dbStart;
    
    // Obter métricas do sistema
    const systemHealth = MonitoringService.getHealthCheck();
    
    // Verificar uso de memória
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Determinar status geral
    const isHealthy = (
      systemHealth.status === 'healthy' &&
      dbDuration < 1000 && // DB responde em menos de 1s
      memoryUsagePercent < 90 // Uso de memória abaixo de 90%
    );
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // Detalhes do sistema
      system: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round(memoryUsagePercent * 100) / 100,
        },
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      
      // Status do banco de dados
      database: {
        status: 'connected',
        responseTime: dbDuration,
      },
      
      // Métricas de performance
      performance: systemHealth.performance,
      
      // Contadores de erro
      errors: {
        last1h: systemHealth.errors?.last1h || 0,
        last24h: systemHealth.errors?.last24h || 0,
      },
    };
    
    // Retornar status HTTP apropriado
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthData, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError',
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Health check detalhado (requer autenticação)
 */
export async function POST() {
  const startTime = Date.now();
  
  try {
    // Testes mais detalhados
    const tests = {
      database: await testDatabase(),
      cache: await testCache(),
      filesystem: await testFilesystem(),
      external: await testExternalServices(),
    };
    
    const allTestsPassed = Object.values(tests).every(test => test.status === 'ok');
    
    const detailedHealth = {
      status: allTestsPassed ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      tests,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
      },
    };
    
    return NextResponse.json(detailedHealth, { 
      status: allTestsPassed ? 200 : 503 
    });
    
  } catch (error) {
    console.error('Detailed health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}

// Funções auxiliares para testes detalhados
async function testDatabase() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      status: 'ok',
      responseTime: duration,
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function testCache() {
  try {
    // Testar cache simples
    const { simpleCache } = await import('@/lib/simple-cache');
    const testKey = 'health-check-test';
    const testValue = Date.now();
    
    simpleCache.set(testKey, testValue, 1000);
    const retrieved = simpleCache.get(testKey);
    
    if (retrieved === testValue) {
      return {
        status: 'ok',
        message: 'Cache working correctly',
        stats: simpleCache.getStats(),
      };
    } else {
      return {
        status: 'error',
        message: 'Cache test failed',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Cache test failed',
    };
  }
}

async function testFilesystem() {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const testFile = path.join(process.cwd(), 'tmp', 'health-check.txt');
    const testContent = `Health check at ${new Date().toISOString()}`;
    
    // Criar diretório se não existir
    await fs.mkdir(path.dirname(testFile), { recursive: true });
    
    // Escrever arquivo
    await fs.writeFile(testFile, testContent);
    
    // Ler arquivo
    const content = await fs.readFile(testFile, 'utf8');
    
    // Remover arquivo
    await fs.unlink(testFile);
    
    if (content === testContent) {
      return {
        status: 'ok',
        message: 'Filesystem read/write successful',
      };
    } else {
      return {
        status: 'error',
        message: 'Filesystem test failed - content mismatch',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Filesystem test failed',
    };
  }
}

async function testExternalServices() {
  // Por enquanto, apenas um teste básico
  // Futuramente pode incluir testes de APIs externas, email, etc.
  
  try {
    return {
      status: 'ok',
      message: 'No external services configured',
      services: {},
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'External services test failed',
    };
  }
}