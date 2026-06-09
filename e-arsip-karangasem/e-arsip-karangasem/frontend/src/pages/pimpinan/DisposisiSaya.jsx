import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Eye } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';

export default function PimpinanDisposisi() {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diterima: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get(`/disposisi?page=${page}&limit=${limit}`),
        api.get('/disposisi/stats'),
      ]);
      setList(listRes.data.data); setTotalData(listRes.data.total); setTotalPages(listRes.data.totalPages);
      setStats(statsRes.data);
    } catch { toast.error('Gagal memuat'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleTindak = async (status) => {
    try {
      await api.put(`/disposisi/${selected.id}/status`, { status, catatan });
      toast.success(status === 'selesai' ? 'Disposisi diselesaikan' : 'Disposisi diterima');
      setSelected(null); setCatatan('');
      fetchData();
    } catch { toast.error('Gagal memperbarui status'); }
  };

  const statusColor = { menunggu: 'bg-amber-100 text-amber-700', diterima: 'bg-blue-100 text-blue-700', selesai: 'bg-green-100 text-green-700' };
  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalData);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Disposisi Saya</h2>
        <p className="text-sm text-gray-500 mt-0.5">Disposisi surat yang ditujukan kepada Anda</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Disposisi" value={stats.total} icon={Eye} color="blue" />
        <StatCard title="Menunggu" value={stats.menunggu} subtitle="Perlu tindakan" subtitleColor="amber" icon={Clock} color="amber" />
        <StatCard title="Diterima" value={stats.diterima} icon={CheckCircle} color="blue" />
        <StatCard title="Selesai" value={stats.selesai} subtitle="Sudah ditindak" subtitleColor="green" icon={CheckCircle} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['No.', 'Surat Masuk', 'Dari', 'Isi Disposisi', 'Tgl Disposisi', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Memuat...</td></tr>
              : list.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada disposisi</td></tr>
              : list.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{startRow + i}</td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="text-sm font-medium text-gray-700 truncate">{d.surat?.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{d.surat?.asal_surat}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{d.dari?.nama}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-gray-600">{d.isi_disposisi}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {d.tanggal_disposisi ? new Date(d.tanggal_disposisi).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[d.status]}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(d); setCatatan(''); }} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors">
                      <Eye size={13} /> Tindak
                    </button>
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
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">»</button>
          </div>
        </div>
      </div>

      {/* Modal Tindak Lanjut */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Tindak Lanjut Disposisi" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Surat</p>
              <p className="text-sm font-semibold text-gray-800">{selected.surat?.perihal}</p>
              <p className="text-xs text-gray-500">{selected.surat?.nomor_surat} · {selected.surat?.asal_surat}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Isi Disposisi</p>
              <p className="text-sm text-gray-700">{selected.isi_disposisi}</p>
              {selected.catatan && <p className="text-xs text-gray-500 mt-1 italic">Catatan: {selected.catatan}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Balasan</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tulis catatan tindak lanjut Anda..." value={catatan} onChange={e => setCatatan(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setSelected(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
              {selected.status === 'menunggu' && (
                <button onClick={() => handleTindak('diterima')} className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600">Terima</button>
              )}
              <button onClick={() => handleTindak('selesai')} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700">Selesai</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
