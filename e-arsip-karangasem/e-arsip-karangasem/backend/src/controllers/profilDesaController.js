const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/profilDesa.json');
const defaultProfil = {
  nama_desa: 'Desa Karangasem',
  kecamatan: 'Talun',
  kabupaten: 'Pekalongan',
  provinsi: 'Jawa Tengah',
  kode_desa: '33.26.05.2009',
  alamat: 'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
  telepon: '(0285) 123456',
  email: 'desa@karangasem.desa.id',
  inisial_desa: 'KS',
  kode_surat_default: '470',
  separator: '/',
  panjang_nomor: 3,
  logo: '/logo.png',
};

const ensureDataDir = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const loadProfil = () => {
  ensureDataDir();
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultProfil, null, 2), 'utf8');
    return { ...defaultProfil };
  }
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...defaultProfil, ...parsed };
  } catch (err) {
    return { ...defaultProfil };
  }
};

const saveProfil = (data) => {
  ensureDataDir();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

exports.getProfil = (req, res) => {
  try {
    const data = loadProfil();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat profil desa', error: err.message });
  }
};

exports.updateProfil = (req, res) => {
  try {
    const current = loadProfil();
    const incoming = {
      ...current,
      ...req.body,
      kode_surat_default: req.body.kode_surat_default || current.kode_surat_default,
      panjang_nomor: Number(req.body.panjang_nomor || current.panjang_nomor),
    };

    if (req.file) {
      incoming.logo = `/uploads/${req.file.filename}`;
    }

    saveProfil(incoming);
    res.json({ success: true, data: incoming });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan profil desa', error: err.message });
  }
};
