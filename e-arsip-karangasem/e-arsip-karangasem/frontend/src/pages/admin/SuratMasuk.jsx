import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Filter, X } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminSuratMasuk() {
  const [list, setList] = useState([]);
  const [klasifikasi, setKlasifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKls, setFilterKls] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nomor_surat: '', asal_surat: '', perihal: '', tanggal_surat: '', tanggal_terima: '', klasifikasi_id: '', keterangan: '' });
  const [file, setFile] = useState(null);
  const limit = 7;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (filterKls) params.append('klasifikasi', filterKls);
      if (filterStatus) params.append('status', filterStatus);
      const { data } = await api.get(`/surat-masuk?${params}`);
      setList(data.data); setTotalData(data.total); setTotalPages(data.totalPages);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, filterKls, filterStatus]);
  useEffect(() => { api.get('/klasifikasi').then(r => setKlasifikasi(r.data)); }, []);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('lampiran', file);
      await api.post('/surat-masuk', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Surat berhasil ditambahkan');
      setModal(false);
      setForm({ nomor_surat: '', asal_surat: '', perihal: '', tanggal_surat: '', tanggal_terima: '', klasifikasi_id: '', keterangan: '' });
      setFile(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin menghapus surat ini?')) return;
    try { await api.delete(`/surat-masuk/${id}`); toast.success('Dihapus'); fetchData(); }
    catch { toast.error('Gagal'); }
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalData);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Surat Masuk</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola data surat masuk yang diterima</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm">
          <Plus size={16} /> Tambah Surat Masuk
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari surat masuk..." value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()} />
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterKls} onChange={e => { setFilterKls(e.target.value); setPage(1); }}>
          <option value="">Semua Klasifikasi</option>
          {klasifikasi.map(k => <option key={k.id} value={k.id}>{k.kode} - {k.nama_klasifikasi}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="belum_disposisi">Belum Disposisi</option>
          <option value="sudah_disposisi">Sudah Disposisi</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
        </select>
        <button onClick={fetchData} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No.', 'Nomor Surat', 'Asal Surat', 'Perihal', 'Tgl Surat', 'Tgl Terima', 'Klasifikasi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={9} className="text-center py-10 text-gray-400">Memuat data...</td></tr>
                : list.length === 0 ? <tr><td colSpan={9} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
                : list.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{startRow + i}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{s.nomor_surat}</td>
                    <td className="px-4 py-3 text-gray-600">{s.asal_surat}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{s.perihal}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.tanggal_surat}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.tanggal_terima}</td>
                    <td className="px-4 py-3">{s.klasifikasi && <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">{s.klasifikasi.kode} - {s.klasifikasi.nama_klasifikasi.slice(0, 8)}</span>}</td>
                    <td className="px-4 py-3"><Badge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={14} /></button>
                        <button className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Pencil size={14} /></button>
                        <button onClick={() => handleHapus(s.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalData > 0 ? `Menampilkan ${startRow} sampai ${endRow} dari ${totalData} data` : 'Tidak ada data'}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">«</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">»</button>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Tambah Surat Masuk" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[['nomor_surat', 'Nomor Surat', 'text'], ['asal_surat', 'Asal Surat', 'text'], ['tanggal_surat', 'Tanggal Surat', 'date'], ['tanggal_terima', 'Tanggal Terima', 'date']].map(([field, label, type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
              <input type={type} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Perihal <span className="text-red-500">*</span></label>
            <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.perihal} onChange={e => setForm({ ...form, perihal: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Klasifikasi</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.klasifikasi_id} onChange={e => setForm({ ...form, klasifikasi_id: e.target.value })}>
              <option value="">-- Pilih Klasifikasi --</option>
              {klasifikasi.map(k => <option key={k.id} value={k.id}>{k.kode} - {k.nama_klasifikasi}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lampiran (PDF, maks 5MB)</label>
            <input type="file" accept=".pdf" className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
            <textarea rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
