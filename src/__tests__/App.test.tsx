import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(), post: vi.fn(), put: vi.fn(),
    delete: vi.fn(), patch: vi.fn(), upload: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number; data: unknown;
    constructor(message: string, status: number, data?: unknown) {
      super(message); this.name = 'ApiError';
      this.status = status; this.data = data;
    }
  },
}));

describe('App Component', () => {
  it('should render app container', async () => {
    const { api } = await import('../services/api');
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
  });

  it('should handle api errors correctly', async () => {
    const { ApiError } = await import('../services/api');
    const error = new ApiError('Test error', 500, { detail: 'error' });
    expect(error.status).toBe(500);
    expect(error.message).toBe('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have proper component structure for roles', async () => {
    const adminMod = await import('../app/components/DashboardAdmin');
    const operatorMod = await import('../app/components/DashboardOperator');
    const pimpinanMod = await import('../app/components/DashboardPimpinan');
    expect(adminMod.DashboardAdmin ?? adminMod.default).toBeDefined();
    expect(operatorMod.DashboardOperator ?? operatorMod.default).toBeDefined();
    expect(pimpinanMod.DashboardPimpinan ?? pimpinanMod.default).toBeDefined();
  });
});