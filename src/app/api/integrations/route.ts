/**
 * API para Integrações Externas
 * 
 * Endpoints:
 * - GET: Obter dados de mercado, cotações, insights
 * - POST: Sincronizar contas, configurar integrações
 * - PUT: Atualizar configurações
 * - DELETE: Remover integrações
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import externalIntegrationsService from '@/lib/external-integrations';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schemas de validação
const integrationConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url(),
  rateLimit: z.object({
    requests: z.number().positive(),
    window: z.number().positive(),
  }),
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10),
    backoffMs: z.number().positive(),
  }),
  cacheConfig: z.object({
    ttl: z.number().positive(),
    maxSize: z.number().positive(),
  }),
});

const syncRequestSchema = z.object({
  bankCodes: z.array(z.string()).optional(),
  forceSync: z.boolean().optional(),
});

/**
 * GET - Obter dados das integrações
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const symbols = searchParams.get('symbols')?.split(',') || [];

    logger.info('Integration data requested', {
      userId: session.user.id,
      type,
      symbols: symbols.length,
    });

    switch (type) {
      case 'currencies':
        const baseCurrency = searchParams.get('base') || 'USD';
        const targetCurrencies = searchParams.get('targets')?.split(',') || ['BRL', 'EUR', 'GBP'];
        
        const currencyRates = await externalIntegrationsService.getCurrencyRates(baseCurrency, targetCurrencies);
        
        return NextResponse.json({
          success: true,
          data: currencyRates,
          lastUpdate: new Date().toISOString(),
        });

      case 'stocks':
        const stockSymbols = symbols.length > 0 ? symbols : ['AAPL', 'GOOGL', 'MSFT', 'PETR4.SA', 'VALE3.SA'];
        const stockQuotes = await externalIntegrationsService.getStockQuotes(stockSymbols);
        
        return NextResponse.json({
          success: true,
          data: stockQuotes,
          lastUpdate: new Date().toISOString(),
        });

      case 'crypto':
        const cryptoSymbols = symbols.length > 0 ? symbols : ['BTC', 'ETH', 'ADA', 'DOT'];
        const cryptoQuotes = await externalIntegrationsService.getCryptoQuotes(cryptoSymbols);
        
        return NextResponse.json({
          success: true,
          data: cryptoQuotes,
          lastUpdate: new Date().toISOString(),
        });

      case 'market':
        const marketData = await externalIntegrationsService.getMarketData();
        
        return NextResponse.json({
          success: true,
          data: marketData,
        });

      case 'bank-accounts':
        const bankData = await externalIntegrationsService.syncBankAccounts(session.user.id);
        
        return NextResponse.json({
          success: true,
          data: bankData,
          message: `${bankData.accounts.length} contas e ${bankData.transactions.length} transações sincronizadas`,
        });

      case 'insights':
        // Primeiro obter transações
        const { transactions } = await externalIntegrationsService.syncBankAccounts(session.user.id);
        const insights = await externalIntegrationsService.generateAIInsights(session.user.id, transactions);
        
        return NextResponse.json({
          success: true,
          data: insights,
          message: `${insights.length} insights gerados`,
        });

      case 'stats':
        const stats = externalIntegrationsService.getIntegrationStats();
        
        return NextResponse.json({
          success: true,
          data: stats,
        });

      default:
        // Retornar resumo geral
        const [currencies, stocks, crypto, integrationStats] = await Promise.all([
          externalIntegrationsService.getCurrencyRates('USD', ['BRL', 'EUR']),
          externalIntegrationsService.getStockQuotes(['AAPL', 'PETR4.SA']),
          externalIntegrationsService.getCryptoQuotes(['BTC', 'ETH']),
          Promise.resolve(externalIntegrationsService.getIntegrationStats()),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            currencies: currencies.slice(0, 2),
            stocks: stocks.slice(0, 2),
            crypto: crypto.slice(0, 2),
            stats: integrationStats,
          },
          message: 'Resumo das integrações externas',
        });
    }

  } catch (error) {
    logger.error('Error fetching integration data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar dados das integrações',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Sincronizar dados ou configurar integrações
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    logger.info('Integration action requested', {
      userId: session.user.id,
      action,
    });

    switch (action) {
      case 'sync-banks':
        const syncData = syncRequestSchema.parse(body);
        const bankData = await externalIntegrationsService.syncBankAccounts(session.user.id);
        
        return NextResponse.json({
          success: true,
          data: bankData,
          message: `Sincronização concluída: ${bankData.accounts.length} contas, ${bankData.transactions.length} transações`,
        });

      case 'generate-insights':
        const { transactions } = await externalIntegrationsService.syncBankAccounts(session.user.id);
        const insights = await externalIntegrationsService.generateAIInsights(session.user.id, transactions);
        
        return NextResponse.json({
          success: true,
          data: insights,
          message: `${insights.length} insights gerados com IA`,
        });

      case 'configure':
        const configData = integrationConfigSchema.parse(body);
        externalIntegrationsService.configureIntegration(configData.name, configData);
        
        return NextResponse.json({
          success: true,
          message: `Integração ${configData.name} configurada com sucesso`,
        });

      case 'refresh-market':
        const marketData = await externalIntegrationsService.getMarketData();
        
        return NextResponse.json({
          success: true,
          data: marketData,
          message: 'Dados de mercado atualizados',
        });

      case 'test-integration':
        const { integrationName } = body;
        if (!integrationName) {
          return NextResponse.json(
            { error: 'Nome da integração é obrigatório' },
            { status: 400 }
          );
        }

        // Testar integração baseado no nome
        let testResult;
        switch (integrationName) {
          case 'currency-api':
            testResult = await externalIntegrationsService.getCurrencyRates('USD', ['BRL']);
            break;
          case 'stock-api':
            testResult = await externalIntegrationsService.getStockQuotes(['AAPL']);
            break;
          case 'crypto-api':
            testResult = await externalIntegrationsService.getCryptoQuotes(['BTC']);
            break;
          default:
            return NextResponse.json(
              { error: 'Integração não reconhecida' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          data: testResult,
          message: `Teste da integração ${integrationName} realizado com sucesso`,
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Dados inválidos', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    logger.error('Error in integration action', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Atualizar configurações de integração
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { integrationName, config } = body;

    if (!integrationName || !config) {
      return NextResponse.json(
        { error: 'Nome da integração e configuração são obrigatórios' },
        { status: 400 }
      );
    }

    const validatedConfig = integrationConfigSchema.parse(config);
    externalIntegrationsService.configureIntegration(integrationName, validatedConfig);

    logger.info('Integration configuration updated', {
      userId: session.user.id,
      integrationName,
      enabled: validatedConfig.enabled,
    });

    return NextResponse.json({
      success: true,
      message: `Configuração da integração ${integrationName} atualizada com sucesso`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuração inválida', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    logger.error('Error updating integration configuration', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao atualizar configuração',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remover ou desabilitar integração
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationName = searchParams.get('integration');
    const action = searchParams.get('action') || 'disable';

    if (!integrationName) {
      return NextResponse.json(
        { error: 'Nome da integração é obrigatório' },
        { status: 400 }
      );
    }

    logger.info('Integration removal requested', {
      userId: session.user.id,
      integrationName,
      action,
    });

    if (action === 'disable') {
      // Desabilitar integração (manter configuração)
      const currentConfig = (externalIntegrationsService as any).integrations.get(integrationName);
      if (currentConfig) {
        currentConfig.enabled = false;
        externalIntegrationsService.configureIntegration(integrationName, currentConfig);
        
        return NextResponse.json({
          success: true,
          message: `Integração ${integrationName} desabilitada com sucesso`,
        });
      } else {
        return NextResponse.json(
          { error: 'Integração não encontrada' },
          { status: 404 }
        );
      }
    } else if (action === 'remove') {
      // Remover integração completamente
      const removed = (externalIntegrationsService as any).integrations.delete(integrationName);
      
      if (removed) {
        return NextResponse.json({
          success: true,
          message: `Integração ${integrationName} removida com sucesso`,
        });
      } else {
        return NextResponse.json(
          { error: 'Integração não encontrada' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Ação não reconhecida' },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('Error removing integration', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao remover integração',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}