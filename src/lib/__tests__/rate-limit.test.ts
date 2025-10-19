import { rateLimit, RATE_LIMITS } from '../rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Limpar rate limit map antes de cada teste
    jest.clearAllMocks()
  })

  describe('rateLimit', () => {
    it('deve permitir requisições dentro do limite', () => {
      const identifier = 'test-user-1'
      const config = RATE_LIMITS.PUBLIC

      const result = rateLimit(identifier, config)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(config.maxRequests - 1)
      expect(result.limit).toBe(config.maxRequests)
    })

    it('deve bloquear requisições acima do limite', () => {
      const identifier = 'test-user-2'
      const config = { interval: 60000, maxRequests: 3 }

      // Fazer 3 requisições (limite)
      rateLimit(identifier, config)
      rateLimit(identifier, config)
      rateLimit(identifier, config)

      // 4ª requisição deve ser bloqueada
      const result = rateLimit(identifier, config)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('deve resetar contador após intervalo', async () => {
      const identifier = 'test-user-3'
      const config = { interval: 100, maxRequests: 2 } // 100ms

      // Primeira requisição
      const first = rateLimit(identifier, config)
      expect(first.success).toBe(true)

      // Segunda requisição
      const second = rateLimit(identifier, config)
      expect(second.success).toBe(true)

      // Terceira deve falhar
      const third = rateLimit(identifier, config)
      expect(third.success).toBe(false)

      // Aguardar reset
      await new Promise(resolve => setTimeout(resolve, 150))

      // Deve permitir novamente
      const fourth = rateLimit(identifier, config)
      expect(fourth.success).toBe(true)
    })

    it('deve ter limites independentes por identificador', () => {
      const config = { interval: 60000, maxRequests: 2 }

      const user1 = rateLimit('user-1', config)
      const user2 = rateLimit('user-2', config)

      expect(user1.success).toBe(true)
      expect(user2.success).toBe(true)
      expect(user1.remaining).toBe(1)
      expect(user2.remaining).toBe(1)
    })
  })

  describe('RATE_LIMITS presets', () => {
    it('deve ter configuração PUBLIC correta', () => {
      expect(RATE_LIMITS.PUBLIC.interval).toBe(60 * 1000)
      expect(RATE_LIMITS.PUBLIC.maxRequests).toBe(100)
    })

    it('deve ter configuração AUTHENTICATED correta', () => {
      expect(RATE_LIMITS.AUTHENTICATED.interval).toBe(60 * 1000)
      expect(RATE_LIMITS.AUTHENTICATED.maxRequests).toBe(300)
    })

    it('deve ter configuração WRITE correta', () => {
      expect(RATE_LIMITS.WRITE.interval).toBe(60 * 1000)
      expect(RATE_LIMITS.WRITE.maxRequests).toBe(200)
    })

    it('deve ter configuração READ correta', () => {
      expect(RATE_LIMITS.READ.interval).toBe(60 * 1000)
      expect(RATE_LIMITS.READ.maxRequests).toBe(500)
    })
  })
})
