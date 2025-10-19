import {
  getPaginationParams,
  getPrismaSkipTake,
  createPaginatedResponse,
  paginationSchema,
} from '../pagination-helper';

describe('Pagination Helper', () => {
  describe('getPaginationParams', () => {
    it('deve extrair parâmetros padrão', () => {
      const searchParams = new URLSearchParams();
      const params = getPaginationParams(searchParams);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(50);
      expect(params.order).toBe('desc');
    });

    it('deve extrair parâmetros customizados', () => {
      const searchParams = new URLSearchParams({
        page: '2',
        limit: '25',
        orderBy: 'nome',
        order: 'asc',
      });
      const params = getPaginationParams(searchParams);

      expect(params.page).toBe(2);
      expect(params.limit).toBe(25);
      expect(params.orderBy).toBe('nome');
      expect(params.order).toBe('asc');
    });

    it('deve validar limite máximo', () => {
      const searchParams = new URLSearchParams({ limit: '200' });
      
      expect(() => getPaginationParams(searchParams)).toThrow();
    });

    it('deve validar página positiva', () => {
      const searchParams = new URLSearchParams({ page: '0' });
      
      expect(() => getPaginationParams(searchParams)).toThrow();
    });

    it('deve converter strings para números', () => {
      const searchParams = new URLSearchParams({
        page: '3',
        limit: '10',
      });
      const params = getPaginationParams(searchParams);

      expect(typeof params.page).toBe('number');
      expect(typeof params.limit).toBe('number');
    });
  });

  describe('getPrismaSkipTake', () => {
    it('deve calcular skip e take corretamente', () => {
      const params = { page: 1, limit: 50, order: 'desc' as const };
      const { skip, take } = getPrismaSkipTake(params);

      expect(skip).toBe(0);
      expect(take).toBe(50);
    });

    it('deve calcular skip para página 2', () => {
      const params = { page: 2, limit: 50, order: 'desc' as const };
      const { skip, take } = getPrismaSkipTake(params);

      expect(skip).toBe(50);
      expect(take).toBe(50);
    });

    it('deve calcular skip para página 3 com limite 25', () => {
      const params = { page: 3, limit: 25, order: 'desc' as const };
      const { skip, take } = getPrismaSkipTake(params);

      expect(skip).toBe(50);
      expect(take).toBe(25);
    });
  });

  describe('createPaginatedResponse', () => {
    it('deve criar resposta paginada correta', () => {
      const data = [1, 2, 3, 4, 5];
      const total = 100;
      const params = { page: 1, limit: 5, order: 'desc' as const };

      const response = createPaginatedResponse(data, total, params);

      expect(response.data).toEqual(data);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(5);
      expect(response.pagination.total).toBe(100);
      expect(response.pagination.totalPages).toBe(20);
      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrev).toBe(false);
    });

    it('deve indicar última página corretamente', () => {
      const data = [1, 2, 3];
      const total = 53;
      const params = { page: 11, limit: 5, order: 'desc' as const };

      const response = createPaginatedResponse(data, total, params);

      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(true);
    });

    it('deve calcular totalPages corretamente', () => {
      const data: number[] = [];
      const total = 47;
      const params = { page: 1, limit: 10, order: 'desc' as const };

      const response = createPaginatedResponse(data, total, params);

      expect(response.pagination.totalPages).toBe(5); // 47 / 10 = 4.7 -> 5
    });

    it('deve lidar com página única', () => {
      const data = [1, 2, 3];
      const total = 3;
      const params = { page: 1, limit: 10, order: 'desc' as const };

      const response = createPaginatedResponse(data, total, params);

      expect(response.pagination.totalPages).toBe(1);
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('deve validar parâmetros válidos', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 50,
        order: 'desc',
      });

      expect(result.success).toBe(true);
    });

    it('deve aplicar valores padrão', () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
        expect(result.data.order).toBe('desc');
      }
    });

    it('deve rejeitar limite muito alto', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 150,
      });

      expect(result.success).toBe(false);
    });

    it('deve rejeitar página zero ou negativa', () => {
      const result1 = paginationSchema.safeParse({ page: 0 });
      const result2 = paginationSchema.safeParse({ page: -1 });

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it('deve converter strings para números', () => {
      const result = paginationSchema.safeParse({
        page: '2',
        limit: '25',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.limit).toBe('number');
      }
    });
  });
});
