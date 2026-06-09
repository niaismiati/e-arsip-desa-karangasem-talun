import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminPengguna() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'operator', jabatan: '', desa: 'Desa Karangasem' });

  const fetchData = async () => {
    try { const { data } = await api.get('/pengguna'); setList(data); }
    catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item
      ? { nama: item.nama, username: item.username, password: '', role: item.role, jabatan: item.jabatan || '', desa: item.desa }
      : { nama: '', username: '', password: '', role: 'operator', jabatan: '', desa: 'Desa Karangasem' }
    );
    setModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) await api.put(`/pengguna/${editing.id}`, payload);
      else await api.post('/pengguna', payload);
      toast.success(editing ? 'Pengguna diperbarui' : 'Pengguna ditambahkan');
      setModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
  };

  const handleToggle = async (id) => {
    try { await api.put(`/pengguna/${id}/toggle-active`); fetchData(); }
    catch { toast.error('Gagal mengubah status'); }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin hapus pengguna ini?')) return;
    try { await api.delete(`/pengguna/${id}`); toast.success('Dihapus'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const roleColor = { admin: 'bg-red-100 text-red-700', operator: 'bg-blue-100 text-blue-700', pimpinan: 'bg-purple-100 text-purple-700' };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun pengguna sistem</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['No', 'Nama', 'Username', 'Jabatan', 'Role', 'Desa', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Memuat...</td></tr>
              : list.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.nama}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.jabatan}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.desa}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openModal(u)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Pencil size={14} /></button>
                      <button onClick={() => handleToggle(u.id)} className={`p-1.5 rounded-lg ${u.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                        {u.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button onClick={() => handleHapus(u.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Pengguna' : 'Tambah Pengguna'}>
        <div className="space-y-4">
          {[['nama', 'Nama Lengkap', 'text', 'Masukkan nama lengkap'], ['username', 'Username', 'text', 'Tanpa spasi'], ['jabatan', 'Jabatan', 'text', 'mis: Sekretaris Desa']].map(([field, label, type, ph]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {field !== 'jabatan' && <span className="text-red-500">*</span>}</label>
              <input type={type} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={ph} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password {!editing && <span className="text-red-500">*</span>}</label>
            <input type="password" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="pimpinan">Pimpinan</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
