import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/sidebar';
import Header from '../components/common/header';
import { useAuth } from '../contexts/authcontext';

const DireksiLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Prepare user object untuk Header
  const userForHeader = {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email,
    role: user?.role === 'direksi' ? 'Direksi' : user?.role
  };

  // Handle logout function
  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - hanya pass role */}
      <Sidebar role="direksi" isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <Header
          title="Dashboard Direksi"
          user={user}
          onLogout={handleLogout}
          showSearch={true}
          searchPlaceholder="Cari BAPP..."
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      
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

export default DireksiLayout;
