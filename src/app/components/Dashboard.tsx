import { useState, useEffect } from 'react';
import { Mail, Send, Clock, Archive } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSSE } from '../../hooks/useSSE';

export function Dashboard() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    disposisi: 0,
    totalArsip: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLetters, setRecentLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, recentRes] = await Promise.all([
        fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/dashboard/chart', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/dashboard/recent-letters', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);

      if (statsRes.success) {
        setStats({
          suratMasuk: statsRes.data.surat_masuk,
          suratKeluar: statsRes.data.surat_keluar,
          disposisi: statsRes.data.disposisi_baru,
          totalArsip: statsRes.data.total_arsip,
        });
      }

      if (chartRes.success) setChartData(chartRes.data);

      if (recentRes.success) setRecentLetters(recentRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useSSE([
    'surat-masuk:created', 'surat-masuk:updated', 'surat-masuk:deleted',
    'surat-keluar:created', 'surat-keluar:updated', 'surat-keluar:deleted',
    'disposisi:created', 'disposisi:updated', 'disposisi:approved',
    'disposisi:rejected', 'disposisi:selesai', 'disposisi:deleted',
  ], loadData);

  const statsCards = [
    { id: 1, label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-indigo-500' },
    { id: 2, label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-green-500' },
    { id: 3, label: 'Disposisi Baru', value: stats.disposisi, icon: Clock, color: 'bg-orange-500' },
    { id: 4, label: 'Total Arsip', value: stats.totalArsip, icon: Archive, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grafik Surat 6 Bulan Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="masuk" fill="#4F46E5" name="Surat Masuk" />
              <Bar dataKey="keluar" fill="#2E7D32" name="Surat Keluar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Surat</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalArsip}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Menunggu Disposisi</span>
              <span className="text-2xl font-bold text-orange-500">{stats.disposisi}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Letters Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Surat Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Perihal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Asal/Tujuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : recentLetters.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada data surat</td></tr>
              ) : (
                recentLetters.map((letter) => (
                  <tr key={`${letter.jenis}-${letter.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{letter.perihal}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{letter.asal_tujuan}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(letter.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        letter.jenis === 'Masuk'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {letter.jenis === 'Masuk' ? <Mail className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                        {letter.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        letter.status === 'Selesai'
                          ? 'bg-green-100 text-green-800'
                          : letter.status === 'Menunggu'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {letter.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
