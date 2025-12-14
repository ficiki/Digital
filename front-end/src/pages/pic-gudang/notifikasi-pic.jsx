import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, Check, Trash2 } from 'lucide-react';
import { useNotification } from '../../contexts/notification-context';

const NotifikasiPic = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedIds, setSelectedIds] = useState([]);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  // const handleMarkAsRead = (id) => {
  //   setNotifications(notifications.map(notif =>
  //     notif.id === id ? { ...notif, isRead: true } : notif
  //   ));
  // };

  // const handleMarkAllAsRead = () => {
  //   setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  // };

  const handleDelete = (id) => {
    // if (window.confirm('Hapus notifikasi ini?')) {
    //   setNotifications(notifications.filter(notif => notif.id !== id));
    //   setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    // }
  };

  const handleDeleteSelected = () => {
    // if (selectedIds.length === 0) return;
    // if (window.confirm(`Hapus ${selectedIds.length} notifikasi yang dipilih?`)) {
    //   setNotifications(notifications.filter(notif => !selectedIds.includes(notif.id)));
    //   setSelectedIds([]);
    // }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleViewDokumen = (dokumenNo) => {
    alert(`Navigating to dokumen ${dokumenNo}`);
    // navigate to dokumen detail
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'bapb_new':
        return { Icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'deadline':
        return { Icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'approval':
        return { Icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'rejection':
        return { Icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { Icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell size={32} />
          Notifikasi
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
              {unreadCount} baru
            </span>
          )}
        </h1>
        <p className="text-gray-500 mt-1">
          Lihat semua aktivitas dan update terbaru
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - Filter and Select */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua ({notifications.length})</option>
              <option value="unread">Belum Dibaca ({unreadCount})</option>
              <option value="read">Sudah Dibaca ({notifications.length - unreadCount})</option>
            </select>

            {filteredNotifications.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                {selectedIds.length === filteredNotifications.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span>Hapus ({selectedIds.length})</span>
              </button>
            )}

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                <span className="hidden sm:inline">Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Notifikasi
            </h3>
            <p className="text-gray-500">
              Tidak ada notifikasi untuk filter ini
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const { Icon, color, bgColor } = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${!notif.is_read
                    ? 'border-blue-200 hover:border-blue-300 shadow-md border-l-4 border-l-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notif.id)}
                      onChange={() => toggleSelect(notif.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon size={24} className={color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold text-gray-900 mb-1 ${!notif.is_read ? 'font-bold' : ''}`}>
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {notif.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                      {/* Blue dot for unread */}
                      {!notif.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}

                      {/* Mark as Read Button */}
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="flex-shrink-0 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="Tandai sebagai dibaca"
                        >
                          <Check size={18} />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="flex-shrink-0 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Hapus notifikasi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi
        </div>
      )}

      {/* Empty State untuk semua notifikasi dibaca */}
      {filteredNotifications.length > 0 && unreadCount === 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
          <p className="text-sm text-green-800 font-medium">
            Semua notifikasi telah dibaca! ✓
          </p>
        </div>
      )}
    </div>
  );
};

export default NotifikasiPic;
