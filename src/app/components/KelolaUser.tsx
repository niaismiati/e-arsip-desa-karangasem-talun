import { Plus, Edit, Trash2, X, User, AlertCircle, Key, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSSE } from '../../hooks/useSSE';

interface UserData {
  id: number;
  nama: string;
  email: string;
  role: string;
  status: string;
}

export function KelolaUser() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasiPassword: '',
    role: 'operator'
  });
  const [resetPassword, setResetPassword] = useState<{ id: number; nama: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const token = localStorage.getItem('token') || '';

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setError('');
      } else {
        setError(data.message || 'Gagal load users');
      }
    } catch (err) {
      setError('Gagal load users: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useSSE([
    'users:created', 'users:updated', 'users:deleted', 'users:toggle',
  ], loadUsers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.nama || !formData.email) {
      setError('Nama dan email wajib diisi');
      return;
    }

    if (!editingId && !formData.password) {
      setError('Password wajib diisi untuk pengguna baru');
      return;
    }

    if (formData.password && formData.password !== formData.konfirmasiPassword) {
      setError('Password dan Konfirmasi Password tidak cocok');
      return;
    }

    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';
      const body: any = {
        nama: formData.nama,
        email: formData.email,
        role: formData.role,
      };
      if (!editingId || formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        await loadUsers();
        setShowModal(false);
        setEditingId(null);
        setFormData({ nama: '', email: '', password: '', konfirmasiPassword: '', role: 'operator' });
      } else {
        setError(data.message || 'Gagal menyimpan user');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        await loadUsers();
      } else {
        setError(data.message || 'Gagal hapus user');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingId(user.id);
    setFormData({
      nama: user.nama,
      email: user.email,
      password: '',
      konfirmasiPassword: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleResetPassword = async () => {
    if (!resetPassword || newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    try {
      const res = await fetch(`/api/users/${resetPassword.id}/password`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setResetPassword(null);
        setNewPassword('');
        setError('');
      } else {
        setError(data.message || 'Gagal reset password');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    if (!confirm(`Yakin ingin ${newStatus === 'Nonaktif' ? 'menonaktifkan' : 'mengaktifkan'} pengguna ${user.nama}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        await loadUsers();
      } else {
        setError(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gray-700 text-white';
      case 'kades':
        return 'bg-indigo-700 text-white';
      default:
        return 'bg-green-700 text-white';
    }
  };

  const getRoleDisplay = (role: string) => {
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

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nama: '', email: '', password: '', konfirmasiPassword: '', role: 'operator' });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto max-h-[80vh]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Tidak ada pengguna</td></tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded ${user.status === 'Aktif' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.status === 'Aktif' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setResetPassword({ id: user.id, nama: user.nama }); setNewPassword(''); setError(''); }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Pengguna */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit' : 'Tambah'} Pengguna
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingId && '(kosongkan jika tidak ingin diubah)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required={!editingId}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showKonfirmasi ? "text" : "password"}
                    value={formData.konfirmasiPassword}
                    onChange={(e) => setFormData({...formData, konfirmasiPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required={!editingId}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKonfirmasi ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Role</option>
                  <option value="operator">Operator</option>
                  <option value="kades">Kepala Desa</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Reset Password */}
      {resetPassword && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Reset Password</h3>
              <button onClick={() => setResetPassword(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Reset password untuk <strong>{resetPassword.nama}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleResetPassword} className="flex-1 bg-amber-600 text-white py-2 rounded-md font-medium hover:bg-amber-700 transition-colors">
                  Reset Password
                </button>
                <button onClick={() => setResetPassword(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
