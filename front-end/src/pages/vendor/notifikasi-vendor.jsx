// src/pages/vendor/notifikasi-vendor.jsx
import React, { useState } from 'react';
import NotificationCenter from '../../components/common/notification-center';
import { useNotification } from '../../contexts/notification-context'; // PERBAIKI: context -> contexts

const NotifikasiVendor = () => {
  const { notifications, markAllAsRead } = useNotification();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>
          <p className="text-gray-600">
            Kelola semua notifikasi sistem Anda
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total Notifikasi</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">Belum Dibaca</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.type === 'approval').length}
            </div>
            <div className="text-sm text-gray-600">Butuh Persetujuan</div>
          </div>
        </div>

        {/* Notification Center */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <NotificationCenter />
        </div>

        {/* Empty State untuk testing */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada notifikasi
            </h3>
            <p className="text-gray-600">
              Semua notifikasi telah ditangani dengan baik
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifikasiVendor;