import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Eye, X, AlertCircle, Folder, Archive } from 'lucide-react';
import { useSSE } from '../../hooks/useSSE';

interface KlasifikasiItem {
  id: number;
  kode: string;
  nama: string;
  keterangan: string | null;
  total_arsip: number;
}

export function Klasifikasi() {
  const [items, setItems] = useState<KlasifikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<KlasifikasiItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KlasifikasiItem | null>(null);

  const [form, setForm] = useState({
    kode: '',
    nama: '',
    keterangan: '',
  });

  const token = localStorage.getItem('token') || '';

  const loadData = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/klasifikasi${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) setItems(data.data);
      else setError(data.message);
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  useSSE([
    'klasifikasi:created', 'klasifikasi:updated', 'klasifikasi:deleted',
  ], loadData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/klasifikasi/${editingId}` : '/api/klasifikasi';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setForm({ kode: '', nama: '', keterangan: '' });
        loadData();
      } else {
        setError(data.message || 'Gagal menyimpan');
      }
    } catch {
      setError('Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch(`/api/klasifikasi/${deleteItem.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setDeleteItem(null);
        loadData();
      } else {
        setError(data.message || 'Gagal menghapus');
      }
    } catch {
      setError('Terjadi kesalahan');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ kode: '', nama: '', keterangan: '' });
    setShowForm(true);
  };

  const openEdit = (item: KlasifikasiItem) => {
    setEditingId(item.id);
    setForm({
      kode: item.kode,
      nama: item.nama,
      keterangan: item.keterangan || '',
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Klasifikasi Surat</h2>
          <p className="text-sm text-gray-600">Kelola klasifikasi surat desa</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-5 h-5" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto max-h-[80vh]">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Klasifikasi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Keterangan</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Arsip</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.kode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.keterangan || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <Archive className="w-4 h-4" />
                      {item.total_arsip}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setDetailItem(item)} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteItem(item)} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
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

      {showForm && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit' : 'Tambah'} Klasifikasi</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Klasifikasi</label>
                <input
                  type="text"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: KU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Klasifikasi</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Kewajiban Umum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Keterangan tambahan (opsional)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailItem && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Detail Klasifikasi</h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm">
                <span className="text-gray-600">Kode:</span>{' '}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {detailItem.kode}
                </span>
              </p>
              <p className="text-sm"><span className="text-gray-600">Nama:</span> <span className="font-medium">{detailItem.nama}</span></p>
              <p className="text-sm"><span className="text-gray-600">Keterangan:</span> {detailItem.keterangan || '-'}</p>
              <p className="text-sm"><span className="text-gray-600">Total Arsip:</span> {detailItem.total_arsip}</p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setDetailItem(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Klasifikasi?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus klasifikasi <strong>{deleteItem.kode}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
