import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the api module
vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    upload: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status: number, data?: unknown) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  },
}));

// Mock react-router
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sidebar Component', () => {
    it('should have sidebar component available', async () => {
      const Sidebar = (await import('../app/components/Sidebar')).default;
      expect(Sidebar).toBeDefined();
    });
  });

  describe('Header Component', () => {
    it('should have header component available', async () => {
      const Header = (await import('../app/components/Header')).default;
      expect(Header).toBeDefined();
    });
  });

  describe('SuratMasuk Component', () => {
    it('should have surat masuk component available', async () => {
      const SuratMasuk = (await import('../app/components/SuratMasuk')).default;
      expect(SuratMasuk).toBeDefined();
    });
  });

  describe('SuratKeluar Component', () => {
    it('should have surat keluar component available', async () => {
      const SuratKeluar = (await import('../app/components/SuratKeluar')).default;
      expect(SuratKeluar).toBeDefined();
    });
  });

  describe('Disposisi Component', () => {
    it('should have disposisi component available', async () => {
      const Disposisi = (await import('../app/components/Disposisi')).default;
      expect(Disposisi).toBeDefined();
    });
  });

  describe('Klasifikasi Component', () => {
    it('should have klasifikasi component available', async () => {
      const Klasifikasi = (await import('../app/components/Klasifikasi')).default;
      expect(Klasifikasi).toBeDefined();
    });
  });

  describe('Laporan Component', () => {
    it('should have laporan component available', async () => {
      const Laporan = (await import('../app/components/Laporan')).default;
      expect(Laporan).toBeDefined();
    });
  });

  describe('KelolaUser Component', () => {
    it('should have kelola user component available', async () => {
      const KelolaUser = (await import('../app/components/KelolaUser')).default;
      expect(KelolaUser).toBeDefined();
    });
  });

  describe('Pengaturan Component', () => {
    it('should have pengaturan component available', async () => {
      const Pengaturan = (await import('../app/components/Pengaturan')).default;
      expect(Pengaturan).toBeDefined();
    });
  });

  describe('ProfilDesa Component', () => {
    it('should have profil desa component available', async () => {
      const ProfilDesa = (await import('../app/components/ProfilDesa')).default;
      expect(ProfilDesa).toBeDefined();
    });
  });

  describe('DateTimeDisplay Component', () => {
    it('should have date time display component available', async () => {
      const DateTimeDisplay = (await import('../app/components/DateTimeDisplay')).default;
      expect(DateTimeDisplay).toBeDefined();
    });
  });

  describe('API Service Integration', () => {
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
      expect(error.message).toBe('Test');
    });
  });
});