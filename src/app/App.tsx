import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return 'operator';
    try {
      const parsed = JSON.parse(savedUser);
      return parsed?.role || 'operator';
    } catch {
      return 'operator';
    }
  });
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (role: string, token: string, user: { nama: string; email: string; role: string }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari aplikasi?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} userRole={userRole} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={getUserName(userRole)}
          userRole={getRoleName(userRole)}
          pageTitle={getPageTitle(activePage, userRole)}
          pageSubtitle={getPageSubtitle(activePage)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
{activePage === 'dashboard' && (userRole === 'kades' || userRole === 'pimpinan') && <DashboardPimpinan />}
          {activePage === 'dashboard' && userRole === 'admin' && <DashboardAdmin />}
          {activePage === 'dashboard' && userRole === 'operator' && <DashboardOperator />}

          {activePage === 'surat-masuk' && <SuratMasuk />}
          {activePage === 'surat-keluar' && <SuratKeluar />}
          {activePage === 'disposisi' && <Disposisi />}
          {activePage === 'klasifikasi' && <Klasifikasi />}
          {activePage === 'laporan' && <Laporan />}
          {activePage === 'pengaturan' && <Pengaturan />}
          {activePage === 'kelola-user' && <KelolaUser />}
          {activePage === 'profil-desa' && <ProfilDesa />}
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
  );
}
