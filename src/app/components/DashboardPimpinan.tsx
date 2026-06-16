import { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSSE } from '../../hooks/useSSE';
import { DateTimeDisplay } from './DateTimeDisplay';

export function DashboardPimpinan() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    disposisiPending: 0,
    disposisiSelesai: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token') || '';

  const loadStats = async () => {
    try {
      setLoading(true);
      const fetchWithCheck = async (url: string) => {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        return res.json();
      };
      const [masuk, keluar, disposisi, chart] = await Promise.all([
        fetchWithCheck('/api/surat-masuk'),
        fetchWithCheck('/api/surat-keluar'),
        fetchWithCheck('/api/disposisi'),
        fetchWithCheck('/api/laporan/grafik'),
      ]);
      
      const getResult = (response: any): any[] => {
        if (response?.success && Array.isArray(response.data)) return response.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      };
      const masuks = getResult(masuk);
      const keluars = getResult(keluar);
      const disposisis = getResult(disposisi);
      const chartDataArray = Array.isArray(chart) ? chart : (Array.isArray(chart?.data) ? chart.data : []);
      
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
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useSSE([
    'surat-masuk:created', 'surat-masuk:updated', 'surat-masuk:deleted',
    'surat-keluar:created', 'surat-keluar:updated', 'surat-keluar:deleted',
    'disposisi:created', 'disposisi:updated', 'disposisi:approved',
    'disposisi:rejected', 'disposisi:selesai', 'disposisi:deleted',
  ], loadStats);

  const statsCards = [
    { id: 1, label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-indigo-500', detail: 'dokumen diterima' },
    { id: 2, label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-indigo-500', detail: 'dokumen dikirim' },
    { id: 3, label: 'Menunggu Disposisi', value: stats.disposisiPending, icon: Clock, color: 'bg-orange-500', detail: 'perlu tindakan' },
    { id: 4, label: 'Disposisi Selesai', value: stats.disposisiSelesai, icon: CheckCircle, color: 'bg-purple-500', detail: 'bulan ini' },
  ];

  const defaultChartData: any[] = [];
  const displayChartData = chartData.length > 0 ? chartData : defaultChartData;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => { setError(''); loadStats(); }} className="mt-2 text-sm text-indigo-600 hover:underline">Coba lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Kepala Desa</h2>
            <p className="text-gray-600">Monitoring pengelolaan surat dan arsip Desa Karangasem</p>
          </div>
          <DateTimeDisplay />
        </div>
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
