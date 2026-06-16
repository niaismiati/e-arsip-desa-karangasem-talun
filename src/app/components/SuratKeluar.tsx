  import { useState, useEffect } from 'react';
  import { Search, Plus, Pencil, Trash2, Eye, X, Download, AlertCircle, Upload, RefreshCw } from 'lucide-react';
  import { useSSE } from '../../hooks/useSSE';

  interface SuratKeluarItem {
    id: number;
    nomor_surat: string;
    tujuan_surat: string;
    perihal: string;
    tanggal_surat: string;
    klasifikasi_id?: number;
    klasifikasi_kode?: string;
    klasifikasi_nama?: string;
    lampiran: string | null;
    created_at?: string;
  }

  export function SuratKeluar() {
    const [items, setItems] = useState<SuratKeluarItem[]>([]);
    const [klasifikasiList, setKlasifikasiList] = useState<{ id: number; kode: string; nama: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterKlasifikasi, setFilterKlasifikasi] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [detailItem, setDetailItem] = useState<SuratKeluarItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<SuratKeluarItem | null>(null);

    const [form, setForm] = useState({
      nomor_surat: '',
      tujuan_surat: '',
      perihal: '',
      tanggal_surat: '',
      klasifikasi_id: '',
    });
    const [lampiranFile, setLampiranFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const token = localStorage.getItem('token') || '';

    const loadData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filterKlasifikasi) queryParams.append('klasifikasi', filterKlasifikasi);
        const qs = queryParams.toString();
        const res = await fetch(`/api/surat-keluar${qs ? `?${qs}` : ''}`, {
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

    const loadKlasifikasi = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) return;
        const res = await fetch('/api/klasifikasi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success) setKlasifikasiList(data.data);
      } catch {
        // ignore kelasifikasi loading errors for now
      }
    };

    useEffect(() => {
      loadKlasifikasi();
    }, []);

    useEffect(() => {
      loadData();
    }, [search, filterKlasifikasi]);

    useSSE([
      'surat-keluar:created', 'surat-keluar:updated', 'surat-keluar:deleted',
    ], loadData, 30000);

    // Auto-save effect: debounce form changes and auto-save every 2 seconds
    // Gunakan JSON.stringify untuk membandingkan form agar tidak infinite loop
    const formKey = JSON.stringify({ nomor_surat: form.nomor_surat, tujuan_surat: form.tujuan_surat, perihal: form.perihal, tanggal_surat: form.tanggal_surat, klasifikasi_id: form.klasifikasi_id });
    useEffect(() => {
      if (!editingId || !showForm) return; // Only auto-save when editing
      
      // Clear previous timer
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      // Set new timer for auto-save
      const timer = setTimeout(async () => {
        if (!editingId) return;
        
        setAutoSaveStatus('saving');
        try {
          const body = new FormData();
          body.append('nomor_surat', form.nomor_surat);
          body.append('tujuan_surat', form.tujuan_surat);
          body.append('perihal', form.perihal);
          body.append('tanggal_surat', form.tanggal_surat);
          if (form.klasifikasi_id) body.append('klasifikasi_id', form.klasifikasi_id);
          if (lampiranFile) body.append('lampiran', lampiranFile);

          const res = await fetch(`/api/surat-keluar/${editingId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body,
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            throw new Error(errData?.message || `HTTP ${res.status}`);
          }
          const data = await res.json();
          
          if (data.success) {
            setAutoSaveStatus('saved');
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } else {
            setAutoSaveStatus('idle');
          }
        } catch (err) {
          console.error('Auto-save error:', err);
          setAutoSaveStatus('idle');
        }
      }, 2000);
      
      setAutoSaveTimer(timer);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formKey, lampiranFile, editingId, showForm, token]);

    const generateNomor = async () => {
      setGenerating(true);
      try {
        const res = await fetch('/api/surat-keluar/generate-nomor', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setForm((prev) => ({ ...prev, nomor_surat: data.data.nomor }));
        } else {
          setError(data.message || 'Gagal generate nomor');
        }
      } catch {
        setError('Gagal generate nomor');
      } finally {
        setGenerating(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const body = new FormData();
      body.append('nomor_surat', form.nomor_surat);
      body.append('tujuan_surat', form.tujuan_surat);
      body.append('perihal', form.perihal);
      body.append('tanggal_surat', form.tanggal_surat);
      if (form.klasifikasi_id) body.append('klasifikasi_id', form.klasifikasi_id);
      if (!form.nomor_surat && !editingId) {
        body.append('generate_otomatis', 'true');
      }
      if (lampiranFile) body.append('lampiran', lampiranFile);

      try {
        const url = editingId ? `/api/surat-keluar/${editingId}` : '/api/surat-keluar';
        const method = editingId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setShowForm(false);
          setEditingId(null);
          setForm({ nomor_surat: '', tujuan_surat: '', perihal: '', tanggal_surat: '', klasifikasi_id: '' });
          setLampiranFile(null);
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
        const res = await fetch(`/api/surat-keluar/${deleteItem.id}`, {
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
      setForm({ nomor_surat: '', tujuan_surat: '', perihal: '', tanggal_surat: '', klasifikasi_id: '' });
      setLampiranFile(null);
      setShowForm(true);
    };

    const openEdit = (item: SuratKeluarItem) => {
      setEditingId(item.id);
      setForm({
        nomor_surat: item.nomor_surat,
        tujuan_surat: item.tujuan_surat,
        perihal: item.perihal,
        tanggal_surat: item.tanggal_surat,
        klasifikasi_id: item.klasifikasi_id ? item.klasifikasi_id.toString() : '',
      });
      setLampiranFile(null);
      setShowForm(true);
    };

    const fmtDate = (s: string) => {
      if (!s) return '-';
      const d = new Date(s);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
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
            <h2 className="text-2xl font-bold text-gray-900">Surat Keluar</h2>
            <p className="text-sm text-gray-600">Kelola surat keluar desa</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="w-5 h-5" /> Tambah
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor, tujuan, perihal..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select
              value={filterKlasifikasi}
              onChange={(e) => setFilterKlasifikasi(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Semua Klasifikasi</option>
              {klasifikasiList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode} - {item.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[80vh] overflow-y-auto">
          <table className="w-full" style={{ minWidth: '900px' }}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor Surat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tujuan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Perihal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Klasifikasi</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nomor_surat}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.tujuan_surat}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.perihal}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(item.tanggal_surat)}</td>
                    <td className="px-4 py-3">
                      {item.klasifikasi_kode ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{item.klasifikasi_kode}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setDetailItem(item)} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Detail"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteItem(item)} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b shrink-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit' : 'Tambah'} Surat Keluar</h3>
                  {editingId && autoSaveStatus === 'saving' && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded animate-pulse">Menyimpan...</span>
                  )}
                  {editingId && autoSaveStatus === 'saved' && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">✓ Tersimpan</span>
                  )}
                </div>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Surat</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.nomor_surat}
                        onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
                        placeholder={!editingId ? 'Kosongkan untuk generate otomatis' : ''}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      {!editingId && (
                        <button type="button" onClick={generateNomor} disabled={generating} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1">
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                          Generate
                        </button>
                      )}
                    </div>
                    {!editingId && (
                      <p className="text-xs text-gray-500">Biarkan kosong untuk nomor otomatis.</p>
                    )}
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Surat</label>
                  <input type="text" value={form.tujuan_surat} onChange={(e) => setForm({ ...form, tujuan_surat: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perihal</label>
                  <textarea value={form.perihal} onChange={(e) => setForm({ ...form, perihal: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Surat</label>
                  <input type="date" value={form.tanggal_surat} onChange={(e) => setForm({ ...form, tanggal_surat: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klasifikasi</label>
                  <select
                    value={form.klasifikasi_id}
                    onChange={(e) => setForm({ ...form, klasifikasi_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Pilih klasifikasi</option>
                    {klasifikasiList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kode} - {item.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="lampiran-keluar"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setLampiranFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="lampiran-keluar" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {lampiranFile ? lampiranFile.name : 'Pilih File'}
                    </label>
                    {lampiranFile && (
                      <button type="button" onClick={() => setLampiranFile(null)} className="text-sm text-red-600 hover:underline">Hapus</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: PDF/JPG/PNG, Maks 5MB</p>
                </div>
              </div>
              <div className="border-t p-4 bg-white flex justify-end gap-3 shrink-0">
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
                <h3 className="text-xl font-semibold text-gray-900">Detail Surat Keluar</h3>
                <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-sm"><span className="text-gray-600">Nomor:</span> <span className="font-medium">{detailItem.nomor_surat}</span></p>
                <p className="text-sm"><span className="text-gray-600">Tujuan:</span> {detailItem.tujuan_surat}</p>
                <p className="text-sm"><span className="text-gray-600">Perihal:</span> {detailItem.perihal}</p>
                <p className="text-sm"><span className="text-gray-600">Tanggal:</span> {fmtDate(detailItem.tanggal_surat)}</p>
                <p className="text-sm"><span className="text-gray-600">Klasifikasi:</span> {detailItem.klasifikasi_kode || '-'} {detailItem.klasifikasi_nama || ''}</p>
                {detailItem.lampiran && (
                  <a href={detailItem.lampiran} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                    <Download className="w-4 h-4" />Unduh Lampiran
                  </a>
                )}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Surat Keluar?</h3>
              <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus surat <strong>{deleteItem.nomor_surat}</strong>?</p>
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
