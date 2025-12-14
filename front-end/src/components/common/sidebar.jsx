// components/common/sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, FolderOpen, Bell, Plus, CheckSquare, Package, FileCheck, Settings, X } from 'lucide-react';

const Sidebar = ({ role, isOpen, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    vendor: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/vendor/dashboard' },
      { id: 'tambah-dokumen', label: 'Tambah Dokumen', icon: Plus, path: '/vendor/tambah-dokumen' },
      { id: 'dokumen-saya', label: 'Dokumen Saya', icon: FolderOpen, path: '/vendor/dokumen-saya' },
    ],
    direksi: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/direksi/dashboard' },
      { id: 'persetujuan-bapp', label: 'Persetujuan BAPP', icon: CheckSquare, path: '/direksi/persetujuan-bapp' },
      { id: 'dokumen-overview', label: 'Dokumen Overview', icon: FileCheck, path: '/direksi/dokumen-overview' },
    ],
    pic: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/pic-gudang/dashboard' },
      { id: 'pengecekan-barang', label: 'Pengecekan Barang', icon: Package, path: '/pic-gudang/pengecekan-barang' },
      { id: 'persetujuan-bapb', label: 'Persetujuan BAPB', icon: CheckSquare, path: '/pic-gudang/persetujuan-bapb' },
      { id: 'dokumen-overview', label: 'Dokumen Overview', icon: FileCheck, path: '/pic-gudang/dokumen-overview' },
    ]
  };

  const currentMenu = menuItems[role] || [];

  const handleNavigation = (path) => {
    navigate(path);
    if (setOpen) {
      setOpen(false); // Close sidebar on navigation
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside 
      className={`fixed left-0 top-0 w-64 h-screen bg-slate-800 text-white flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">DB</span>
          </div>
          <h1 className="text-xl font-bold">DigiBA</h1>
        </div>
        {/* Close button for mobile */}
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-700 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
            {role.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {role === 'vendor' && 'PT. Vendor'}
              {role === 'direksi' && 'Direksi'}
              {role === 'pic' && 'PIC Gudang'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
