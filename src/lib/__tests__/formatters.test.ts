import { formatarMoeda, formatarData, calcularPorcentagem, formatarPorcentagem } from '../formatters'

describe('Formatters', () => {
  describe('formatarMoeda', () => {
    it('deve formatar valores positivos corretamente', () => {
      expect(formatarMoeda(1000)).toContain('1.000,00')
      expect(formatarMoeda(1234.56)).toContain('1.234,56')
      expect(formatarMoeda(0.99)).toContain('0,99')
    })

    it('deve formatar valores negativos corretamente', () => {
      expect(formatarMoeda(-1000)).toContain('-')
      expect(formatarMoeda(-1000)).toContain('1.000,00')
      expect(formatarMoeda(-1234.56)).toContain('1.234,56')
    })

    it('deve formatar zero corretamente', () => {
      expect(formatarMoeda(0)).toContain('0,00')
    })

    it('deve lidar com valores muito grandes', () => {
      expect(formatarMoeda(1000000)).toContain('1.000.000,00')
      expect(formatarMoeda(1234567.89)).toContain('1.234.567,89')
    })
  })

  describe('formatarData', () => {
    it('deve formatar data corretamente', () => {
      const data = new Date('2025-01-15T12:00:00')
      const resultado = formatarData(data)
      expect(resultado).toMatch(/15\/01\/2025/)
    })

    it('deve lidar com diferentes formatos de entrada', () => {
      const dataString = '2025-12-25T12:00:00'
      const resultado = formatarData(new Date(dataString))
      expect(resultado).toMatch(/25\/12\/2025/)
    })
  })

  describe('calcularPorcentagem', () => {
    it('deve calcular porcentagem corretamente', () => {
      expect(calcularPorcentagem(50, 100)).toBe(50)
      expect(calcularPorcentagem(25, 100)).toBe(25)
      expect(calcularPorcentagem(75, 100)).toBe(75)
    })

    it('deve lidar com valores decimais', () => {
      expect(calcularPorcentagem(33.33, 100)).toBeCloseTo(33.33, 2)
      expect(calcularPorcentagem(66.67, 100)).toBeCloseTo(66.67, 2)
    })

    it('deve retornar 0 quando total é 0', () => {
      expect(calcularPorcentagem(50, 0)).toBe(0)
    })

    it('deve lidar com valores maiores que 100%', () => {
      expect(calcularPorcentagem(150, 100)).toBe(150)
    })
  })

  describe('formatarPorcentagem', () => {
    it('deve formatar porcentagem com 1 casa decimal', () => {
      expect(formatarPorcentagem(50.5)).toBe('50.5%')
      expect(formatarPorcentagem(33.3)).toBe('33.3%')
    })

    it('deve formatar valores inteiros', () => {
      expect(formatarPorcentagem(50)).toBe('50.0%')
      expect(formatarPorcentagem(100)).toBe('100.0%')
    })

    it('deve formatar valores negativos', () => {
      expect(formatarPorcentagem(-10.5)).toBe('-10.5%')
    })

    it('deve formatar zero', () => {
      expect(formatarPorcentagem(0)).toBe('0.0%')
    })
  })
})
