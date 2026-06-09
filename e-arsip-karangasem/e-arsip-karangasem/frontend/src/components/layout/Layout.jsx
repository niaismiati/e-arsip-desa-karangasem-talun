import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/surat-masuk': 'Surat Masuk',
  '/admin/surat-keluar': 'Surat Keluar',
  '/admin/klasifikasi': 'Klasifikasi Surat',
  '/admin/pengguna': 'Manajemen Pengguna',
  '/admin/laporan': 'Laporan',
  '/operator/dashboard': 'Dashboard',
  '/operator/surat-masuk': 'Surat Masuk',
  '/operator/surat-keluar': 'Surat Keluar',
  '/operator/disposisi': 'Disposisi Surat',
  '/pimpinan/dashboard': 'Dashboard Pimpinan',
  '/pimpinan/surat-masuk': 'Surat Masuk',
  '/pimpinan/surat-keluar': 'Surat Keluar',
  '/pimpinan/disposisi-saya': 'Disposisi Saya',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'E-Arsip Desa Karangasem';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-[220px] flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 mt-14 overflow-auto">
          <Outlet />
        </main>
        <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-100 bg-white">
          © 2026 E-Arsip Desa Karangasem | Sistem Informasi Pengarsipan Surat Desa
        </footer>
      </div>
    </div>
  );
}
