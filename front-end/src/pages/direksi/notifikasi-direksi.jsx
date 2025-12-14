import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Check, Filter } from 'lucide-react';
import { useNotification } from '../../contexts/notification-context';

const NotifikasiDireksi = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotification();
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-600" size={24} />;
            case 'warning':
                return <AlertCircle className="text-yellow-600" size={24} />;
            case 'info':
            default:
                return <Info className="text-blue-600" size={24} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'warning':
                return 'bg-yellow-50';
            case 'info':
            default:
                return 'bg-blue-50';
        }
    };

    const handleDelete = (id) => {
        // if (confirm('Hapus notifikasi ini?')) {
        //     setNotifications(prev => prev.filter(notif => notif.id !== id));
        // }
    };

    const handleDeleteSelected = () => {
        // if (selectedIds.length === 0) return;
        // if (confirm(`Hapus ${selectedIds.length} notifikasi yang dipilih?`)) {
        //     setNotifications(prev => prev.filter(notif => !selectedIds.includes(notif.id)));
        //     setSelectedIds([]);
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

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.is_read;
        if (filter === 'read') return notif.is_read;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-3">
                    <Bell size={32} />
                    Notifikasi
                    {unreadCount > 0 && (
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                            {unreadCount} baru
                        </span>
                    )}
                </h1>
                <p className="text-gray-500 mt-1">Pantau semua aktivitas dan update terbaru</p>
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
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                        <p className="text-gray-500">Tidak ada notifikasi</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${!notif.is_read ? 'border-l-4 border-l-blue-600' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(notif.id)}
                                    onChange={() => toggleSelect(notif.id)}
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />

                                {/* Icon */}
                                <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-gray-900 ${!notif.is_read ? 'font-bold' : ''}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                                            <p className="text-gray-400 text-xs mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                                        </div>

                                        {!notif.is_read && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {!notif.is_read && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Tandai sebagai dibaca"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notif.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus notifikasi"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {filteredNotifications.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi
                </div>
            )}
        </div>
    );
};

export default NotifikasiDireksi;
