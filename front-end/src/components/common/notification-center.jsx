// components/common/NotificationCenter.jsx
import React from 'react';
import { useNotification } from '../../contexts/notification-context';

const NotificationCenter = ({ onClose }) => {
  const { notifications, markAllAsRead } = useNotification();

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800" onClick={markAllAsRead}>
          Tandai semua terbaca
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              !notification.is_read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Lihat semua notifikasi
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;