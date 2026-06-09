import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminSuratMasuk from './pages/admin/SuratMasuk';
import AdminSuratKeluar from './pages/admin/SuratKeluar';
import AdminKlasifikasi from './pages/admin/Klasifikasi';
import AdminPengguna from './pages/admin/Pengguna';
import AdminLaporan from './pages/admin/Laporan';

// Operator
import OperatorDashboard from './pages/operator/Dashboard';
import OperatorSuratMasuk from './pages/operator/SuratMasuk';
import OperatorSuratKeluar from './pages/operator/SuratKeluar';
import OperatorDisposisi from './pages/operator/Disposisi';

// Pimpinan
import PimpinanDashboard from './pages/pimpinan/Dashboard';
import PimpinanSuratMasuk from './pages/pimpinan/SuratMasuk';
import PimpinanSuratKeluar from './pages/pimpinan/SuratKeluar';
import PimpinanDisposisi from './pages/pimpinan/DisposisiSaya';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'operator') return <Navigate to="/operator/dashboard" replace />;
  return <Navigate to="/pimpinan/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/daftar" element={<Register />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="surat-masuk" element={<AdminSuratMasuk />} />
        <Route path="surat-keluar" element={<AdminSuratKeluar />} />
        <Route path="klasifikasi" element={<AdminKlasifikasi />} />
        <Route path="pengguna" element={<AdminPengguna />} />
        <Route path="laporan" element={<AdminLaporan />} />
      </Route>

      {/* Operator */}
      <Route path="/operator" element={<ProtectedRoute roles={['operator']}><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="surat-masuk" element={<OperatorSuratMasuk />} />
        <Route path="surat-keluar" element={<OperatorSuratKeluar />} />
        <Route path="disposisi" element={<OperatorDisposisi />} />
      </Route>

      {/* Pimpinan */}
      <Route path="/pimpinan" element={<ProtectedRoute roles={['pimpinan']}><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PimpinanDashboard />} />
        <Route path="surat-masuk" element={<PimpinanSuratMasuk />} />
        <Route path="surat-keluar" element={<PimpinanSuratKeluar />} />
        <Route path="disposisi-saya" element={<PimpinanDisposisi />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
            error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
