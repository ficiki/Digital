import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authcontext';
import { NotificationProvider } from './contexts/notification-context';
import './index.css'; 

// Public Pages
import HomePage from './pages/home-page';
import LoginPage from './pages/login-page';
import RegisterPage from './pages/register-page';

// Layouts
import DireksiLayout from './layouts/direksi-layouts';
import PicLayout from './layouts/pic-layouts';
import VendorLayout from './layouts/vendor-layouts';

// Direksi Pages
import DireksiDashboard from './pages/direksi/direksi-dashboard';
import DokumenOverviewDireksi from './pages/direksi/dokumen-overview';
import DokumenOverviewDetailDireksi from './pages/direksi/dokumen-overview-detail';
import PersetujuanBappList from './pages/direksi/persetujuan-bapp-list';
import PersetujuanBappDetail from './pages/direksi/persetujuan-bapp-detail';
import NotifikasiDireksi from './pages/direksi/notifikasi-direksi';

// PIC Gudang Pages
import PicDashboard from './pages/pic-gudang/pic-dashboard';
import PengecekanOverview from './pages/pic-gudang/pengecekan-barang/pengecekan-overview';
import PengecekanBarang from './pages/pic-gudang/pengecekan-barang/pengecekan-barang';
import PersetujuanOverview from './pages/pic-gudang/persetujuan-bapb/persetujuan-overview';
import PersetujuanBapb from './pages/pic-gudang/persetujuan-bapb/persetujuan-bapb';
import NotifikasiPic from './pages/pic-gudang/notifikasi-pic';
import DokumenOverviewPic from './pages/pic-gudang/dokumen-overview/dokumen-overview';
import DokumenOverviewDetailPic from './pages/pic-gudang/dokumen-overview/dokumen-overview-detail';

// Vendor Pages
import VendorDashboard from './pages/vendor/vendor-dashboard';
import DokumenSaya from './pages/vendor/dokumen-saya';
import DetailDokumen from './pages/vendor/detail-dokumen';
import TambahDokumen from './pages/vendor/tambah-dokumen';
import TambahDokumenBapb from './pages/vendor/tambah-dokumen-bapb';
import TambahDokumenBapp from './pages/vendor/tambah-dokumen-bapp';
import NotifikasiVendor from './pages/vendor/notifikasi-vendor';
import FormTambahDokumen from './pages/vendor/form-tambah-dokumen';
import SettingsPage from './pages/setting'; // Import SettingsPage


// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, getUserRole, hasRole, loading } = useAuth();
  const userRole = getUserRole();

  console.log('🔒 ProtectedRoute:', { isAuthenticated, userRole, requiredRole, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`🔒 ProtectedRoute: Role mismatch. User role: ${userRole}, Required: ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  console.log(`✅ ProtectedRoute: Access granted for ${userRole}`);
  return children;
};

// Public Route Component
// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading, getUserRole } = useAuth();

  console.log('🔓 PublicRoute:', { 
    isAuthenticated, 
    userRole, 
    loading,
    getUserRole: getUserRole(),
    localStorageUser: JSON.parse(localStorage.getItem('user') || 'null')
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const currentRole = getUserRole(); // ← Gunakan function
  
  if (isAuthenticated && currentRole) {
    console.log(`🔓 PublicRoute: Already authenticated as ${currentRole}, redirecting to dashboard`);
    
    switch (currentRole) {
      case 'direksi':
        return <Navigate to="/direksi/dashboard" replace />;
      case 'pic':
        return <Navigate to="/pic-gudang/dashboard" replace />;
      case 'vendor':
        return <Navigate to="/vendor/dashboard" replace />;
      default:
        console.warn(`⚠️ PublicRoute: Unknown role ${currentRole}, redirecting to home`);
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  // Debug auth state
  const { isAuthenticated, getUserRole } = useAuth();
  const userRole = getUserRole();
  console.log('🔄 AppRoutes rendered:', { isAuthenticated, userRole });

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes - DIREKSI dengan Layout */}
      <Route 
        path="/direksi" 
        element={
          <ProtectedRoute requiredRole="direksi">
            <DireksiLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DireksiDashboard />} />
        <Route path="persetujuan-bapp" element={<PersetujuanBappList />} />
        <Route path="persetujuan-bapp/:id" element={<PersetujuanBappDetail />} />
        <Route path="dokumen-overview" element={<DokumenOverviewDireksi />} />
        <Route path="dokumen-overview/:id" element={<DokumenOverviewDetailDireksi />} />
        <Route path="notifikasi" element={<NotifikasiDireksi />} />
      </Route>

      {/* Protected Routes - PIC GUDANG dengan Layout */}
      <Route 
        path="/pic-gudang" 
        element={
          <ProtectedRoute requiredRole="pic">
            <PicLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PicDashboard />} />
        
        {/* PENGECEKAN BARANG ROUTES */}
        <Route path="pengecekan-barang" element={<PengecekanOverview />} />
        <Route path="pengecekan-barang/:id" element={<PengecekanBarang />} />
        
        {/* PERSETUJUAN BAPB ROUTES */}
        <Route path="persetujuan-bapb" element={<PersetujuanOverview />} />
        <Route path="persetujuan-bapb/:id" element={<PersetujuanBapb />} />
        
        {/* OTHER ROUTES */}
        <Route path="notifikasi-pic" element={<NotifikasiPic />} />
        <Route path="dokumen-overview" element={<DokumenOverviewPic />} />
        <Route path="dokumen-overview/:id" element={<DokumenOverviewDetailPic />} />
      </Route>

      {/* Protected Routes - VENDOR dengan Layout */}
      <Route 
        path="/vendor" 
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="tambah-dokumen" element={<TambahDokumen />} />
        <Route path="tambah-dokumen/:type" element={<FormTambahDokumen />} />
        <Route path="dokumen-saya" element={<DokumenSaya />} />
        <Route path="dokumen-saya/:type/:id" element={<DetailDokumen />} />

        <Route path="notifikasi" element={<NotifikasiVendor />} />
        
        {/* Optional: Jika ingin tetap support route lama */}
        <Route path="tambah-dokumen-bapb" element={<TambahDokumenBapb />} />
        <Route path="tambah-dokumen-bapp" element={<TambahDokumenBapp />} />
      </Route>

      {/* Settings Page (Accessible by all authenticated users) */}
      <Route 
        path="/setting" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  console.log('🚀 App component mounted');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('✅ Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('❌ Service Worker registration failed:', error));
    }
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;