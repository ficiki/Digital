// src/pages/setting/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileSetting from '../../components/settings/profile-setting';
import NotificationSetting from '../../components/settings/notification-setting';
import SecuritySetting from '../../components/settings/security-setting';
import { useAuth } from '../../contexts/authcontext';

const SettingsPage = () => {
  console.log('SettingsPage rendered');
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth(); // Destructure user here
  console.log('User object in SettingsPage:', user); // Log the user object
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤', component: <ProfileSetting /> },
    { id: 'notifications', label: 'Notifikasi', icon: '🔔', component: <NotificationSetting /> },
    // { id: 'display', label: 'Tampilan', icon: '🎨', component: <DisplaySetting /> }, // Hapus tab Tampilan
  ];

  const getBackPath = () => {
    console.log('Current user role:', userRole); // Debug
    
    switch (userRole) {
      case 'direksi':
        return '/direksi/dashboard';
      case 'gudang':
        return '/pic-gudang/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      default:
        console.warn('Unknown role, redirecting to home');
        return '/';
    }
  };

  const handleBack = () => {
    const backPath = getBackPath();
    console.log('Navigating back to:', backPath);
    navigate(backPath, { replace: true });
  };

  // Show loading while auth is being checked
  if (loading) { // SEKARANG loading sudah didefinisikan
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Saya
          </h1>
          {/* <div className="text-sm text-gray-500 mt-1">
            Login sebagai: {userEmail} ({userRole})
          </div> */}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Butuh Bantuan?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                Jika mengalami kesulitan, hubungi tim support kami
              </p>
              <a
                href="mailto:support@digiba.com"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@digiba.com
              </a>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;