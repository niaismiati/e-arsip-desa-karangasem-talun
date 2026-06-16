import { Plus, Search, Edit, Trash2, Download, FileText, X, Mail } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSSE } from '../../hooks/useSSE';

interface Surat {
  id: number;
  nomor_surat: string;
  asal: string;
  perihal: string;
  tanggal: string;
  tanggalSuratRaw?: string;
  tanggalTerimaRaw?: string;
  klasifikasi_id?: string;
  klasifikasi_kode?: string;
  klasifikasi_nama?: string;
  klasifikasi: string;
  status: string;
  lampiran?: string | null;
}

export function SuratMasuk() {
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nomor: '',
    asal: '',
    perihal: '',
    tanggalSurat: '',
    tanggalTerima: '',
    klasifikasi: ''
  });
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [klasifikasiList, setKlasifikasiList] = useState<{id: string, kode: string, nama: string}[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ klasifikasi: '', asal: '', status: '' });
  const userRole = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').role || ''; } catch { return ''; } })();

  // Fetch klasifikasi
  const fetchKlasifikasi = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/klasifikasi', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setKlasifikasiList(data.data);
      }
    } catch (err) {
      console.error('Gagal load klasifikasi:', err);
    }
  }, []);

  // Fetch surat with filters
  const fetchSurat = useCallback(async (queryParams?: Record<string, string>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        return;
      }
      const params = new URLSearchParams(queryParams || {});
      const url = `/api/surat-masuk${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuratList((data.data as any[]).map((s): Surat => ({
          id: s.id,
          nomor_surat: s.nomor_surat,
          asal: s.asal_surat,
          perihal: s.perihal,
          tanggal: new Date(s.tanggal_terima).toLocaleDateString('id-ID'),
          tanggalSuratRaw: s.tanggal_surat,
          tanggalTerimaRaw: s.tanggal_terima,
          klasifikasi_id: s.klasifikasi_id?.toString?.() || '',
          klasifikasi_kode: s.klasifikasi_kode,
          klasifikasi_nama: s.klasifikasi_nama,
          klasifikasi: s.klasifikasi_kode ? `${s.klasifikasi_kode} - ${s.klasifikasi_nama}` : 'Umum',
          status: s.status || 'Menunggu',
          lampiran: s.lampiran || null
        })));
        setError('');
      } else {
        setError(data.message || 'Gagal load data');
      }
    } catch (err) {
      setError('Gagal load surat masuk: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKlasifikasi();
    fetchSurat({ search: searchTerm, ...filters });
  }, [fetchKlasifikasi, fetchSurat, searchTerm, filters]);

  useSSE([
    'surat-masuk:created', 'surat-masuk:updated', 'surat-masuk:deleted',
  ], () => fetchSurat({ search: searchTerm, ...filters }), 30000);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLampiranFile(e.target.files[0]);
    }
  };

  const handleEdit = (surat: Surat) => {
    setEditingId(surat.id);
    setFormData({
      nomor: surat.nomor_surat,
      asal: surat.asal,
      perihal: surat.perihal,
      tanggalSurat: surat.tanggalSuratRaw ? surat.tanggalSuratRaw.split('T')[0] : '',
      tanggalTerima: surat.tanggalTerimaRaw ? surat.tanggalTerimaRaw.split('T')[0] : '',
      klasifikasi: surat.klasifikasi_id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomor || !formData.asal || !formData.perihal || !formData.tanggalSurat || !formData.tanggalTerima) {
      setError('Semua field * wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Silakan login ulang');
      
      const formDataToSend = new FormData();
      formDataToSend.append('nomor_surat', formData.nomor);
      formDataToSend.append('asal_surat', formData.asal);
      formDataToSend.append('perihal', formData.perihal);
      formDataToSend.append('tanggal_surat', formData.tanggalSurat);
      formDataToSend.append('tanggal_terima', formData.tanggalTerima);
      formDataToSend.append('klasifikasi_id', formData.klasifikasi);
      if (lampiranFile) formDataToSend.append('lampiran', lampiranFile);
      
      const url = editingId ? `/api/surat-masuk/${editingId}` : '/api/surat-masuk';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        await fetchSurat({ search: searchTerm, ...filters });
        setShowModal(false);
        setEditingId(null);
        setFormData({
          nomor: '', asal: '', perihal: '', tanggalSurat: '', tanggalTerima: '', klasifikasi: ''
        });
        setLampiranFile(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus surat ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/surat-masuk/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        await fetchSurat({ search: searchTerm, ...filters });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal hapus: ' + (err as Error).message);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'Belum Disposisi':
        return 'Belum Disposisi';
      case 'Diproses':
        return 'Diproses';
      case 'Selesai':
        return 'Selesai';
      case 'Menunggu':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const filteredSurat = suratList;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Surat Masuk</h2>
          <p className="text-sm text-gray-600">Kelola data surat masuk yang diterima</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Surat Masuk
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari surat masuk..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <select
            value={filters.klasifikasi}
            onChange={(e) => handleFilterChange('klasifikasi', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">Semua Klasifikasi</option>
            {klasifikasiList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.kode} - {item.nama}
              </option>
            ))}
          </select>
          <select
            value={filters.asal}
            onChange={(e) => handleFilterChange('asal', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">Semua Asal Surat</option>
            <option value="Dinas">Dinas</option>
            <option value="Kecamatan">Kecamatan</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">Semua Status</option>
            <option value="Belum Disposisi">Belum Disposisi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
          <button onClick={() => fetchSurat({ search: searchTerm, ...filters })} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[80vh] overflow-y-auto">
        <div className="min-w-[900px]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nomor Surat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Asal Surat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Perihal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Klasifikasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSurat.map((surat, index) => (
                <tr key={surat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{surat.nomor_surat}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{surat.asal}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{surat.perihal}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{surat.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{surat.klasifikasi}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      surat.status === 'Selesai'
                        ? 'bg-green-100 text-green-800'
                        : surat.status === 'Belum Disposisi'
                        ? 'bg-orange-100 text-orange-800'
                        : surat.status === 'Diproses'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabel(surat.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(surat)} className="p-1 text-indigo-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {(userRole === 'admin' || userRole === 'operator') && (
                        <button
                          onClick={() => handleDelete(surat.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {surat.lampiran && (
                        <a href={surat.lampiran} target="_blank" rel="noopener noreferrer" className="p-1 text-green-600 hover:bg-green-50 rounded inline-flex" title="Unduh Lampiran">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {!surat.lampiran && (
                        <span className="p-1 text-gray-300 rounded inline-flex" title="Tidak ada lampiran">
                          <FileText className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Surat */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit' : 'Tambah'} Surat Masuk</h3>
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
                  Nomor Surat
                </label>
                <input
                  type="text"
                  value={formData.nomor}
                  onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asal Surat
                </label>
                <input
                  type="text"
                  value={formData.asal}
                  onChange={(e) => setFormData({...formData, asal: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perihal
                </label>
                <textarea
                  value={formData.perihal}
                  onChange={(e) => setFormData({...formData, perihal: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalSurat}
                    onChange={(e) => setFormData({...formData, tanggalSurat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terima
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalTerima}
                    onChange={(e) => setFormData({...formData, tanggalTerima: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klasifikasi
                </label>
                <select
                  value={formData.klasifikasi}
                  onChange={(e) => setFormData({ ...formData, klasifikasi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lampiran (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Opsional, maksimal 5MB</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
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
    </div>
  );
}