// layouts/pic-layouts.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/sidebar';
import Header from '../components/common/header';
import Modal from '../components/common/modal'; // Import Modal
import { useAuth } from '../contexts/authcontext';

const PicLayout = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for modal
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Cek authentication saat komponen mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // ✅ Tampilkan loading jika belum selesai cek
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Prepare user object untuk Header
  const userForHeader = {
    name: 'PIC Gudang',
    role: 'gudang',
    email: user?.email
  };

  // Handle logout function dengan confirmation
  const handleLogout = () => {
    setShowLogoutModal(true); // Open modal instead of window.confirm
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false); // Close modal after logout
  };

  const cancelLogout = () => {
    setShowLogoutModal(false); // Close modal
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="pic" isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page Content - Outlet untuk child routes */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={showLogoutModal} 
        onClose={cancelLogout} 
        title="Konfirmasi Logout"
      >
        <p className="text-gray-700 mb-6">Apakah Anda yakin ingin keluar dari akun ini?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelLogout}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={confirmLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </Modal>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black opacity-50 z-40" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default PicLayout;
