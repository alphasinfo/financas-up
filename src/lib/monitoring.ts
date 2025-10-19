/**
 * Sistema de Monitoramento Básico
 * 
 * Monitora:
 * - Performance de queries
 * - Erros de conexão
 * - Uso de retry
 * - Métricas de API
 */

interface MetricaQuery {
  nome: string;
  duracao: number;
  sucesso: boolean;
  tentativas: number;
  erro?: string;
  timestamp: Date;
}

interface MetricaAPI {
  rota: string;
  metodo: string;
  statusCode: number;
  duracao: number;
  erro?: string;
  timestamp: Date;
}

class MonitoringService {
  private metricas: MetricaQuery[] = [];
  private metricasAPI: MetricaAPI[] = [];
  private readonly MAX_METRICAS = 1000; // Limitar memória

  /**
   * Registrar métrica de query
   */
  registrarQuery(metrica: MetricaQuery) {
    this.metricas.push(metrica);
    
    // Limitar tamanho do array
    if (this.metricas.length > this.MAX_METRICAS) {
      this.metricas.shift();
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const status = metrica.sucesso ? '✅' : '❌';
      const tentativas = metrica.tentativas > 1 ? ` (${metrica.tentativas} tentativas)` : '';
      console.log(`[Monitor Query] ${status} ${metrica.nome} - ${metrica.duracao}ms${tentativas}`);
      
      if (metrica.erro) {
        console.error(`[Monitor Query] Erro: ${metrica.erro}`);
      }
    }
  }

  /**
   * Registrar métrica de API
   */
  registrarAPI(metrica: MetricaAPI) {
    this.metricasAPI.push(metrica);
    
    // Limitar tamanho do array
    if (this.metricasAPI.length > this.MAX_METRICAS) {
      this.metricasAPI.shift();
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const status = metrica.statusCode < 400 ? '✅' : '❌';
      console.log(`[Monitor API] ${status} ${metrica.metodo} ${metrica.rota} - ${metrica.statusCode} - ${metrica.duracao}ms`);
      
      if (metrica.erro) {
        console.error(`[Monitor API] Erro: ${metrica.erro}`);
      }
    }
  }

  /**
   * Obter estatísticas de queries
   */
  getEstatisticasQueries() {
    const total = this.metricas.length;
    const sucesso = this.metricas.filter(m => m.sucesso).length;
    const falhas = total - sucesso;
    const comRetry = this.metricas.filter(m => m.tentativas > 1).length;
    
    const duracoes = this.metricas.map(m => m.duracao);
    const duracaoMedia = duracoes.length > 0
      ? duracoes.reduce((a, b) => a + b, 0) / duracoes.length
      : 0;
    
    const duracaoMax = duracoes.length > 0 ? Math.max(...duracoes) : 0;
    const duracaoMin = duracoes.length > 0 ? Math.min(...duracoes) : 0;

    return {
      total,
      sucesso,
      falhas,
      taxaSucesso: total > 0 ? (sucesso / total) * 100 : 0,
      comRetry,
      taxaRetry: total > 0 ? (comRetry / total) * 100 : 0,
      duracaoMedia: Math.round(duracaoMedia),
      duracaoMax,
      duracaoMin,
    };
  }

  /**
   * Obter estatísticas de APIs
   */
  getEstatisticasAPIs() {
    const total = this.metricasAPI.length;
    const sucesso = this.metricasAPI.filter(m => m.statusCode < 400).length;
    const falhas = total - sucesso;
    
    const duracoes = this.metricasAPI.map(m => m.duracao);
    const duracaoMedia = duracoes.length > 0
      ? duracoes.reduce((a, b) => a + b, 0) / duracoes.length
      : 0;
    
    const duracaoMax = duracoes.length > 0 ? Math.max(...duracoes) : 0;
    const duracaoMin = duracoes.length > 0 ? Math.min(...duracoes) : 0;

    // Agrupar por rota
    const porRota: Record<string, number> = {};
    this.metricasAPI.forEach(m => {
      porRota[m.rota] = (porRota[m.rota] || 0) + 1;
    });

    // Top 5 rotas mais acessadas
    const topRotas = Object.entries(porRota)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rota, count]) => ({ rota, count }));

    return {
      total,
      sucesso,
      falhas,
      taxaSucesso: total > 0 ? (sucesso / total) * 100 : 0,
      duracaoMedia: Math.round(duracaoMedia),
      duracaoMax,
      duracaoMin,
      topRotas,
    };
  }

  /**
   * Obter queries mais lentas
   */
  getQueriesLentas(limite: number = 10) {
    return [...this.metricas]
      .sort((a, b) => b.duracao - a.duracao)
      .slice(0, limite)
      .map(m => ({
        nome: m.nome,
        duracao: m.duracao,
        sucesso: m.sucesso,
        tentativas: m.tentativas,
        timestamp: m.timestamp,
      }));
  }

  /**
   * Obter APIs mais lentas
   */
  getAPIsLentas(limite: number = 10) {
    return [...this.metricasAPI]
      .sort((a, b) => b.duracao - a.duracao)
      .slice(0, limite)
      .map(m => ({
        rota: m.rota,
        metodo: m.metodo,
        duracao: m.duracao,
        statusCode: m.statusCode,
        timestamp: m.timestamp,
      }));
  }

  /**
   * Obter erros recentes
   */
  getErrosRecentes(limite: number = 20) {
    return [...this.metricas]
      .filter(m => !m.sucesso)
      .slice(-limite)
      .map(m => ({
        nome: m.nome,
        erro: m.erro,
        tentativas: m.tentativas,
        timestamp: m.timestamp,
      }));
  }

  /**
   * Limpar métricas antigas (manter últimas 24h)
   */
  limparMetricasAntigas() {
    const umDiaAtras = new Date();
    umDiaAtras.setHours(umDiaAtras.getHours() - 24);

    this.metricas = this.metricas.filter(m => m.timestamp > umDiaAtras);
    this.metricasAPI = this.metricasAPI.filter(m => m.timestamp > umDiaAtras);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Monitor] Métricas antigas limpas. Queries: ${this.metricas.length}, APIs: ${this.metricasAPI.length}`);
    }
  }

  /**
   * Resetar todas as métricas
   */
  reset() {
    this.metricas = [];
    this.metricasAPI = [];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitor] Métricas resetadas');
    }
  }
}

// Instância singleton
export const monitoring = new MonitoringService();

/**
 * Wrapper para monitorar queries do Prisma
 */
export async function monitorarQuery<T>(
  nome: string,
  query: () => Promise<T>,
  maxTentativas: number = 1
): Promise<T> {
  const inicio = Date.now();
  let tentativas = 0;
  let ultimoErro: Error | undefined;

  while (tentativas < maxTentativas) {
    tentativas++;
    
    try {
      const resultado = await query();
      const duracao = Date.now() - inicio;
      
      monitoring.registrarQuery({
        nome,
        duracao,
        sucesso: true,
        tentativas,
        timestamp: new Date(),
      });
      
      return resultado;
    } catch (error: any) {
      ultimoErro = error;
      
      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (tentativas < maxTentativas) {
        const delay = Math.pow(2, tentativas - 1) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  const duracao = Date.now() - inicio;
  
  monitoring.registrarQuery({
    nome,
    duracao,
    sucesso: false,
    tentativas,
    erro: ultimoErro?.message,
    timestamp: new Date(),
  });
  
  throw ultimoErro;
}

/**
 * Wrapper para monitorar APIs
 */
export function monitorarAPI(
  rota: string,
  metodo: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const inicio = Date.now();
  
  return handler()
    .then(response => {
      const duracao = Date.now() - inicio;
      
      monitoring.registrarAPI({
        rota,
        metodo,
        statusCode: response.status,
        duracao,
        timestamp: new Date(),
      });
      
      return response;
    })
    .catch(error => {
      const duracao = Date.now() - inicio;
      
      monitoring.registrarAPI({
        rota,
        metodo,
        statusCode: 500,
        duracao,
        erro: error.message,
        timestamp: new Date(),
      });
      
      throw error;
    });
}

// Limpar métricas antigas a cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    monitoring.limparMetricasAntigas();
  }, 60 * 60 * 1000); // 1 hora
}
