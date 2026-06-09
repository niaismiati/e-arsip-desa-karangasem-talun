import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function AdminLaporan() {
  const [perKlasifikasi, setPerKlasifikasi] = useState([]);

  useEffect(() => {
    api.get('/laporan/per-klasifikasi').then(r => setPerKlasifikasi(r.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Laporan Arsip</h2>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan data arsip surat Desa Karangasem</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Jumlah Surat per Klasifikasi</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={perKlasifikasi}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="kode" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val, name) => [val, name === 'masuk' ? 'Surat Masuk' : 'Surat Keluar']} />
            <Legend formatter={(val) => val === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'} />
            <Bar dataKey="masuk" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Detail per Klasifikasi</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {['Kode', 'Klasifikasi', 'Surat Masuk', 'Surat Keluar', 'Total'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {perKlasifikasi.map((k) => (
              <tr key={k.kode} className="hover:bg-gray-50">
                <td className="px-5 py-3"><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{k.kode}</span></td>
                <td className="px-5 py-3 font-medium text-gray-700">{k.nama}</td>
                <td className="px-5 py-3 text-blue-600 font-semibold">{k.masuk}</td>
                <td className="px-5 py-3 text-green-600 font-semibold">{k.keluar}</td>
                <td className="px-5 py-3 font-bold text-gray-800">{k.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
