import { useState, useEffect } from 'react';
import { Mail, Send, FileText, Folder, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSSE } from '../../hooks/useSSE';
import { DateTimeDisplay } from './DateTimeDisplay';
import { api } from '../../services/api';

export function DashboardOperator() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    disposisi: 0,
    klasifikasi: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const [masuk, keluar, disposisi, klasifikasi, chart] = await Promise.all([
        api.get('/surat-masuk'),
        api.get('/surat-keluar'),
        api.get('/disposisi'),
        api.get('/klasifikasi'),
        api.get('/laporan/grafik'),
      ]);
      
      const getData = (response: any): any[] => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      };
      const masuks = getData(masuk);
      const keluars = getData(keluar);
      const disposisis = getData(disposisi);
      const klasifikasis = getData(klasifikasi);
      const chartDataArray = getData(chart);
      
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
    'klasifikasi:created', 'klasifikasi:updated', 'klasifikasi:deleted',
  ], loadStats);

  const statsCardsOperator = [
    { id: 'surat-masuk', label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-blue-500' },
    { id: 'surat-keluar', label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-green-500' },
    { id: 'disposisi', label: 'Disposisi', value: stats.disposisi, icon: FileText, color: 'bg-orange-500' },
    { id: 'klasifikasi', label: 'Klasifikasi', value: stats.klasifikasi, icon: Folder, color: 'bg-purple-500' },
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
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Operator</h2>
            <p className="text-gray-600">Kelola surat dan disposisi harian Desa Karangasem</p>
          </div>
          <DateTimeDisplay />
        </div>
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
