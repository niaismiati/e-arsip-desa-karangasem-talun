import { useState, useEffect } from 'react';
import { Mail, Send, Folder, Users, Shield, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSSE } from '../../hooks/useSSE';
import { DateTimeDisplay } from './DateTimeDisplay';
import { api } from '../../services/api';

export function DashboardAdmin() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    users: 0,
    klasifikasi: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const [masuk, keluar, users, klasifikasi, chart] = await Promise.all([
        api.get('/surat-masuk'),
        api.get('/surat-keluar'),
        api.get('/users'),
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
      const penggunas = getData(users);
      const klasifikasis = getData(klasifikasi);
      const chartDataArray = getData(chart);

      setStats({
        suratMasuk: masuks.length,
        suratKeluar: keluars.length,
        users: penggunas.length,
        klasifikasi: klasifikasis.length
      });

      setChartData(chartDataArray.map((item: any) => ({
        bulan: item.bulan,
        totalSurat: item.masuk + item.keluar
      })));
    } catch (err) {
      console.error('Error loading admin stats:', err);
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
    'users:created', 'users:updated', 'users:deleted', 'users:toggle',
  ], loadStats);

  const statsCards = [
    { id: 'surat-masuk', label: 'Surat Masuk', value: stats.suratMasuk, icon: Mail, color: 'bg-blue-500' },
    { id: 'surat-keluar', label: 'Surat Keluar', value: stats.suratKeluar, icon: Send, color: 'bg-green-500' },
    { id: 'klasifikasi', label: 'Klasifikasi', value: stats.klasifikasi, icon: Folder, color: 'bg-purple-500' },
    { id: 'pengguna', label: 'Pengguna', value: stats.users, icon: Users, color: 'bg-teal-500' },
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
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
            <p className="text-gray-600">Kelola sistem e-arsip Desa Karangasem</p>
          </div>
          <DateTimeDisplay />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
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
          <h3 className="text-lg font-semibold mb-4">Statistik Sistem</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSurat" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Info Sistem</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium">Status Sistem</p>
                <p className="text-xs text-green-600">Semua layanan aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Database className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-xs text-blue-600">{stats.suratMasuk + stats.suratKeluar} dokumen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
