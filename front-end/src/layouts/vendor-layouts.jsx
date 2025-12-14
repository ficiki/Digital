// src/layouts/vendor-layouts.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/sidebar';
import Header from '../components/common/header';
import Modal from '../components/common/modal'; // Import Modal
import { useAuth } from '../contexts/authcontext';

const VendorLayout = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();  // ← rename biar gak bentrok
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for modal
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const user = {
    name: authUser?.nama_perusahaan || authUser?.nama_lengkap || 'User',
    role: 'vendor',
    email: authUser?.email,
    avatar: null
  };

  // Handle logout function
  const handleLogout = () => {
    console.log('Logging out...');
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
      {/* Sidebar - pass role "vendor" */}
      <Sidebar role="vendor" isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <Header
          title="Dashboard Vendor"
          user={user} // Gunakan variabel user yang sudah didefinisikan
          onLogout={handleLogout}
          showSearch={true}
          searchPlaceholder="Cari dokumen..."
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page Content - Scrollable */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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

export default VendorLayout;