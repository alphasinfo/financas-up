/**
 * Sistema de Integrações com APIs Externas
 * 
 * Funcionalidades:
 * - Integração com APIs bancárias (Open Banking)
 * - Cotações de moedas em tempo real
 * - Dados de investimentos e ações
 * - Análise de gastos com IA
 * - Sincronização automática
 * - Cache inteligente
 * - Rate limiting
 * - Retry automático
 */

import { logger } from './logger';
import { simpleCache } from './simple-cache';

export interface BankAccount {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
  lastSync: Date;
  isActive: boolean;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  category?: string;
  date: Date;
  type: 'debit' | 'credit';
  merchant?: string;
  location?: string;
  reference?: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
  source: string;
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap?: number;
  timestamp: Date;
  source: string;
}

export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_recommendation' | 'investment_suggestion' | 'anomaly_detection';
  title: string;
  description: string;
  confidence: number;
  data: Record<string, any>;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt?: Date;
}

export interface IntegrationConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  rateLimit: {
    requests: number;
    window: number; // em segundos
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  cacheConfig: {
    ttl: number; // em segundos
    maxSize: number;
  };
}

class ExternalIntegrationsService {
  private cache = simpleCache;
  private rateLimiters = new Map<string, { count: number; resetTime: number }>();
  private integrations = new Map<string, IntegrationConfig>();

  constructor() {
    this.initializeIntegrations();
  }

  /**
   * Configurar integração
   */
  configureIntegration(name: string, config: IntegrationConfig): void {
    this.integrations.set(name, config);
    logger.info(`Integration configured: ${name}`, {
      enabled: config.enabled,
      baseUrl: config.baseUrl,
    });
  }

  /**
   * Verificar rate limit
   */
  private checkRateLimit(integrationName: string): boolean {
    const config = this.integrations.get(integrationName);
    if (!config) return false;

    const now = Date.now();
    const limiter = this.rateLimiters.get(integrationName);

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiters.set(integrationName, {
        count: 1,
        resetTime: now + (config.rateLimit.window * 1000),
      });
      return true;
    }

    if (limiter.count >= config.rateLimit.requests) {
      return false;
    }

    limiter.count++;
    return true;
  }

  /**
   * Fazer requisição HTTP com retry
   */
  private async makeRequest<T>(
    integrationName: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config = this.integrations.get(integrationName);
    if (!config || !config.enabled) {
      throw new Error(`Integration not available: ${integrationName}`);
    }

    if (!this.checkRateLimit(integrationName)) {
      throw new Error(`Rate limit exceeded for ${integrationName}`);
    }

    const url = `${config.baseUrl}${endpoint}`;
    let lastError: Error;

    for (let attempt = 0; attempt <= config.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : '',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < config.retryConfig.maxRetries) {
          const delay = config.retryConfig.backoffMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          logger.warn(`Retrying request to ${integrationName}`, {
            attempt: attempt + 1,
            delay,
            error: lastError.message,
          });
        }
      }
    }

    throw lastError!;
  }

  /**
   * Obter cotações de moedas
   */
  async getCurrencyRates(baseCurrency: string = 'USD', targetCurrencies: string[] = ['BRL', 'EUR', 'GBP']): Promise<CurrencyRate[]> {
    const cacheKey = `currency_rates_${baseCurrency}_${targetCurrencies.join(',')}`;
    const cached = this.cache.get<CurrencyRate[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Simulação de API de cotações (em produção, usar API real como exchangerate-api.com)
      const rates: CurrencyRate[] = [];
      
      for (const currency of targetCurrencies) {
        // Simular cotação (em produção, fazer requisição real)
        const mockRate = this.generateMockRate(baseCurrency, currency);
        rates.push({
          from: baseCurrency,
          to: currency,
          rate: mockRate,
          timestamp: new Date(),
          source: 'mock-api',
        });
      }

      this.cache.set(cacheKey, rates, 300); // Cache por 5 minutos
      
      logger.info('Currency rates fetched', {
        baseCurrency,
        targetCurrencies: targetCurrencies.length,
      });

      return rates;

    } catch (error) {
      logger.error('Failed to fetch currency rates', {
        baseCurrency,
        targetCurrencies,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obter cotações de ações
   */
  async getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    const cacheKey = `stock_quotes_${symbols.join(',')}`;
    const cached = this.cache.get<StockQuote[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const quotes: StockQuote[] = [];
      
      for (const symbol of symbols) {
        // Simular cotação de ação (em produção, usar API como Alpha Vantage ou Yahoo Finance)
        const mockQuote = this.generateMockStockQuote(symbol);
        quotes.push(mockQuote);
      }

      this.cache.set(cacheKey, quotes, 60); // Cache por 1 minuto
      
      logger.info('Stock quotes fetched', {
        symbols: symbols.length,
      });

      return quotes;

    } catch (error) {
      logger.error('Failed to fetch stock quotes', {
        symbols,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obter cotações de criptomoedas
   */
  async getCryptoQuotes(symbols: string[] = ['BTC', 'ETH', 'ADA', 'DOT']): Promise<CryptoQuote[]> {
    const cacheKey = `crypto_quotes_${symbols.join(',')}`;
    const cached = this.cache.get<CryptoQuote[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const quotes: CryptoQuote[] = [];
      
      for (const symbol of symbols) {
        // Simular cotação de crypto (em produção, usar API como CoinGecko ou CoinMarketCap)
        const mockQuote = this.generateMockCryptoQuote(symbol);
        quotes.push(mockQuote);
      }

      this.cache.set(cacheKey, quotes, 30); // Cache por 30 segundos
      
      logger.info('Crypto quotes fetched', {
        symbols: symbols.length,
      });

      return quotes;

    } catch (error) {
      logger.error('Failed to fetch crypto quotes', {
        symbols,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Sincronizar contas bancárias (Open Banking)
   */
  async syncBankAccounts(userId: string): Promise<{ accounts: BankAccount[]; transactions: BankTransaction[] }> {
    const cacheKey = `bank_sync_${userId}`;
    const cached = this.cache.get<{ accounts: BankAccount[]; transactions: BankTransaction[] }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Simular sincronização bancária (em produção, usar APIs de Open Banking)
      const accounts: BankAccount[] = [
        {
          id: 'acc_001',
          bankCode: '001',
          bankName: 'Banco do Brasil',
          accountNumber: '12345-6',
          accountType: 'checking',
          balance: 5420.50,
          currency: 'BRL',
          lastSync: new Date(),
          isActive: true,
        },
        {
          id: 'acc_002',
          bankCode: '341',
          bankName: 'Itaú',
          accountNumber: '98765-4',
          accountType: 'savings',
          balance: 12800.75,
          currency: 'BRL',
          lastSync: new Date(),
          isActive: true,
        },
      ];

      const transactions: BankTransaction[] = this.generateMockTransactions(accounts);

      const result = { accounts, transactions };
      this.cache.set(cacheKey, result, 1800); // Cache por 30 minutos
      
      logger.info('Bank accounts synced', {
        userId,
        accountsCount: accounts.length,
        transactionsCount: transactions.length,
      });

      return result;

    } catch (error) {
      logger.error('Failed to sync bank accounts', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Gerar insights com IA
   */
  async generateAIInsights(userId: string, transactionData: BankTransaction[]): Promise<AIInsight[]> {
    const cacheKey = `ai_insights_${userId}`;
    const cached = this.cache.get<AIInsight[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Simular análise com IA (em produção, usar serviços como OpenAI, AWS Comprehend, etc.)
      const insights: AIInsight[] = [];

      // Análise de padrões de gastos
      const spendingByCategory = this.analyzeSpendingPatterns(transactionData);
      if (spendingByCategory.anomalies.length > 0) {
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'anomaly_detection',
          title: 'Gastos Incomuns Detectados',
          description: `Detectamos gastos ${spendingByCategory.anomalies[0].percentage}% acima do normal na categoria ${spendingByCategory.anomalies[0].category}.`,
          confidence: 0.85,
          data: spendingByCategory,
          actionable: true,
          priority: 'high',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        });
      }

      // Recomendação de orçamento
      const budgetRecommendation = this.generateBudgetRecommendation(transactionData);
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'budget_recommendation',
        title: 'Sugestão de Orçamento Otimizado',
        description: `Baseado nos seus gastos, sugerimos um orçamento de R$ ${budgetRecommendation.suggested.toFixed(2)} para o próximo mês.`,
        confidence: 0.75,
        data: budgetRecommendation,
        actionable: true,
        priority: 'medium',
        createdAt: new Date(),
      });

      // Oportunidade de investimento
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'investment_suggestion',
        title: 'Oportunidade de Investimento',
        description: 'Com base no seu perfil de gastos, você pode investir até R$ 800,00 mensalmente em renda fixa.',
        confidence: 0.70,
        data: { suggestedAmount: 800, riskProfile: 'conservative' },
        actionable: true,
        priority: 'low',
        createdAt: new Date(),
      });

      this.cache.set(cacheKey, insights, 3600); // Cache por 1 hora
      
      logger.info('AI insights generated', {
        userId,
        insightsCount: insights.length,
        transactionsAnalyzed: transactionData.length,
      });

      return insights;

    } catch (error) {
      logger.error('Failed to generate AI insights', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obter dados de mercado consolidados
   */
  async getMarketData(): Promise<{
    currencies: CurrencyRate[];
    stocks: StockQuote[];
    crypto: CryptoQuote[];
    lastUpdate: Date;
  }> {
    const cacheKey = 'market_data_consolidated';
    const cached = this.cache.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const [currencies, stocks, crypto] = await Promise.all([
        this.getCurrencyRates('USD', ['BRL', 'EUR', 'GBP', 'JPY']),
        this.getStockQuotes(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'PETR4.SA', 'VALE3.SA']),
        this.getCryptoQuotes(['BTC', 'ETH', 'ADA', 'DOT', 'SOL']),
      ]);

      const marketData = {
        currencies,
        stocks,
        crypto,
        lastUpdate: new Date(),
      };

      this.cache.set(cacheKey, marketData, 120); // Cache por 2 minutos
      
      logger.info('Market data consolidated', {
        currenciesCount: currencies.length,
        stocksCount: stocks.length,
        cryptoCount: crypto.length,
      });

      return marketData;

    } catch (error) {
      logger.error('Failed to get market data', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Gerar cotação mock para moedas
   */
  private generateMockRate(from: string, to: string): number {
    const baseRates: Record<string, number> = {
      'USD-BRL': 5.20,
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110.0,
    };

    const key = `${from}-${to}`;
    const baseRate = baseRates[key] || 1.0;
    
    // Adicionar variação aleatória de ±2%
    const variation = (Math.random() - 0.5) * 0.04;
    return baseRate * (1 + variation);
  }

  /**
   * Gerar cotação mock para ações
   */
  private generateMockStockQuote(symbol: string): StockQuote {
    const basePrices: Record<string, number> = {
      'AAPL': 150.0,
      'GOOGL': 2800.0,
      'MSFT': 300.0,
      'TSLA': 800.0,
      'PETR4.SA': 35.0,
      'VALE3.SA': 85.0,
    };

    const basePrice = basePrices[symbol] || 100.0;
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    const price = basePrice * (1 + variation);
    const change = basePrice * variation;
    const changePercent = variation * 100;

    return {
      symbol,
      name: this.getStockName(symbol),
      price,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      marketCap: price * Math.floor(Math.random() * 1000000000) + 1000000000,
      timestamp: new Date(),
      source: 'mock-api',
    };
  }

  /**
   * Gerar cotação mock para criptomoedas
   */
  private generateMockCryptoQuote(symbol: string): CryptoQuote {
    const basePrices: Record<string, number> = {
      'BTC': 45000.0,
      'ETH': 3200.0,
      'ADA': 1.20,
      'DOT': 25.0,
      'SOL': 150.0,
    };

    const basePrice = basePrices[symbol] || 1.0;
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    const price = basePrice * (1 + variation);
    const change24h = basePrice * variation;
    const changePercent24h = variation * 100;

    return {
      symbol,
      name: this.getCryptoName(symbol),
      price,
      change24h,
      changePercent24h,
      volume24h: Math.floor(Math.random() * 10000000000) + 1000000000,
      marketCap: price * Math.floor(Math.random() * 100000000) + 10000000,
      timestamp: new Date(),
      source: 'mock-api',
    };
  }

  /**
   * Gerar transações mock
   */
  private generateMockTransactions(accounts: BankAccount[]): BankTransaction[] {
    const transactions: BankTransaction[] = [];
    const categories = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Salário', 'Freelance'];
    const merchants = ['Supermercado ABC', 'Posto Shell', 'Farmácia Popular', 'Uber', 'Netflix', 'Amazon', 'Empresa XYZ'];

    for (const account of accounts) {
      for (let i = 0; i < 20; i++) {
        const isCredit = Math.random() > 0.7;
        const amount = isCredit ? 
          Math.floor(Math.random() * 5000) + 500 : 
          Math.floor(Math.random() * 500) + 10;

        transactions.push({
          id: `txn_${account.id}_${i}`,
          accountId: account.id,
          amount,
          currency: account.currency,
          description: isCredit ? 'Depósito/Transferência' : `Compra - ${merchants[Math.floor(Math.random() * merchants.length)]}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          type: isCredit ? 'credit' : 'debit',
          merchant: isCredit ? undefined : merchants[Math.floor(Math.random() * merchants.length)],
          location: 'São Paulo, SP',
          reference: `REF${Math.floor(Math.random() * 1000000)}`,
        });
      }
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Analisar padrões de gastos
   */
  private analyzeSpendingPatterns(transactions: BankTransaction[]): {
    byCategory: Record<string, number>;
    anomalies: Array<{ category: string; amount: number; percentage: number }>;
  } {
    const byCategory: Record<string, number> = {};
    const debits = transactions.filter(t => t.type === 'debit');

    for (const transaction of debits) {
      const category = transaction.category || 'Outros';
      byCategory[category] = (byCategory[category] || 0) + transaction.amount;
    }

    // Detectar anomalias (gastos 50% acima da média)
    const categories = Object.keys(byCategory);
    const averageSpending = Object.values(byCategory).reduce((a, b) => a + b, 0) / categories.length;
    
    const anomalies = categories
      .filter(category => byCategory[category] > averageSpending * 1.5)
      .map(category => ({
        category,
        amount: byCategory[category],
        percentage: Math.round(((byCategory[category] / averageSpending) - 1) * 100),
      }));

    return { byCategory, anomalies };
  }

  /**
   * Gerar recomendação de orçamento
   */
  private generateBudgetRecommendation(transactions: BankTransaction[]): {
    current: number;
    suggested: number;
    savings: number;
  } {
    const debits = transactions.filter(t => t.type === 'debit');
    const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
    const monthlyAverage = totalSpent / 1; // Assumindo 1 mês de dados

    return {
      current: monthlyAverage,
      suggested: monthlyAverage * 0.9, // 10% de redução
      savings: monthlyAverage * 0.1,
    };
  }

  /**
   * Obter nome da ação
   */
  private getStockName(symbol: string): string {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'PETR4.SA': 'Petrobras',
      'VALE3.SA': 'Vale S.A.',
    };
    return names[symbol] || symbol;
  }

  /**
   * Obter nome da criptomoeda
   */
  private getCryptoName(symbol: string): string {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'SOL': 'Solana',
    };
    return names[symbol] || symbol;
  }

  /**
   * Inicializar configurações das integrações
   */
  private initializeIntegrations(): void {
    const defaultIntegrations: Array<[string, IntegrationConfig]> = [
      ['currency-api', {
        name: 'Currency Exchange API',
        enabled: true,
        baseUrl: 'https://api.exchangerate-api.com/v4',
        rateLimit: { requests: 1000, window: 3600 },
        retryConfig: { maxRetries: 3, backoffMs: 1000 },
        cacheConfig: { ttl: 300, maxSize: 100 },
      }],
      ['stock-api', {
        name: 'Stock Market API',
        enabled: true,
        baseUrl: 'https://api.alphavantage.co',
        rateLimit: { requests: 5, window: 60 },
        retryConfig: { maxRetries: 2, backoffMs: 2000 },
        cacheConfig: { ttl: 60, maxSize: 200 },
      }],
      ['crypto-api', {
        name: 'Cryptocurrency API',
        enabled: true,
        baseUrl: 'https://api.coingecko.com/api/v3',
        rateLimit: { requests: 50, window: 60 },
        retryConfig: { maxRetries: 3, backoffMs: 1000 },
        cacheConfig: { ttl: 30, maxSize: 100 },
      }],
      ['open-banking', {
        name: 'Open Banking API',
        enabled: false, // Desabilitado por padrão (requer configuração específica)
        baseUrl: 'https://api.openbanking.org.br',
        rateLimit: { requests: 100, window: 3600 },
        retryConfig: { maxRetries: 2, backoffMs: 5000 },
        cacheConfig: { ttl: 1800, maxSize: 50 },
      }],
    ];

    for (const [name, config] of defaultIntegrations) {
      this.integrations.set(name, config);
    }

    logger.info(`Initialized ${defaultIntegrations.length} external integrations`);
  }

  /**
   * Obter estatísticas das integrações
   */
  getIntegrationStats(): {
    totalIntegrations: number;
    enabledIntegrations: number;
    cacheHitRate: number;
    rateLimitStatus: Array<{ name: string; remaining: number; resetTime: Date }>;
  } {
    const totalIntegrations = this.integrations.size;
    const enabledIntegrations = Array.from(this.integrations.values())
      .filter(config => config.enabled).length;

    const rateLimitStatus = Array.from(this.rateLimiters.entries())
      .map(([name, limiter]) => {
        const config = this.integrations.get(name);
        return {
          name,
          remaining: config ? Math.max(0, config.rateLimit.requests - limiter.count) : 0,
          resetTime: new Date(limiter.resetTime),
        };
      });

    return {
      totalIntegrations,
      enabledIntegrations,
      cacheHitRate: 0, // Placeholder - implementar se necessário
      rateLimitStatus,
    };
  }

  /**
   * Limpeza de cache e rate limiters
   */
  cleanup(): void {
    // Cache cleanup é feito automaticamente pelo simpleCache
    
    const now = Date.now();
    for (const [name, limiter] of this.rateLimiters.entries()) {
      if (now > limiter.resetTime) {
        this.rateLimiters.delete(name);
      }
    }

    logger.info('External integrations cleanup completed');
  }
}

// Instância singleton
export const externalIntegrationsService = new ExternalIntegrationsService();

// Limpeza automática a cada hora
if (typeof window === 'undefined') {
  setInterval(() => {
    externalIntegrationsService.cleanup();
  }, 60 * 60 * 1000);
}

export default externalIntegrationsService;