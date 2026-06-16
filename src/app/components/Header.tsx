import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, User, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userRole: string;
  pageTitle: string;
  pageSubtitle?: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function Header({ userName, userRole, pageTitle, pageSubtitle, onLogout, onToggleSidebar }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <header className="bg-indigo-600 text-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="p-2 hover:bg-white/10 rounded transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
            {pageSubtitle && <p className="text-sm text-indigo-100">{pageSubtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white/10 rounded transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-indigo-100">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-indigo-100" />
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
