import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginPageProps {
  onLogin: (role: string, token: string, user: { nama: string; email: string; role: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.data.user.role, data.data.token, data.data.user);
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Koneksi lambat. Silakan coba lagi.');
      } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Gagal terhubung ke server. Pastikan server backend berjalan.');
      } else {
        console.error('[LoginPage] Error:', err);
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#F8FAFC]">
      {/* Ornamen blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5B3DF5]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-[#5B3DF5]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-[rgba(91,61,245,0.08)] p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-[#e2e8f0] overflow-hidden mb-4">
              <img
                src="/logo.png"
                alt="Logo Desa"
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937] mb-1">E-Arsip Desa Karangasem</h1>
            <p className="text-sm text-[#6B7280] text-center">Sistem Pengelolaan Arsip Digital</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@desa.id"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none transition-all duration-200 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A5F] text-white py-2.5 rounded-xl font-medium hover:bg-[#162D4A] transition-all duration-200 disabled:bg-[#1E3A5F]/50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(30,58,95,.18)] mt-2"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#6B7280] mt-6">
          &copy; 2026 E-Arsip Desa Karangasem
        </p>
      </div>
    </div>
  );
}
