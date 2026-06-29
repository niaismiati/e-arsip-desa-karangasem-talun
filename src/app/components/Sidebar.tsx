import {
  LayoutDashboard,
  Mail,
  Send,
  FileText,
  Folder,
  BarChart3,
  Settings,
  Building2,
  Users
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  userRole: string;
  sidebarOpen: boolean;
  onClose: () => void;
}

const getMenuItems = (role: string) => {
  const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const operatorMenu = [
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Mail },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send },
    { id: 'disposisi', label: 'Disposisi', icon: FileText },
    { id: 'klasifikasi', label: 'Klasifikasi', icon: Folder },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  ];

  const kadesMenu = [
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Mail },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send },
    { id: 'disposisi', label: 'Disposisi', icon: FileText },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  ];

  const adminMenu = [
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Mail },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send },
    { id: 'disposisi', label: 'Disposisi', icon: FileText },
    { id: 'kelola-user', label: 'Kelola Pengguna', icon: Users },
    { id: 'profil-desa', label: 'Profil Desa', icon: Building2 },
    { id: 'klasifikasi', label: 'Klasifikasi', icon: Folder },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  ];

  const settingsMenu = [
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  if (role === 'admin') {
    return [...baseMenu, ...adminMenu, ...settingsMenu];
  } else if (role === 'kades' || role === 'pimpinan') {
    return [...baseMenu, ...kadesMenu, ...settingsMenu];
  } else {
    return [...baseMenu, ...operatorMenu, ...settingsMenu];
  }
};

export function Sidebar({ activePage, onPageChange, userRole, sidebarOpen, onClose }: SidebarProps) {
  const menuItems = getMenuItems(userRole);

  const getUserInfo = () => {
    const saved = localStorage.getItem('user');
    let nama = userRole === 'admin' ? 'Admin Sistem' : userRole === 'kades' || userRole === 'pimpinan' ? 'Kepala Desa' : 'Operator Desa';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nama) nama = parsed.nama;
      } catch (e) { console.warn('Gagal parse user info:', e); }
    }
    const jabatan = userRole === 'admin' ? 'Admin' : userRole === 'kades' || userRole === 'pimpinan' ? 'Kepala Desa' : 'Operator';
    return { nama, jabatan, desa: 'Desa Karangasem' };
  };

  const userInfo = getUserInfo();
  const sidebarBgColor = 'bg-blue-900';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-blue-900/50 z-30 md:hidden" onClick={onClose} />
      )}
      <div className={`fixed md:static z-40 inset-y-0 left-0 w-64 ${sidebarBgColor} h-screen flex flex-col text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-white">
            <img src="/logo.png" alt="Logo Kabupaten" className="w-10 h-10 rounded-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">E-ARSIP DESA</h2>
            <p className="text-xs text-blue-200">Sistem Informasi Pengarsipan<br/>Surat Desa</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">MENU UTAMA</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="m-4 bg-blue-900 rounded-lg p-4 border border-blue-800">
        <p className="text-xs font-semibold text-blue-300 mb-2">Informasi {userInfo.jabatan}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-start">
            <span className="text-blue-400 w-16">Nama</span>
            <span className="text-white">: {userInfo.nama}</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-400 w-16">Jabatan</span>
            <span className="text-white">: {userInfo.jabatan}</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-400 w-16">Desa</span>
            <span className="text-white">: {userInfo.desa}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-blue-800 text-xs text-blue-300">
        <p>&copy; 2026 E-Arsip Desa</p>
        <p>All rights reserved.</p>
      </div>
    </div>
    </>
  );
}

