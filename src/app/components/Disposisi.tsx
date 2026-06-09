import { useEffect, useState } from 'react';
import { Search, Plus, Eye, X, CheckCircle, AlertCircle, User } from 'lucide-react';

interface DisposisiItem {
  id: number;
  surat_masuk_id: number;
  nomor_surat: string;
  asal_surat: string;
  surat_perihal: string;
  dari_nama: string;
  dari_role: string;
  kepada_nama: string;
  kepada_role: string;
  instruksi: string;
  status: string;
  batas_waktu: string | null;
  catatan: string | null;
  created_at: string;
}

interface SuratMasukOption {
  id: number;
  nomor_surat: string;
  asal_surat: string;
  perihal: string;
}

interface UserOption {
  id: number;
  nama: string;
  role: string;
}

type StatusBackend = 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Selesai';

export function Disposisi() {
  const [items, setItems] = useState<DisposisiItem[]>([]);
  const [suratMasukList, setSuratMasukList] = useState<SuratMasukOption[]>([]);
  const [userList, setUserList] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailItem, setDetailItem] = useState<DisposisiItem | null>(null);

  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    surat_masuk_id: '',
    kepada_user_id: '',
    instruksi: '',
    catatan: '',
    batas_waktu: '',
  });

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadData();
  }, [search, filterStatus]);

  // Auto-refresh: polling every 15 detik (SSE tidak tersedia di backend)
  useEffect(() => {
    const iv = setInterval(loadData, 15000);
    return () => clearInterval(iv);
  }, [search, filterStatus]);

  useEffect(() => {
    loadSuratMasuk();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuratMasuk = async () => {
    try {
      const res = await fetch('/api/surat-masuk?status=' + encodeURIComponent('Belum Disposisi'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data) setSuratMasukList(data.data);
    } catch (e) {
      console.error('Gagal load surat masuk untuk disposisi:', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data) setUserList(data.data);
    } catch (e) {
      console.error('Gagal load user untuk disposisi:', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);

      const res = await fetch(`/api/disposisi?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data?.data) setItems(data.data);
      else setItems([]);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/disposisi', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surat_masuk_id: form.surat_masuk_id,
          kepada_user_id: form.kepada_user_id,
          instruksi: form.instruksi,
          catatan: form.catatan || null,
          batas_waktu: form.batas_waktu || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || 'Gagal menyimpan');
        return;
      }

      setShowForm(false);
            setForm({ surat_masuk_id: '', kepada_user_id: '', instruksi: '', catatan: '', batas_waktu: '' });
      await loadData();
    } catch (err: any) {
      setError(err?.message ? `Terjadi kesalahan: ${err.message}` : 'Terjadi kesalahan');
    }
  };

  const [statusAction, setStatusAction] = useState<{ id: number; newStatus: StatusBackend } | null>(null);
  const [statusCatatan, setStatusCatatan] = useState('');

  const handleStatusChange = async (id: number, newStatus: StatusBackend, catatan?: string) => {
    try {
      setError('');

      let endpoint = `/api/disposisi/${id}`;
      if (newStatus === 'Disetujui') endpoint += '/approve';
      else if (newStatus === 'Selesai') endpoint += '/selesai';
      else if (newStatus === 'Ditolak') endpoint += '/reject';

      const body = catatan ? { catatan } : undefined;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || 'Gagal mengubah status');
        return;
      }

      await loadData();
      setDetailItem(null);
      setStatusAction(null);
      setStatusCatatan('');
    } catch (err: any) {
      setError(err?.message ? `Terjadi kesalahan: ${err.message}` : 'Terjadi kesalahan');
    }
  };

  const fmtDate = (s: string) => {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      case 'Disetujui':
        return 'bg-blue-100 text-blue-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      case 'Menunggu':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { label: 'Semua Status', value: '' },
    { label: 'Menunggu', value: 'Menunggu' },
    { label: 'Disetujui', value: 'Disetujui' },
    { label: 'Ditolak', value: 'Ditolak' },
    { label: 'Selesai', value: 'Selesai' },
  ];

  const uiStatusLabel = (backendStatus: string) => {
    switch (backendStatus) {
      case 'Menunggu':
        return 'Menunggu';
      case 'Disetujui':
        return 'Disetujui';
      case 'Ditolak':
        return 'Ditolak';
      case 'Selesai':
        return 'Selesai';
      default:
        return backendStatus;
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Disposisi</h2>
          <p className="text-sm text-gray-600">Kelola disposisi surat masuk</p>
        </div>
        <button
          onClick={() => {
            setError('');
      setForm({ surat_masuk_id: '', kepada_user_id: '', instruksi: '', catatan: '', batas_waktu: '' });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" /> Buat Disposisi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari surat, instruksi..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor Surat</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Asal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Perihal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dari</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kepada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Instruksi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Memuat...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nomor_surat}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.asal_surat}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.surat_perihal}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.dari_nama}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.kepada_nama}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate"
                    title={item.instruksi}
                  >
                    {item.instruksi}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}
                    >
                      {uiStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'Menunggu' && (
                        <button
                          onClick={() => {
                            setStatusAction({ id: item.id, newStatus: 'Selesai' });
                            setStatusCatatan('');
                          }}
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Tandai Selesai"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Buat Disposisi</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surat Masuk</label>
                <select
                  value={form.surat_masuk_id}
                  onChange={(e) => setForm({ ...form, surat_masuk_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Pilih surat masuk</option>
                  {suratMasukList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomor_surat} - {s.asal_surat} ({s.perihal})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan (Kepada)</label>
                <select
                  value={form.kepada_user_id}
                  onChange={(e) => setForm({ ...form, kepada_user_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Pilih tujuan</option>
                  {userList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instruksi</label>
                <textarea
                  value={form.instruksi}
                  onChange={(e) => setForm({ ...form, instruksi: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Isi instruksi disposisi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu</label>
                <input
                  type="date"
                  value={form.batas_waktu}
                  onChange={(e) => setForm({ ...form, batas_waktu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Opsional: tulis catatan disposisi..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Detail Disposisi</h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm">
                <span className="text-gray-600">Nomor Surat:</span>{' '}
                <span className="font-medium">{detailItem.nomor_surat}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Asal Surat:</span> {detailItem.asal_surat}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Perihal:</span> {detailItem.surat_perihal}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Dari:</span> {detailItem.dari_nama} ({detailItem.dari_role})
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Kepada:</span> {detailItem.kepada_nama} ({detailItem.kepada_role})
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Instruksi:</span> {detailItem.instruksi}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Batas Waktu:</span>{' '}
                {detailItem.batas_waktu ? fmtDate(detailItem.batas_waktu) : '-'}
              </p>

              <p className="text-sm">
                <span className="text-gray-600">Status:</span>{' '}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailItem.status)}`}>
                  {uiStatusLabel(detailItem.status)}
                </span>
              </p>

              {detailItem.catatan && (
                <p className="text-sm">
                  <span className="text-gray-600">Catatan:</span> {detailItem.catatan}
                </p>
              )}
              <p className="text-sm">
                <span className="text-gray-600">Dibuat:</span> {fmtDate(detailItem.created_at)}
              </p>
            </div>

            <div className="p-4 border-t flex flex-col gap-2">
              {detailItem.status === 'Menunggu' && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setStatusAction({ id: detailItem.id, newStatus: 'Disetujui' });
                      setStatusCatatan('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      setStatusAction({ id: detailItem.id, newStatus: 'Ditolak' });
                      setStatusCatatan('');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setStatusAction({ id: detailItem.id, newStatus: 'Selesai' });
                      setStatusCatatan('');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Selesai
                  </button>
                </div>
              )}

              {detailItem.status === 'Disetujui' && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setStatusAction({ id: detailItem.id, newStatus: 'Selesai' });
                      setStatusCatatan('');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Selesai
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Tindakan</h3>
            <p className="text-sm text-gray-600 mb-4">
              {statusAction.newStatus === 'Disetujui' && 'Setujui disposisi ini?'}
              {statusAction.newStatus === 'Ditolak' && 'Tolak disposisi ini?'}
              {statusAction.newStatus === 'Selesai' && 'Selesaikan disposisi ini?'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
              <textarea
                value={statusCatatan}
                onChange={(e) => setStatusCatatan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
                placeholder="Tambahkan catatan..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setStatusAction(null); setStatusCatatan(''); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleStatusChange(statusAction.id, statusAction.newStatus, statusCatatan)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

