import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import DataTable from '../../components/common/datatable';
import LoadingSpinner from '../../components/common/loading-spinner';
import { bappService, formatDate } from '../../services/api';

const PersetujuanBappList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [bappList, setBappList] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);


    const fetchBappDocuments = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Mengambil BAPP yang diajukan atau telah direview PIC (status 'submitted' atau 'reviewed_pic')
            const response = await bappService.getAll({ 
                status: ['submitted', 'reviewed_pic'], 
                page: page, 
                limit: itemsPerPage 
            });
            setBappList(response.data.data);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);
        } catch (err) {
            setError('Gagal mengambil data dokumen BAPP. Silakan coba lagi nanti.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBappDocuments(1);
    }, []);

    // Effect untuk menampilkan pesan sukses dari navigasi sebelumnya
    useEffect(() => {
        if (location.state?.message) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            // Membersihkan state lokasi untuk mencegah pesan muncul lagi saat refresh
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location.state]);


    const handleRowClick = (row) => {
        navigate(`/direksi/persetujuan-bapp/${row.id}`, {
            state: { dokumen: row }
        });
    };

    const handlePageChange = (action) => {
        let newPage = currentPage;
        switch (action) {
            case 'first':
                newPage = 1;
                break;
            case 'prev':
                newPage = Math.max(1, currentPage - 1);
                break;
            case 'next':
                newPage = Math.min(pagination.totalPages, currentPage + 1);
                break;
            case 'last':
                newPage = pagination.totalPages;
                break;
            default:
                break;
        }
        if (newPage !== currentPage) {
            fetchBappDocuments(newPage);
        }
    };

    const columns = [
        {
            key: 'nomor_bapp',
            title: 'No BAPP'
        },
        {
            key: 'nama_projek',
            title: 'Nama Proyek',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.nama_projek}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {row.deskripsi_pekerjaan ? row.deskripsi_pekerjaan.substring(0, 60) + '...' : '-'}
                    </div>
                </div>
            )
        },
        {
            key: 'vendor_name',
            title: 'Vendor'
        },
        {
            key: 'tanggal_kontrak',
            title: 'Tanggal Kontrak',
            render: (value) => formatDate(value)
        },
        {
            key: 'status',
            title: 'Status',
            render: (value) => {
                const statusConfig = {
                    'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
                    'submitted': { color: 'bg-blue-100 text-blue-800', label: 'Diajukan' },
                    'reviewed_pic': { color: 'bg-yellow-100 text-yellow-800', label: 'Direview PIC' },
                    'approved_direksi': { color: 'bg-green-100 text-green-800', label: 'Disetujui Direksi' },
                    'rejected': { color: 'bg-red-100 text-red-800', label: 'Ditolak' },
                };
                const config = statusConfig[value?.toLowerCase()] || statusConfig.draft;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'aksi',
            title: 'Aksi',
            render: (value, row) => (
                <button 
                    onClick={(e) => { e.stopPropagation(); handleRowClick(row); }} // Stop propagation to prevent row click
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Review
                </button>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
             {showSuccessMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <FileText className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-semibold text-green-900">Aksi Berhasil!</p>
                        <p className="text-sm text-green-700 mt-1">
                            {location.state.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1e3a8a]">Persetujuan BAPP</h1>
                <p className="text-gray-500 mt-1">Daftar dokumen BAPP yang menunggu persetujuan</p>
            </div>

            {/* Stats Cards - Removed for now as no backend endpoint is available */}
            {/* <div className="mb-8">
                <StatsGrid
                    data={{
                        bappMenunggu: bappData.stats.totalBapp,
                        dokumenDitolak: bappData.stats.totalDitolak,
                        dokumenDisetujui: bappData.stats.dokumenDisetujui,
                        rataRataWaktu: bappData.stats.rataRataWaktu
                    }}
                />
            </div> */}

            {/* DataTable dengan Pagination */}
            {bappList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Tidak ada BAPP yang menunggu persetujuan</p>
                </div>
            ) : (
                <DataTable
                    data={bappList}
                    columns={columns}
                    onRowClick={handleRowClick}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default PersetujuanBappList;