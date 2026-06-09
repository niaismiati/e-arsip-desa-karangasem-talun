import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Archive, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ nama: '', username: '', password: '', konfirmasi: '', jabatan: '', role: 'operator' });
  const [showPass, setShowPass] = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const passMatch = form.konfirmasi && form.password !== form.konfirmasi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi) return toast.error('Password tidak cocok');
    if (form.password.length < 6) return toast.error('Password minimal 6 karakter');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nama: form.nama, username: form.username, password: form.password,
        jabatan: form.jabatan, role: form.role, desa: 'Desa Karangasem',
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] to-[#2563eb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-gray-500 text-sm mb-2">Akun Anda telah terdaftar.</p>
        <p className="text-gray-500 text-sm mb-7">Silakan tunggu <span className="font-semibold text-[#1e2d5a]">persetujuan Administrator</span> sebelum dapat masuk ke sistem.</p>
        <button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
          Kembali ke Login
        </button>
        <p className="text-xs text-gray-400 mt-5">© 2026 E-Arsip Desa Karangasem</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] via-[#1a3a6b] to-[#2563eb] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] px-8 py-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Archive size={26} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">E-ARSIP DESA</h1>
          <p className="text-blue-200 text-sm mt-0.5">Desa Karangasem — Daftar Akun</p>
        </div>

        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Buat Akun Baru</h2>
          <p className="text-sm text-gray-500 mb-5">Lengkapi data berikut untuk mendaftar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jabatan <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="mis: Sekretaris Desa, Kaur Umum" value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role / Hak Akses <span className="text-red-500">*</span></label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="operator">Operator</option>
                <option value="pimpinan">Pimpinan / Kepala Desa</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">* Role Admin hanya dapat dibuat oleh Administrator</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tanpa spasi (huruf, angka, _)" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required pattern="[a-zA-Z0-9_]+" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11" placeholder="Minimal 6 karakter" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showKonfirm ? 'text' : 'password'} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11 transition-all ${passMatch ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} placeholder="Ulangi password" value={form.konfirmasi} onChange={e => setForm({ ...form, konfirmasi: e.target.value })} required />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowKonfirm(!showKonfirm)}>
                  {showKonfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passMatch && <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>}
            </div>

            <button type="submit" disabled={loading || passMatch} className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md mt-2">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Mendaftar...</>
              ) : (
                <><UserPlus size={18} /> Daftar Sekarang</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>

        <div className="bg-gray-50 px-8 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2026 E-Arsip Desa Karangasem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
