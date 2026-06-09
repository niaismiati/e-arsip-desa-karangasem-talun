import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Mail, Send, FolderOpen,
  FileText, Users, Settings, LogOut,
  ClipboardList, User, Archive,
} from 'lucide-react';

const menuConfig = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/admin/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/admin/surat-keluar', label: 'Surat Keluar', icon: Send },
    { section: 'KLASIFIKASI' },
    { path: '/admin/klasifikasi', label: 'Klasifikasi Surat', icon: FolderOpen },
    { section: 'LAPORAN' },
    { path: '/admin/laporan', label: 'Laporan', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/admin/pengguna', label: 'Pengguna', icon: Users },
    { path: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
  ],
  operator: [
    { path: '/operator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/operator/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/operator/surat-keluar', label: 'Surat Keluar', icon: Send },
    { section: 'DISPOSISI' },
    { path: '/operator/disposisi', label: 'Disposisi Surat', icon: ClipboardList },
    { section: 'LAPORAN' },
    { path: '/operator/laporan', label: 'Laporan', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/operator/pengguna', label: 'Pengguna', icon: Users },
    { path: '/operator/profil', label: 'Profil Saya', icon: User },
  ],
  pimpinan: [
    { path: '/pimpinan/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/pimpinan/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/pimpinan/surat-keluar', label: 'Surat Keluar', icon: Send },
    { path: '/pimpinan/disposisi-saya', label: 'Disposisi Saya', icon: ClipboardList, badge: 3 },
    { section: 'LAPORAN' },
    { path: '/pimpinan/laporan', label: 'Laporan Surat', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/pimpinan/profil', label: 'Profil Saya', icon: User },
    { path: '/pimpinan/ubah-password', label: 'Ubah Password', icon: Settings },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const menus = menuConfig[user?.role] || [];

  return (
    <div className="w-[220px] min-h-screen bg-[#1e2d5a] text-white flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Archive size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight tracking-wide">E-ARSIP DESA</p>
          <p className="text-[11px] text-blue-300">Karangasem</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menus.map((item, i) => {
          if (item.section) {
            return (
              <p key={i} className="text-[10px] text-blue-400 font-semibold tracking-widest mt-4 mb-1 px-2 uppercase">
                {item.section}
              </p>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white font-medium shadow-sm'
                    : 'text-blue-100 hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Info Pengguna */}
      <div className="p-3 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3 mb-2">
          <p className="text-xs font-semibold text-white leading-tight">{user?.nama}</p>
          <p className="text-[11px] text-blue-300 capitalize mt-0.5">{user?.jabatan || user?.role}</p>
          <p className="text-[10px] text-blue-400 mt-0.5">{user?.desa}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-all"
        >
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </div>
  );
}
