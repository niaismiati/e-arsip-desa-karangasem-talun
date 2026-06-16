import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Mail, Send, BarChart3, AlertCircle } from 'lucide-react';
import { useSSE } from '../../hooks/useSSE';

interface RekapItem {
  klasifikasi_id: number;
  kode: string;
  nama: string;
  surat_masuk: number;
  surat_keluar: number;
  total: number;
}

interface StatistikBulanan {
  bulan: string;
  masuk: number;
  keluar: number;
}

export function Laporan() {
  const [activeTab, setActiveTab] = useState<'rekap' | 'statistik'>('rekap');
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [statistikData, setStatistikData] = useState<StatistikBulanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [bulan, setBulan] = useState('');
  const [jenis, setJenis] = useState('semua');

  const token = localStorage.getItem('token') || '';

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  useEffect(() => {
    loadRekap();
  }, [tahun, bulan, jenis]);

  useEffect(() => {
    loadStatistik();
  }, [tahun]);

  const refreshLaporan = () => {
    loadRekap();
    loadStatistik();
  };

  useSSE([
    'surat-masuk:created', 'surat-masuk:updated', 'surat-masuk:deleted',
    'surat-keluar:created', 'surat-keluar:updated', 'surat-keluar:deleted',
    'klasifikasi:created', 'klasifikasi:updated', 'klasifikasi:deleted',
  ], refreshLaporan);

  const loadRekap = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('tahun', tahun);
      if (bulan) params.append('bulan', bulan);
      params.append('jenis', jenis);

      const res = await fetch(`/api/laporan/rekap?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setRekapData(data.data.rekap);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistik = async () => {
    try {
      const res = await fetch(`/api/laporan/statistik-bulanan?tahun=${tahun}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStatistikData(data.data);
      }
    } catch {
      console.error('Gagal memuat statistik');
    }
  };

  const exportRekapCsv = () => {
    if (!rekapData.length) return;
    const rows = [
      ['Kode', 'Klasifikasi', 'Surat Masuk', 'Surat Keluar', 'Total'],
      ...rekapData.map((item) => [item.kode, item.nama, String(item.surat_masuk), String(item.surat_keluar), String(item.total)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-rekap-${tahun}${bulan ? `-${bulan}` : ''}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getTotalMasuk = () => rekapData.reduce((sum, item) => sum + item.surat_masuk, 0);
  const getTotalKeluar = () => rekapData.reduce((sum, item) => sum + item.surat_keluar, 0);
  const getGrandTotal = () => rekapData.reduce((sum, item) => sum + item.total, 0);

  const getStatistikMax = () => {
    const maxMasuk = Math.max(...statistikData.map(s => s.masuk), 0);
    const maxKeluar = Math.max(...statistikData.map(s => s.keluar), 0);
    return Math.max(maxMasuk, maxKeluar, 1);
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan</h2>
          <p className="text-sm text-gray-600">Laporan arsip surat desa</p>
        </div>
        <button onClick={exportRekapCsv} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" /> Simpan Laporan
        </button>
      </div>

      {/* Tab Options */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'rekap'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Rekap per Klasifikasi
          </div>
        </button>
        <button
          onClick={() => setActiveTab('statistik')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'statistik'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistik Bulanan
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {activeTab === 'rekap' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bulan</label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Jenis Surat</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="semua">Semua</option>
                  <option value="masuk">Surat Masuk</option>
                  <option value="keluar">Surat Keluar</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rekap Table */}
      {activeTab === 'rekap' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Mail className="w-5 h-5" />
                <span className="text-sm">Surat Masuk</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{getTotalMasuk()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Send className="w-5 h-5" />
                <span className="text-sm">Surat Keluar</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{getTotalKeluar()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{getGrandTotal()}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto max-h-[80vh]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Klasifikasi</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Surat Masuk</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Surat Keluar</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
                ) : rekapData.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                ) : (
                  rekapData.map((item, i) => (
                    <tr key={item.klasifikasi_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.kode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nama}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{item.surat_masuk}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{item.surat_keluar}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{item.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Statistik Bulanan */}
      {activeTab === 'statistik' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grafik Surat Bulanan Tahun {tahun}</h3>
          <div className="space-y-3">
            {statistikData.map((item, i) => {
              const max = getStatistikMax();
              const masukPercent = max > 0 ? (item.masuk / max) * 100 : 0;
              const keluarPercent = max > 0 ? (item.keluar / max) * 100 : 0;

              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-600">{item.bulan}</div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 text-xs text-gray-500 text-right">{item.masuk}</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${masukPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 text-xs text-gray-500 text-right">{item.keluar}</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded"
                          style={{ width: `${keluarPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-gray-600">Surat Masuk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">Surat Keluar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
