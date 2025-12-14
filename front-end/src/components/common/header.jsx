// components/common/header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, User, Settings, Menu } from 'lucide-react'; // Import Menu
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/notification-context'; // Import useNotification

const Header = ({ user, onLogout, onMenuClick }) => { // Add onMenuClick
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAllAsRead } = useNotification(); // Gunakan hook

  const role = user?.role; // Ambil role dari object user

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const getRoleName = () => {
    if (role === 'vendor') return 'Dashboard Vendor';
    if (role === 'direksi') return 'Dashboard Direksi';
    if (role === 'pic' || role === 'gudang') return 'Dashboard PIC Gudang';
    return 'Dashboard';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationPath = () => {
    if (role === 'vendor') return '/notifikasi-vendor';
    if (role === 'direksi') return '/notifikasi-direksi';
    if (role === 'pic') return '/notifikasi-pic';
    return '/notifikasi';
  }

  // Fungsi untuk navigasi ke halaman pengaturan
  const handleSettingsNavigate = () => {
    setShowProfileMenu(false); // Tutup dropdown
    navigate('/setting');     // Navigasi ke halaman settings
  };

  const handleNotificationClick = (notif) => {
    // navigate(`/dokumen/${notif.documentId}`);
    setShowNotifications(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left: Hamburger, Page Title & Search */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button (for mobile/tablet) */}
          <button 
            onClick={onMenuClick} 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Page Title */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">{getRoleName()}</h2>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Tandai semua terbaca
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notif.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notif.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Tidak ada notifikasi baru</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(getNotificationPath()); // Navigasi ke halaman notifikasi
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>

                <button 
                  onClick={handleSettingsNavigate}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <User size={16} />
                  Profil
                </button>



                <hr className="my-2" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
