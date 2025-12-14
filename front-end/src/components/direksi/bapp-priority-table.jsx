import React from 'react';

const BappPriorityTable = ({
    data = [],
    onReview,
    pagination,
    onPageChange
}) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Disetujui' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Ditolak' },
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' }
        };

        // Convert status to lowercase for matching
        const statusKey = status.toLowerCase();

        // Check if status contains keywords
        let config;
        if (statusKey.includes('menunggu') || statusKey.includes('pending')) {
            config = statusConfig.pending;
        } else if (statusKey.includes('disetujui') || statusKey.includes('approved')) {
            config = statusConfig.approved;
        } else if (statusKey.includes('ditolak') || statusKey.includes('rejected')) {
            config = statusConfig.rejected;
        } else {
            config = statusConfig.draft;
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Tidak ada BAPP yang menunggu persetujuan</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No BAPP
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama Proyek
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="font-semibold">{item.noBapp}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{item.lokasi_pekerjaan}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.hasil_pemeriksaan ? item.hasil_pemeriksaan.substring(0, 60) + '...' : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.vendor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.tanggal}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={() => onReview(item)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        Lihat
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Menampilkan {pagination.from} sampai {pagination.to} dari {pagination.total} entri
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onPageChange('first')}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Awal
                        </button>
                        <button
                            onClick={() => onPageChange('prev')}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Balik
                        </button>

                        <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                            {pagination.currentPage}
                        </span>

                        <button
                            onClick={() => onPageChange('next')}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut
                        </button>
                        <button
                            onClick={() => onPageChange('last')}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Akhir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BappPriorityTable;