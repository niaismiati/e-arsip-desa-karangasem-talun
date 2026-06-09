import { useState, useEffect } from 'react';
import { Mail, Send, FileText, Folder, BarChart3, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardOperator() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    disposisi: 0,
    klasifikasi: 0
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
      const [masuk, keluar, disposisi, klasifikasi, chart] = await Promise.all([
        fetch('/api/surat-masuk', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/surat-keluar', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/disposisi', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/klasifikasi', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/laporan/grafik', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      
      const getResult = (response: any) => (response?.success ? response.data : response?.data || response || []);
      const masuks = getResult(masuk);
      const keluars = getResult(keluar);
      const disposisis = getResult(disposisi);
      const klasifikasis = getResult(klasifikasi);
      const chartDataArray = Array.isArray(chart) ? chart : (chart?.data || []);
      
      setStats({
        suratMasuk: masuks.length,
        suratKeluar: keluars.length,
        disposisi: disposisis.filter((d: any) => d.status === 'Menunggu').length,
        klasifikasi: klasifikasis.length
      });

      setChartData(chartDataArray.map((item: any) => ({
        bulan: item.bulan,
        masuk: item.masuk,
        keluar: item.keluar
      })));
    } catch (err) {
      console.error('Error loading operator stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCardsOperator = [
    { id: 'surat-masuk', label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-blue-500' },
    { id: 'surat-keluar', label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-green-500' },
    { id: 'disposisi', label: 'Disposisi', value: stats.disposisi, icon: FileText, color: 'bg-orange-500' },
    { id: 'klasifikasi', label: 'Klasifikasi', value: stats.klasifikasi, icon: Folder, color: 'bg-purple-500' },
  ];

  const defaultChartData: any[] = [];
  const displayChartData = chartData.length > 0 ? chartData : defaultChartData;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Operator</h2>
        <p className="text-gray-600">Kelola surat dan disposisi harian Desa Karangasem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCardsOperator.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{loading ? '-' : card.value}</p>
                <p className="text-sm text-gray-600">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Ringkasan Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="masuk" fill="#3B82F6" />
              <Bar dataKey="keluar" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Target Hari Ini</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Proses Surat</p>
                <p className="text-sm font-bold text-indigo-600">{stats.suratMasuk}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${Math.min(100, (stats.suratMasuk / 50) * 100)}%`}}></div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Disposisi Menunggu</p>
                <p className="text-sm font-bold text-orange-600">{stats.disposisi}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min(100, (stats.disposisi / 20) * 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
