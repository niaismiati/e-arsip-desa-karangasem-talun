import { useState } from 'react';
import { Bell, LogOut, User, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userRole: string;
  pageTitle: string;
  pageSubtitle?: string;
  onLogout: () => void;
}

export function Header({ userName, userRole, pageTitle, pageSubtitle, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-indigo-600';
      case 'Kepala Desa':
        return 'bg-indigo-600';
      default:
        return 'bg-indigo-600';
    }
  };
  const getRoleTextColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'text-indigo-100';
      case 'Kepala Desa':
        return 'text-indigo-100';
      default:
        return 'text-indigo-100';
    }
  };

  return (
    <header className={`${getRoleColor(userRole)} text-white px-6 py-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
            {pageSubtitle && <p className="text-sm text-indigo-100">{pageSubtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-white/10 rounded transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* User Profile with Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium">{userName}</p>
                 <p className={`text-xs ${getRoleTextColor(userRole)}`}>{userRole}</p>
               </div>
               <ChevronDown className={`w-4 h-4 ${getRoleTextColor(userRole)}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 text-gray-800">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
