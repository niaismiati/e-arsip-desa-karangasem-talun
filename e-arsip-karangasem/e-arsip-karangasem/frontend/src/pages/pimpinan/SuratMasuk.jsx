// Pimpinan hanya view, tidak bisa tambah/hapus
import { useState, useEffect } from 'react';
import { Eye, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';

export default function PimpinanSuratMasuk() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const { data } = await api.get(`/surat-masuk?${params}`);
      setList(data.data); setTotalData(data.total); setTotalPages(data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalData);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Surat Masuk</h2>
        <p className="text-sm text-gray-500 mt-0.5">Daftar seluruh surat masuk Desa Karangasem</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari surat masuk..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()} />
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Filter size={14} /> Cari
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['No.', 'Nomor Surat', 'Asal Surat', 'Perihal', 'Tgl Terima', 'Klasifikasi', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Memuat...</td></tr>
              : list.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
              : list.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{startRow + i}</td>
                  <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{s.nomor_surat}</td>
                  <td className="px-4 py-3 text-gray-600">{s.asal_surat}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{s.perihal}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.tanggal_terima}</td>
                  <td className="px-4 py-3">{s.klasifikasi && <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">{s.klasifikasi.kode}</span>}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3"><button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={14} /></button></td>
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
    </div>
  );
}
