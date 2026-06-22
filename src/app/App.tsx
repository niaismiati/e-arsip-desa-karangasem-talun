import { Component, ReactNode, useEffect, useState, ErrorInfo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import { LoginPage } from './components/LoginPage';
import { api } from '../services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPimpinan } from './components/DashboardPimpinan';
import { DashboardOperator } from './components/DashboardOperator';
import { DashboardAdmin } from './components/DashboardAdmin';
import { SuratMasuk } from './components/SuratMasuk';
import { SuratKeluar } from './components/SuratKeluar';
import { Disposisi } from './components/Disposisi';
import { Klasifikasi } from './components/Klasifikasi';
import { Laporan } from './components/Laporan';
import { Pengaturan } from './components/Pengaturan';
import { KelolaUser } from './components/KelolaUser';
import { ProfilDesa } from './components/ProfilDesa';

type UserRole = 'admin' | 'kades' | 'pimpinan' | 'operator';

const validRoles: UserRole[] = ['admin', 'kades', 'pimpinan', 'operator'];

const normalizeRole = (role?: string): UserRole => {
  if (role === 'kepala_desa') return 'kades';
  return validRoles.includes(role as UserRole) ? (role as UserRole) : 'operator';
};

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary] Render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Tampilan gagal dimuat</h1>
            <p className="text-sm text-gray-600 mb-4">
              Sesi atau data halaman bermasalah. Muat ulang aplikasi untuk kembali ke halaman login.
            </p>
            {this.state.error && (
              <p className="text-xs text-red-500 mb-4 break-all">{this.state.error.message}</p>
            )}
            <button
              onClick={() => {
                clearSession();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [checkingSession, setCheckingSession] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return 'operator';
    try {
      const parsed = JSON.parse(savedUser);
      return normalizeRole(parsed?.role);
    } catch {
      return 'operator';
    }
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fungsi global untuk apply tema — bisa dipanggil dari mana saja
  const applyTheme = (tema: string) => {
    const root = document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else if (tema === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  };

  // Inisialisasi tema dari localStorage saat mount + listener real-time
  useEffect(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      applyTheme(saved ? JSON.parse(saved).tema : 'light');
    } catch {
      applyTheme('light');
    }

    // Listener perubahan tema dari komponen Pengaturan via custom event
    const handleThemeChange = () => {
      try {
        const saved = localStorage.getItem('appSettings');
        applyTheme(saved ? JSON.parse(saved).tema : 'light');
      } catch {
        applyTheme('light');
      }
    };
    window.addEventListener('app:themeChange', handleThemeChange);

    // Listener perubahan localStorage dari tab lain
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'appSettings') {
        handleThemeChange();
      }
    };
    window.addEventListener('storage', handleStorage);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem('appSettings');
        if (saved && JSON.parse(saved).tema === 'system') {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      } catch {}
    };
    mql.addEventListener('change', handler);

    return () => {
      window.removeEventListener('app:themeChange', handleThemeChange);
      window.removeEventListener('storage', handleStorage);
      mql.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    api.get('/auth/me')
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.data) {
          const user = data.data as any;
          const normalizedUser = { ...user, role: normalizeRole(user?.role) };
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUserRole(normalizedUser.role);
          setIsLoggedIn(true);
        } else {
          throw new Error('Sesi tidak valid');
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUserRole('operator');
        setIsLoggedIn(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = (role: string, token: string, user: { nama: string; email: string; role: string }) => {
    const normalizedUser = { ...user, role: normalizeRole(role || user.role) };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUserRole(normalizedUser.role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari aplikasi?')) {
      clearSession();
      setIsLoggedIn(false);
      setUserRole('operator');
      setActivePage('dashboard');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'kades':
      case 'pimpinan':
        return 'Kepala Desa';
      default:
        return 'Operator';
    }
  };

  const getUserName = (role: string) => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nama) return parsed.nama;
      } catch {}
    }
    switch (role) {
      case 'admin':
        return 'Admin Sistem';
      case 'kades':
      case 'pimpinan':
        return 'Kepala Desa';
      default:
        return 'Operator Desa';
    }
  };

  const getPageTitle = (page: string, role: string) => {
    const rolePrefix = role === 'admin' ? 'Admin' : role === 'kades' ? 'Pimpinan' : 'Operator';

    switch (page) {
      case 'dashboard':
        return userRole === 'admin' ? 'Dashboard Admin' : userRole === 'operator' ? 'Dashboard Operator' : (role === 'kades' || role === 'pimpinan') ? 'Dashboard Pimpinan' : `${rolePrefix} - Dashboard`;

      case 'surat-masuk':
        return `${rolePrefix} - Surat Masuk`;
      case 'surat-keluar':
        return `${rolePrefix} - Surat Keluar`;
      case 'kelola-user':
        return 'Admin - Kelola Pengguna';
      case 'profil-desa':
        return 'Admin - Profil Desa';
      case 'disposisi':
        return `${rolePrefix} - Disposisi`;
      case 'klasifikasi':
        return `${rolePrefix} - Klasifikasi Surat`;
      case 'laporan':
        return `${rolePrefix} - Laporan`;
      case 'pengaturan':
        return `${rolePrefix} - Pengaturan`;
      default:
        return rolePrefix;
    }
  };

  const getPageSubtitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return (userRole === 'kades' || userRole === 'pimpinan') ? 'Kepala Desa' : undefined;
      default:
        return undefined;
    }
  };

  // Update document title
  useEffect(() => {
    if (isLoggedIn) {
      document.title = `${getPageTitle(activePage, userRole)} - E-Arsip Desa`;
    } else {
      document.title = 'E-Arsip Desa Karangasem';
    }
  }, [isLoggedIn, activePage, userRole]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow px-6 py-5 text-center">
          <p className="text-sm font-medium text-gray-700">Memuat sesi login...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppErrorBoundary>
    );
  }

  return (
    <AppErrorBoundary>
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activePage={activePage} onPageChange={setActivePage} userRole={userRole} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={getUserName(userRole)}
          userRole={getRoleName(userRole)}
          pageTitle={getPageTitle(activePage, userRole)}
          pageSubtitle={getPageSubtitle(activePage)}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {activePage === 'dashboard' && (userRole === 'kades' || userRole === 'pimpinan') && <DashboardPimpinan />}
          {activePage === 'dashboard' && userRole === 'admin' && <DashboardAdmin />}
          {activePage === 'dashboard' && userRole === 'operator' && <DashboardOperator />}

          {activePage === 'surat-masuk' && <SuratMasuk />}
          {activePage === 'surat-keluar' && <SuratKeluar />}
          {activePage === 'disposisi' && <Disposisi userRole={userRole} />}
          {activePage === 'klasifikasi' && <Klasifikasi />}
          {activePage === 'laporan' && <Laporan />}
          {activePage === 'pengaturan' && <Pengaturan />}
          {activePage === 'kelola-user' && userRole === 'admin' && <KelolaUser />}
          {activePage === 'profil-desa' && userRole === 'admin' && <ProfilDesa />}

          {activePage === 'kelola-user' && userRole !== 'admin' && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-600 font-semibold">Akses ditolak</p>
                <p className="text-gray-500 text-sm mt-1">Anda tidak memiliki akses ke halaman ini.</p>
              </div>
            </div>
          )}
          {activePage === 'profil-desa' && userRole !== 'admin' && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-600 font-semibold">Akses ditolak</p>
                <p className="text-gray-500 text-sm mt-1">Anda tidak memiliki akses ke halaman ini.</p>
              </div>
            </div>
          )}

          {!['dashboard', 'surat-masuk', 'surat-keluar', 'disposisi', 'klasifikasi', 'laporan', 'pengaturan', 'kelola-user', 'profil-desa'].includes(activePage) && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">Halaman {activePage} sedang dalam pengembangan</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AppErrorBoundary>
  );
}
