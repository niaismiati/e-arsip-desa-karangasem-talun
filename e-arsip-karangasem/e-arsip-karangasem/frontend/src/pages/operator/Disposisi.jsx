import { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColor = {
  menunggu: 'bg-amber-100 text-amber-700',
  diterima: 'bg-blue-100 text-blue-700',
  selesai: 'bg-green-100 text-green-700',
};

export default function OperatorDisposisi() {
  const [list, setList] = useState([]);
  const [suratList, setSuratList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ surat_masuk_id: '', kepada_user_id: '', isi_disposisi: '', catatan: '' });
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/disposisi?page=${page}&limit=${limit}`);
      setList(data.data); setTotalData(data.total); setTotalPages(data.totalPages);
    } catch { toast.error('Gagal memuat'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  useEffect(() => {
    Promise.all([
      api.get('/surat-masuk?limit=100'),
      api.get('/pengguna'),
    ]).then(([sm, u]) => {
      setSuratList(sm.data.data || []);
      setUserList(u.data.filter(u => u.role === 'pimpinan' || u.role === 'admin'));
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!form.surat_masuk_id || !form.kepada_user_id || !form.isi_disposisi)
      return toast.error('Harap lengkapi semua field wajib');
    try {
      await api.post('/disposisi', form);
      toast.success('Disposisi berhasil dibuat');
      setModal(false);
      setForm({ surat_masuk_id: '', kepada_user_id: '', isi_disposisi: '', catatan: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalData);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Disposisi Surat</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola disposisi surat masuk</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm">
          <Plus size={16} /> Buat Disposisi
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['No.', 'Surat Masuk', 'Dari', 'Kepada', 'Isi Disposisi', 'Tgl Disposisi', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Memuat...</td></tr>
              : list.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Belum ada disposisi</td></tr>
              : list.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{startRow + i}</td>
                  <td className="px-4 py-3 max-w-[150px]">
                    <p className="text-sm font-medium text-gray-700 truncate">{d.surat?.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{d.surat?.nomor_surat}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{d.dari?.nama}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{d.kepada?.nama}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate text-gray-600">{d.isi_disposisi}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {d.tanggal_disposisi ? new Date(d.tanggal_disposisi).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[d.status]}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalData > 0 ? `Menampilkan ${startRow} sampai ${endRow} dari ${totalData} data` : 'Tidak ada data'}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">«</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">»</button>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Buat Disposisi Baru" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Surat Masuk <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.surat_masuk_id} onChange={e => setForm({ ...form, surat_masuk_id: e.target.value })}>
              <option value="">-- Pilih Surat --</option>
              {suratList.map(s => <option key={s.id} value={s.id}>{s.nomor_surat} — {s.perihal}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ditujukan Kepada <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={form.kepada_user_id} onChange={e => setForm({ ...form, kepada_user_id: e.target.value })}>
              <option value="">-- Pilih Penerima --</option>
              {userList.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Isi Disposisi <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tuliskan instruksi/petunjuk disposisi..." value={form.isi_disposisi} onChange={e => setForm({ ...form, isi_disposisi: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
            <textarea rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Catatan tambahan (opsional)..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">Kirim Disposisi</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
