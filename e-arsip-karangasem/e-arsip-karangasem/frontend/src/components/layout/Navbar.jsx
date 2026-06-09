import { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const notifData = [
  { id: 1, pesan: 'Surat masuk baru dari Dinas PMD Kabupaten', waktu: '5 menit lalu', dibaca: false },
  { id: 2, pesan: 'Disposisi menunggu persetujuan Anda', waktu: '1 jam lalu', dibaca: false },
  { id: 3, pesan: 'Laporan keuangan bulan ini tersedia', waktu: '2 jam lalu', dibaca: true },
];

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const belumDibaca = notifData.filter(n => !n.dibaca).length;

  const close = () => { setShowNotif(false); setShowUser(false); };

  return (
    <header className="h-14 bg-[#1e2d5a] text-white flex items-center justify-between px-5 fixed top-0 left-[220px] right-0 z-20 shadow-md">
      <h1 className="font-semibold text-[15px] truncate">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Bell size={19} />
            {belumDibaca > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {belumDibaca}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">Notifikasi</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Tandai semua dibaca</span>
              </div>
              {notifData.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start gap-2 ${!n.dibaca ? 'bg-blue-50/40' : ''}`}>
                  {!n.dibaca && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  <div className={!n.dibaca ? '' : 'ml-4'}>
                    <p className="text-sm text-gray-700 leading-snug">{n.pesan}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.waktu}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua notifikasi</span>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user?.nama}</p>
              <p className="text-[11px] text-blue-200 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-blue-200 flex-shrink-0" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{user?.nama}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} · {user?.desa}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User size={15} /> Profil Saya</button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Settings size={15} /> Pengaturan</button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut size={15} /> Keluar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showNotif || showUser) && <div className="fixed inset-0 z-40" onClick={close} />}
    </header>
  );
}
