const variants = {
  belum_disposisi: 'bg-amber-100 text-amber-700',
  sudah_disposisi: 'bg-green-100 text-green-700',
  diproses:        'bg-blue-100 text-blue-700',
  selesai:         'bg-gray-100 text-gray-600',
  menunggu:        'bg-amber-100 text-amber-700',
  diterima:        'bg-blue-100 text-blue-700',
};

const labels = {
  belum_disposisi: 'Belum Disposisi',
  sudah_disposisi: 'Sudah Disposisi',
  diproses:        'Diproses',
  selesai:         'Selesai',
  menunggu:        'Menunggu',
  diterima:        'Diterima',
};

export default function Badge({ status, text }) {
  const cls = variants[status] || 'bg-gray-100 text-gray-600';
  const label = text || labels[status] || status;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}
