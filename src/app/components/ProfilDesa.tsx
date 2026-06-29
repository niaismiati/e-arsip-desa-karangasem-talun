import { Building2, Upload, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSSE } from '../../hooks/useSSE';
import { api } from '../../services/api';

const DEFAULT_FORM = {
  namaDesa: 'Desa Karangasem',
  kecamatan: 'Talun',
  kabupaten: 'Pekalongan',
  provinsi: 'Jawa Tengah',
  kodeDesa: '33.26.05.2009',
  alamat: 'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
  telepon: '(0285) 123456',
  email: 'desa@karangasem.desa.id',
  inisialDesa: 'KS',
  kodeSurat: '470',
  pemisah: '/',
  panjangNomor: '3'
};

export function ProfilDesa() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const prevLogoUrlRef = useRef('');

  useEffect(() => {
    fetchProfil();
  }, []);

  useSSE([
    'profil:updated',
  ], fetchProfil);

  async function fetchProfil() {
    try {
      const data = await api.get('/profil-desa');
      if (data.success && data.data) {
        const p = data.data as any;
        setFormData({
          namaDesa: p.nama_desa || '',
          kecamatan: p.kecamatan || '',
          kabupaten: p.kabupaten || '',
          provinsi: p.provinsi || '',
          kodeDesa: p.kode_desa || '',
          alamat: p.alamat || '',
          telepon: p.telepon || '',
          email: p.email || '',
          inisialDesa: p.inisial_desa || '',
          kodeSurat: p.kode_surat_default || '',
          pemisah: p.pemisah || '/',
          panjangNomor: String(p.panjang_nomor || 3)
        });
        if (p.logo) setLogoPreview(p.logo);
      }
    } catch {
      setError('Gagal memuat profil desa');
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = new FormData();
      body.append('nama_desa', formData.namaDesa);
      body.append('kecamatan', formData.kecamatan);
      body.append('kabupaten', formData.kabupaten);
      body.append('provinsi', formData.provinsi);
      body.append('kode_desa', formData.kodeDesa);
      body.append('alamat', formData.alamat);
      body.append('telepon', formData.telepon);
      body.append('email', formData.email);
      body.append('inisial_desa', formData.inisialDesa);
      body.append('kode_surat_default', formData.kodeSurat);
      body.append('pemisah', formData.pemisah);
      body.append('panjang_nomor', formData.panjangNomor);
      if (logoFile) body.append('logo', logoFile);

      const data = await api.upload('/profil-desa', 'PUT', body);
      if (data.success) {
        setSuccess('Profil desa berhasil diperbarui!');
        if ((data.data as any)?.logo) setLogoPreview((data.data as any).logo);
        setLogoFile(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError((data.message as string) || 'Gagal menyimpan profil');
      }
    } catch (err) {
      setError((err as Error).message || 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Yakin ingin reset ke pengaturan default?')) {
      setFormData(DEFAULT_FORM);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (prevLogoUrlRef.current) URL.revokeObjectURL(prevLogoUrlRef.current);
      const url = URL.createObjectURL(e.target.files[0]);
      prevLogoUrlRef.current = url;
      setLogoFile(e.target.files[0]);
      setLogoPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (prevLogoUrlRef.current) URL.revokeObjectURL(prevLogoUrlRef.current);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profil Desa</h2>

      {fetching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Memuat data profil...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Desa */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identitas Desa</h3>

          {/* Logo Desa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Desa
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Desa" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-indigo-600" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </label>
                <p className="text-xs text-gray-500 mt-1">Format: PNG/JPG, Maksimal 2MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Desa
              </label>
              <input
                type="text"
                value={formData.namaDesa}
                onChange={(e) => setFormData({...formData, namaDesa: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={(e) => setFormData({...formData, kecamatan: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kabupaten
              </label>
              <input
                type="text"
                value={formData.kabupaten}
                onChange={(e) => setFormData({...formData, kabupaten: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={formData.provinsi}
                onChange={(e) => setFormData({...formData, provinsi: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Desa
              </label>
              <input
                type="text"
                value={formData.kodeDesa}
                onChange={(e) => setFormData({...formData, kodeDesa: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.telepon}
                onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Desa
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Kantor Desa
            </label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Format Nomor Surat */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Nomor Surat</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inisial Desa (3 huruf)
              </label>
              <input
                type="text"
                value={formData.inisialDesa}
                onChange={(e) => setFormData({...formData, inisialDesa: e.target.value.toUpperCase()})}
                maxLength={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Surat Default
              </label>
              <input
                type="text"
                value={formData.kodeSurat}
                onChange={(e) => setFormData({...formData, kodeSurat: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <select
                value={formData.pemisah}
                onChange={(e) => setFormData({...formData, pemisah: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="/">/</option>
                <option value="-">-</option>
                <option value=".">.</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Panjang Nomor Urut
              </label>
              <select
                value={formData.panjangNomor}
                onChange={(e) => setFormData({...formData, panjangNomor: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="3">3 digit (001)</option>
                <option value="4">4 digit (0001)</option>
                <option value="5">5 digit (00001)</option>
              </select>
            </div>
          </div>

          {/* Preview Nomor Surat */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview Nomor Surat:</p>
            <p className="font-mono text-lg text-gray-900">
              001 {formData.pemisah} {formData.kodeSurat} {formData.pemisah} {formData.inisialDesa} {formData.pemisah} {String(new Date().getMonth() + 1).padStart(2, '0')} {formData.pemisah} {new Date().getFullYear()}
            </p>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>001 - Nomor urut</p>
              <p>{formData.kodeSurat} - Kode surat</p>
              <p>{formData.inisialDesa} - Inisial {formData.namaDesa}</p>
              <p>{String(new Date().getMonth() + 1).padStart(2, '0')} - Bulan ({new Date().toLocaleString('id-ID', { month: 'long' })})</p>
              <p>              {new Date().getFullYear()} - Tahun</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || fetching}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || fetching}
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5" />
            Reset ke Default
          </button>
        </div>
      </form>
    </div>
  );
}
