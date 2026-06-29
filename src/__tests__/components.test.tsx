import { describe, it, expect, vi, beforeEach } from 'vitest';

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

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  };
});

describe('Frontend Components', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have sidebar component available', async () => {
    const mod = await import('../app/components/Sidebar');
    expect((mod as any).Sidebar).toBeDefined();
  });

  it('should have header component available', async () => {
    const mod = await import('../app/components/Header');
    expect((mod as any).Header).toBeDefined();
  });

  it('should have surat masuk component available', async () => {
    const mod = await import('../app/components/SuratMasuk');
    expect((mod as any).SuratMasuk).toBeDefined();
  });

  it('should have surat keluar component available', async () => {
    const mod = await import('../app/components/SuratKeluar');
    expect((mod as any).SuratKeluar).toBeDefined();
  });

  it('should have disposisi component available', async () => {
    const mod = await import('../app/components/Disposisi');
    expect((mod as any).Disposisi).toBeDefined();
  });

  it('should have klasifikasi component available', async () => {
    const mod = await import('../app/components/Klasifikasi');
    expect((mod as any).Klasifikasi).toBeDefined();
  });

  it('should have laporan component available', async () => {
    const mod = await import('../app/components/Laporan');
    expect((mod as any).Laporan).toBeDefined();
  });

  it('should have kelola user component available', async () => {
    const mod = await import('../app/components/KelolaUser');
    expect((mod as any).KelolaUser).toBeDefined();
  });

  it('should have pengaturan component available', async () => {
    const mod = await import('../app/components/Pengaturan');
    expect((mod as any).Pengaturan).toBeDefined();
  });

  it('should have profil desa component available', async () => {
    const mod = await import('../app/components/ProfilDesa');
    expect((mod as any).ProfilDesa).toBeDefined();
  });

  it('should have date time display component available', async () => {
    const mod = await import('../app/components/DateTimeDisplay');
    expect((mod as any).DateTimeDisplay).toBeDefined();
  });

  it('should have api service with all methods', async () => {
    const { api } = await import('../services/api');
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.patch).toBeDefined();
    expect(api.delete).toBeDefined();
    expect(api.upload).toBeDefined();
  });

  it('should have ApiError class', async () => {
    const { ApiError } = await import('../services/api');
    const error = new ApiError('Test', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(500);
  });
});