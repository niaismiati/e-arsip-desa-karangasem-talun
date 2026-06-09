import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, CheckSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

const grafikStatic = [
  { bulan: 'Jan', masuk: 20, keluar: 12 }, { bulan: 'Feb', masuk: 24, keluar: 14 },
  { bulan: 'Mar', masuk: 30, keluar: 20 }, { bulan: 'Apr', masuk: 15, keluar: 9 },
  { bulan: 'Mei', masuk: 27, keluar: 18 }, { bulan: 'Jun', masuk: 28, keluar: 17 },
];

export default function OperatorDashboard() {
  const [stats, setStats] = useState({ total: 28, sudah: 12, belum: 10, selesai: 6 });
  const [grafik, setGrafik] = useState([]);
  const [terbaru, setTerbaru] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/surat-masuk/stats'),
      api.get('/laporan/grafik'),
      api.get('/surat-masuk/terbaru'),
    ]).then(([s, g, t]) => {
      setStats({ total: s.data.total, sudah: s.data.sudah, belum: s.data.belum, selesai: s.data.selesai });
      setGrafik(g.data);
      setTerbaru(t.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan arsip surat desa hari ini</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Surat Masuk" value={stats.total} subtitle="Lihat semua" icon={Mail} color="blue" />
        <StatCard title="Sudah Disposisi" value={stats.sudah} subtitle="Lihat semua" icon={CheckCircle} color="green" />
        <StatCard title="Belum Disposisi" value={stats.belum} subtitle="Lihat semua" icon={Clock} color="amber" />
        <StatCard title="Selesai Ditindaklanjuti" value={stats.selesai} subtitle="Lihat semua" icon={CheckSquare} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Grafik Surat (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafik.length > 0 ? grafik : grafikStatic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="masuk" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Surat Masuk" />
              <Line type="monotone" dataKey="keluar" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Surat Keluar" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Surat Masuk Terbaru</h3>
          <div className="space-y-3">
            {(terbaru.length > 0 ? terbaru : [
              { perihal: 'Undangan Musrenbang Desa', asal_surat: 'Dinas PMD Kabupaten', tanggal_terima: '12/06/2026', status: 'sudah_disposisi' },
              { perihal: 'Pemberitahuan Kegiatan Lomba', asal_surat: 'Kecamatan Ngraho', tanggal_terima: '10/06/2026', status: 'belum_disposisi' },
              { perihal: 'Laporan Keuangan Desa', asal_surat: 'DPMD Kab. Bojonegoro', tanggal_terima: '09/06/2026', status: 'sudah_disposisi' },
              { perihal: 'Data Penduduk Semester I', asal_surat: 'Dinas Kependudukan', tanggal_terima: '08/06/2026', status: 'diproses' },
            ]).map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{s.perihal}</p>
                  <p className="text-xs text-gray-400 truncate">{s.asal_surat}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 mb-1">{s.tanggal_terima}</p>
                  <Badge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
