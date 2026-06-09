import { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';

const grafikStatic = [
  { bulan: 'Jan', masuk: 20, keluar: 12 }, { bulan: 'Feb', masuk: 25, keluar: 15 },
  { bulan: 'Mar', masuk: 35, keluar: 21 }, { bulan: 'Apr', masuk: 18, keluar: 10 },
  { bulan: 'Mei', masuk: 28, keluar: 18 }, { bulan: 'Jun', masuk: 40, keluar: 30 },
];

const klasifikasiData = [
  { kode: '000', nama: 'Umum', jumlah: 12, bg: 'bg-blue-50', text: 'text-blue-600' },
  { kode: '100', nama: 'Pemerintahan', jumlah: 18, bg: 'bg-green-50', text: 'text-green-600' },
  { kode: '400', nama: 'Kesejahteraan', jumlah: 15, bg: 'bg-teal-50', text: 'text-teal-600' },
  { kode: '800', nama: 'Kepegawaian', jumlah: 7, bg: 'bg-purple-50', text: 'text-purple-600' },
  { kode: '900', nama: 'Keuangan', jumlah: 11, bg: 'bg-amber-50', text: 'text-amber-600' },
];

const aktivitas = [
  { ikon: '📄', bg: 'bg-blue-100', pesan: 'Operator Desa mengajukan surat Laporan Keuangan Desa', waktu: '5 menit yang lalu' },
  { ikon: '✅', bg: 'bg-green-100', pesan: 'Anda menyetujui disposisi surat Undangan Musrenbang Desa', waktu: '1 jam yang lalu' },
  { ikon: '📄', bg: 'bg-blue-100', pesan: 'Operator Desa menambahkan surat baru Pemberitahuan Kegiatan', waktu: '2 jam yang lalu' },
  { ikon: '✏️', bg: 'bg-amber-100', pesan: 'Anda memberikan disposisi surat Permohonan Bantuan Alat', waktu: '3 jam yang lalu' },
];

export default function PimpinanDashboard() {
  const [stats, setStats] = useState({ masuk: 28, keluar: 17, menunggu: 8, selesai: 24 });
  const [grafik, setGrafik] = useState([]);
  const [klasifikasi, setKlasifikasi] = useState([]);
  const now = new Date();

  useEffect(() => {
    Promise.all([
      api.get('/laporan/dashboard'),
      api.get('/laporan/grafik'),
      api.get('/laporan/per-klasifikasi'),
    ]).then(([s, g, k]) => {
      setStats({ masuk: s.data.totalMasuk, keluar: s.data.totalKeluar, menunggu: s.data.menungguDisposisi, selesai: s.data.disposisiSelesai });
      setGrafik(g.data);
      setKlasifikasi(k.data);
    }).catch(console.error);
  }, []);

  const kData = klasifikasi.length > 0
    ? klasifikasi.map((k, i) => ({ ...k, jumlah: k.total, bg: klasifikasiData[i]?.bg || 'bg-gray-50', text: klasifikasiData[i]?.text || 'text-gray-600', kode: k.kode, nama: k.nama }))
    : klasifikasiData;

  return (
    <div className="p-6 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Selamat datang, Kepala Desa</h2>
          <p className="text-gray-500 text-sm mt-1">Berikut ringkasan arsip surat desa hari ini.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-right">
          <p className="text-sm font-medium text-gray-700">{format(now, 'EEEE, d MMMM yyyy', { locale: id })}</p>
          <p className="text-xs text-gray-400">{format(now, 'HH:mm')} WIB</p>
        </div>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Surat Masuk" value={stats.masuk} subtitle="12 belum dibaca" subtitleColor="blue" icon={Mail} color="blue" />
        <StatCard title="Surat Keluar" value={stats.keluar} subtitle="3 hari ini" subtitleColor="green" icon={Send} color="green" />
        <StatCard title="Menunggu Disposisi" value={stats.menunggu} subtitle="Perlu tindakan" subtitleColor="amber" icon={Clock} color="amber" />
        <StatCard title="Disposisi Selesai" value={stats.selesai} subtitle="Bulan ini" subtitleColor="blue" icon={CheckCircle} color="purple" />
      </div>

      {/* Grafik + Disposisi Menunggu */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Grafik Surat (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafik.length > 0 ? grafik : grafikStatic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="masuk" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Surat Masuk" />
              <Line type="monotone" dataKey="keluar" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Surat Keluar" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Disposisi Menunggu Persetujuan</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
          </div>
          <div className="space-y-2.5">
            {[
              { perihal: 'Undangan Musrenbang Desa', dari: 'Dinas PMD Kab. Bojonegoro', tgl: '10/06/2026', tipe: 'masuk' },
              { perihal: 'Pemberitahuan Kegiatan Lomba', dari: 'Kecamatan Ngraho', tgl: '09/06/2026', tipe: 'masuk' },
              { perihal: 'Permohonan Bantuan Alat Pertanian', dari: 'Kelompok Tani Makmur', tgl: '08/06/2026', tipe: 'masuk' },
              { perihal: 'Laporan Realisasi APBDes Tahap I', dari: 'Sekretaris Desa', tgl: '07/06/2026', tipe: 'keluar' },
              { perihal: 'Surat Keterangan Domisili Usaha', dari: 'Warga: Budi Santoso', tgl: '07/06/2026', tipe: 'keluar' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.tipe === 'masuk' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {item.tipe === 'masuk' ? <Mail size={12} className="text-blue-600" /> : <Send size={12} className="text-green-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-tight truncate">{item.perihal}</p>
                    <p className="text-[11px] text-gray-400 truncate">{item.dari}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-gray-400">{item.tgl}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.tipe === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.tipe === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ringkasan Klasifikasi */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Ringkasan Arsip Berdasarkan Klasifikasi (Tahun 2026)</h3>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {kData.map((k, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-xs font-bold text-gray-400 mb-0.5">{k.kode}</p>
              <p className="text-sm font-medium text-gray-700 mb-3 leading-tight">{k.nama}</p>
              <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${k.bg}`}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={k.text}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h10"/></svg>
              </div>
              <p className="text-2xl font-bold text-gray-800">{k.jumlah}</p>
              <p className="text-xs text-gray-400 mt-0.5">Arsip</p>
            </div>
          ))}
        </div>
      </div>

      {/* Surat Terbaru + Aktivitas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Surat Terbaru</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
          </div>
          <div className="space-y-2.5">
            {[
              { perihal: 'Surat Pengantar Nikah (N1)', dari: 'Warga: Siti Aminah', tgl: '11/06/2026', tipe: 'keluar' },
              { perihal: 'Nota Dinas', dari: 'Sekretariat Desa', tgl: '11/06/2026', tipe: 'masuk' },
              { perihal: 'Surat Tugas Perangkat Desa', dari: 'Kepala Desa', tgl: '10/06/2026', tipe: 'keluar' },
              { perihal: 'Imbauan Kebersihan Lingkungan', dari: 'Kepala Desa', tgl: '10/06/2026', tipe: 'masuk' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tipe === 'masuk' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {s.tipe === 'masuk' ? <Mail size={13} className="text-blue-600" /> : <Send size={13} className="text-green-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{s.dari}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{s.tgl}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.tipe === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {s.tipe === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Aktivitas Terakhir</h3>
          <div className="grid grid-cols-2 gap-3">
            {aktivitas.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${a.bg}`}>{a.ikon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{a.pesan}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{a.waktu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
