import { useState, useEffect } from 'react';

const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatJam(angka: number): string {
  return angka.toString().padStart(2, '0');
}

export function DateTimeDisplay() {
  const [waktu, setWaktu] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setWaktu(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hari = namaHari[waktu.getDay()];
  const tanggal = waktu.getDate();
  const bulan = namaBulan[waktu.getMonth()];
  const tahun = waktu.getFullYear();
  const jam = formatJam(waktu.getHours());
  const menit = formatJam(waktu.getMinutes());
  const detik = formatJam(waktu.getSeconds());

  return (
    <div className="text-right">
      <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
        <span>🗓</span>
        <span>{hari}, {tanggal} {bulan} {tahun}</span>
      </p>
      <p className="text-lg font-bold text-[#5b4fcf] flex items-center justify-end gap-1">
        <span>🕐</span>
        <span>{jam}:{menit}:{detik} WIB</span>
      </p>
    </div>
  );
}
