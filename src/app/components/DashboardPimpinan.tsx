import { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardPimpinan() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    disposisiPending: 0,
    disposisiSelesai: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadStats();
  }, []);

  // Polling: refresh stats every 10 seconds to reflect cross-role changes
  useEffect(() => {
    const iv = setInterval(() => {
      loadStats();
    }, 10000);
    return () => clearInterval(iv);
  }, [token]);

  // Polling already covers auto-refresh every 10s

  const loadStats = async () => {
    try {
      setLoading(true);
      const [masuk, keluar, disposisi, chart] = await Promise.all([
        fetch('/api/surat-masuk', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/surat-keluar', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/disposisi', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/laporan/grafik', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      
      const getResult = (response: any) => (response?.success ? response.data : response?.data || response || []);
      const masuks = getResult(masuk);
      const keluars = getResult(keluar);
      const disposisis = getResult(disposisi);
      const chartDataArray = Array.isArray(chart) ? chart : (chart?.data || []);
      
      setStats({
        suratMasuk: masuks.length,
        suratKeluar: keluars.length,
        disposisiPending: disposisis.filter((d: any) => d.status === 'Menunggu').length,
        disposisiSelesai: disposisis.filter((d: any) => d.status === 'Selesai').length
      });

      setChartData(chartDataArray.map((item: any) => ({
        bulan: item.bulan,
        masuk: item.masuk,
        keluar: item.keluar
      })));
    } catch (err) {
      console.error('Error loading pimpinan stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { id: 1, label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-indigo-500', detail: 'dokumen diterima' },
    { id: 2, label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-indigo-500', detail: 'dokumen dikirim' },
    { id: 3, label: 'Menunggu Disposisi', value: stats.disposisiPending, icon: Clock, color: 'bg-orange-500', detail: 'perlu tindakan' },
    { id: 4, label: 'Disposisi Selesai', value: stats.disposisiSelesai, icon: CheckCircle, color: 'bg-purple-500', detail: 'bulan ini' },
  ];

  const defaultChartData: any[] = [];
  const displayChartData = chartData.length > 0 ? chartData : defaultChartData;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Kepala Desa</h2>
        <p className="text-gray-600">Monitoring pengelolaan surat dan arsip Desa Karangasem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Surat 6 Bulan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="masuk" stroke="#4F46E5" strokeWidth={2} />
              <Line type="monotone" dataKey="keluar" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />Total Surat
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.suratMasuk + stats.suratKeluar}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Disposisi Aktif
              </span>
              <span className="text-2xl font-bold text-orange-500">{stats.disposisiPending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />Selesai
              </span>
              <span className="text-2xl font-bold text-green-500">{stats.disposisiSelesai}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
