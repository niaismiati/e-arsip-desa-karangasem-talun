import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Archive, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      toast.success(`Selamat datang, ${user.nama}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'operator') navigate('/operator/dashboard');
      else navigate('/pimpinan/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] via-[#1a3a6b] to-[#2563eb] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] px-8 py-7 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Archive size={30} />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">E-ARSIP DESA</h1>
          <p className="text-blue-200 text-sm mt-1">Desa Karangasem</p>
          <p className="text-blue-300 text-xs mt-0.5">Sistem Informasi Pengarsipan Surat</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-gray-500 mb-6">Silakan masukkan kredensial Anda</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lupa password?</span>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-11"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-blue-600 w-4 h-4" />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Ingat saya</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Memproses...</>
              ) : (
                <><LogIn size={18} /> Masuk</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-blue-600 font-medium hover:underline">Daftar di sini</Link>
          </p>
        </div>

        <div className="bg-gray-50 px-8 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2026 E-Arsip Desa Karangasem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
