import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminKlasifikasi() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ kode: '', nama_klasifikasi: '', keterangan: '' });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/klasifikasi');
      setList(data);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { kode: item.kode, nama_klasifikasi: item.nama_klasifikasi, keterangan: item.keterangan || '' } : { kode: '', nama_klasifikasi: '', keterangan: '' });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/klasifikasi/${editing.id}`, form);
      else await api.post('/klasifikasi', form);
      toast.success(editing ? 'Klasifikasi diperbarui' : 'Klasifikasi ditambahkan');
      setModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try { await api.delete(`/klasifikasi/${id}`); toast.success('Dihapus'); fetchData(); }
    catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Klasifikasi Surat</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kode klasifikasi arsip surat desa</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Klasifikasi
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Kode</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Klasifikasi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>
            ) : list.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg">{item.kode}</span>
                </td>
                <td className="px-5 py-3 font-medium text-gray-700">{item.nama_klasifikasi}</td>
                <td className="px-5 py-3 text-gray-500">{item.keterangan}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openModal(item)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Pencil size={14} /></button>
                    <button onClick={() => handleHapus(item.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Klasifikasi' : 'Tambah Klasifikasi'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode <span className="text-red-500">*</span></label>
            <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="mis: 000, 100, 400" value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Klasifikasi <span className="text-red-500">*</span></label>
            <input className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="mis: Umum, Pemerintahan" value={form.nama_klasifikasi} onChange={e => setForm({ ...form, nama_klasifikasi: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
            <textarea className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="Keterangan singkat..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
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
