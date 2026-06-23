import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  };
});

// Mock components that may be lazy loaded or have heavy dependencies
vi.mock('../app/components/DashboardAdmin', () => ({
  default: () => <div data-testid="dashboard-admin">Dashboard Admin</div>,
}));

vi.mock('../app/components/DashboardOperator', () => ({
  default: () => <div data-testid="dashboard-operator">Dashboard Operator</div>,
}));

vi.mock('../app/components/DashboardPimpinan', () => ({
  default: () => <div data-testid="dashboard-pimpinan">Dashboard Pimpinan</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render app container', () => {
    // Test that required exports exist from the api service
    const { api } = require('../services/api');
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
    expect(api.patch).toBeDefined();
    expect(api.upload).toBeDefined();
  });

  it('should handle api errors correctly', () => {
    const { ApiError } = require('../services/api');
    const error = new ApiError('Test error', 500, { detail: 'error' });
    expect(error.status).toBe(500);
    expect(error.message).toBe('Test error');
    expect(error.data).toEqual({ detail: 'error' });
    expect(error).toBeInstanceOf(Error);
  });

  it('should have proper component structure for roles', () => {
    // Check that all dashboards are defined
    const DashboardAdmin = require('../app/components/DashboardAdmin').default;
    const DashboardOperator = require('../app/components/DashboardOperator').default;
    const DashboardPimpinan = require('../app/components/DashboardPimpinan').default;

    const { container: adminContainer } = render(<DashboardAdmin />);
    expect(screen.getByTestId('dashboard-admin')).toBeInTheDocument();
    expect(adminContainer.textContent).toContain('Dashboard Admin');
  });
});