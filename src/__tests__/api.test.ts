import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from '../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  function mockResponse(overrides: {
    ok?: boolean;
    status?: number;
    body?: unknown;
    textReject?: boolean;
  } = {}) {
    const { ok = true, status = 200, body = {}, textReject = false } = overrides;
    const bodyStr = JSON.stringify(body);
    return {
      ok,
      status,
      text: textReject
        ? () => Promise.reject(new Error('Invalid JSON'))
        : () => Promise.resolve(bodyStr),
      json: () => Promise.resolve(body),
    };
  }

  describe('GET requests', () => {
    it('should make a successful GET request', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: { id: 1 } } })
      );

      const result = await api.get('/test');

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should include auth token in headers', async () => {
      localStorageMock.setItem('token', 'test-token');

      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: {} } })
      );

      await api.get('/test');

      const callArgs = mockFetch.mock.calls[0][1];

      expect(callArgs.headers['Authorization']).toBe(
        'Bearer test-token'
      );
    });

    it('should append query params to URL', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: [] } })
      );

      await api.get('/test', {
        search: 'test',
        page: '1',
      });

      const url = mockFetch.mock.calls[0][0] as string;

      expect(url).toContain('search=test');
      expect(url).toContain('page=1');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(
        new Error('Network Error')
      );

      await expect(
        api.get('/test')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('POST requests', () => {
    it('should make a successful POST request with body', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: { id: 1 } } })
      );

      const result = await api.post('/test', {
        name: 'Test',
      });

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Test',
          }),
        })
      );
    });
  });

  describe('PUT requests', () => {
    it('should make a successful PUT request', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: { id: 1, name: 'Updated' } } })
      );

      const result = await api.put(
        '/test/1',
        {
          name: 'Updated',
        }
      );

      expect(result).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Updated',
        },
      });
    });
  });

  describe('PATCH requests', () => {
    it('should make a successful PATCH request', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: { status: 'active' } } })
      );

      const result = await api.patch(
        '/test/1',
        {
          status: 'active',
        }
      );

      expect(result).toEqual({
        success: true,
        data: {
          status: 'active',
        },
      });
    });
  });

  describe('DELETE requests', () => {
    it('should make a successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, message: 'Deleted' } })
      );

      const result = await api.delete('/test/1');

      expect(result).toEqual({
        success: true,
        message: 'Deleted',
      });
    });
  });

  describe('UPLOAD requests', () => {
    it('should make a successful upload request', async () => {
      const formData = new FormData();

      formData.append(
        'file',
        new Blob(['test']),
        'test.pdf'
      );

      mockFetch.mockResolvedValueOnce(
        mockResponse({ body: { success: true, data: { filename: 'test.pdf' } } })
      );

      const result = await api.upload(
        '/upload',
        'POST',
        formData
      );

      expect(result).toEqual({
        success: true,
        data: {
          filename: 'test.pdf',
        },
      });
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ ok: false, status: 400, body: { success: false, message: 'Bad Request' } })
      );

      try {
        await api.get('/test');

        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);

        if (error instanceof ApiError) {
          expect(error.status).toBe(400);
          expect(error.message).toBe(
            'Bad Request'
          );
        }
      }
    });

    it('should throw ApiError on 401 response', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ ok: false, status: 401, body: { success: false, message: 'Akses ditolak.' } })
      );

      try {
        await api.get('/protected');

        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);

        if (error instanceof ApiError) {
          expect(error.status).toBe(401);
        }
      }
    });

    it('should handle timeout/abort error', async () => {
      const abortError =
        new DOMException(
          'The operation was aborted',
          'AbortError'
        );

      mockFetch.mockRejectedValueOnce(
        abortError
      );

      await expect(
        api.get('/test')
      ).rejects.toThrow(
        'Waktu permintaan habis. Silakan coba lagi.'
      );
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ ok: true, status: 200, textReject: true })
      );

      await expect(
        api.get('/test')
      ).rejects.toThrow(
        'Server mengirim respons yang tidak bisa dibaca (HTTP 200)'
      );
    });
  });
});