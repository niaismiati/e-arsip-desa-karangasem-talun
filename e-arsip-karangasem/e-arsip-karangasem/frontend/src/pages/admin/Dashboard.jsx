import { useState, useEffect } from 'react';
import { Mail, Send, Archive, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalMasuk: 32, totalKeluar: 28, totalArsip: 60, disposisiBaru: 5 });
  const [grafik, setGrafik] = useState([]);
  const [suratTerbaru, setSuratTerbaru] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, grafikRes, terbaruRes] = await Promise.all([
          api.get('/laporan/dashboard'),
          api.get('/laporan/grafik'),
          api.get('/surat-masuk/terbaru'),
        ]);
        setStats({
          totalMasuk: statsRes.data.totalMasuk,
          totalKeluar: statsRes.data.totalKeluar,
          totalArsip: statsRes.data.totalMasuk + statsRes.data.totalKeluar,
          disposisiBaru: statsRes.data.menungguDisposisi,
        });
        setGrafik(grafikRes.data);
        setSuratTerbaru(terbaruRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const staticGrafik = [
    { bulan: 'Jan', masuk: 20, keluar: 13 }, { bulan: 'Feb', masuk: 25, keluar: 15 },
    { bulan: 'Mar', masuk: 30, keluar: 21 }, { bulan: 'Apr', masuk: 15, keluar: 9 },
    { bulan: 'Mei', masuk: 28, keluar: 19 }, { bulan: 'Jun', masuk: 32, keluar: 26 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* StatCards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Surat Masuk" value={stats.totalMasuk} subtitle="Lihat detail" icon={Mail} color="blue" />
        <StatCard title="Surat Keluar" value={stats.totalKeluar} subtitle="Lihat detail" icon={Send} color="green" />
        <StatCard title="Total Arsip" value={stats.totalArsip} subtitle="Lihat detail" icon={Archive} color="amber" />
        <StatCard title="Disposisi Baru" value={stats.disposisiBaru} subtitle="Lihat detail" icon={ClipboardList} color="purple" />
      </div>

      {/* Grafik + Surat Terbaru */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Grafik Surat (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafik.length > 0 ? grafik : staticGrafik}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="masuk" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Surat Masuk" />
              <Line type="monotone" dataKey="keluar" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Surat Keluar" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Surat Terbaru */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Surat Terbaru</h3>
          <div className="space-y-3">
            {(suratTerbaru.length > 0 ? suratTerbaru : [
              { perihal: 'Undangan Musrenbang Desa', asal_surat: 'Dinas PMD Kabupaten', tanggal_terima: '12/06/2026', status: 'sudah_disposisi' },
              { perihal: 'Surat Pengantar Nikah (N1)', asal_surat: 'Warga: Budi Santoso', tanggal_terima: '11/06/2026', status: 'belum_disposisi' },
              { perihal: 'Pemberitahuan Kegiatan Lomba', asal_surat: 'Kecamatan Ngraho', tanggal_terima: '10/06/2026', status: 'sudah_disposisi' },
              { perihal: 'Surat Keterangan Domisili', asal_surat: 'Warga: Siti Aminah', tanggal_terima: '09/06/2026', status: 'diproses' },
              { perihal: 'Nota Dinas', asal_surat: 'Sekretariat Daerah', tanggal_terima: '08/06/2026', status: 'selesai' },
            ]).map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-2 pb-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={13} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{s.asal_surat}</p>
                  </div>
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
