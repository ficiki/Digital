import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import DataTable from '../../components/common/datatable';
import { bappService, formatDate } from '../../services/api';
import LoadingSpinner from '../../components/common/loading-spinner';

const DokumenOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dokumenData, setDokumenData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(null); // ID of the item being downloaded

  const fetchDokumenData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bappService.getAll({
        status: ['approved_direksi', 'rejected'],
        page: page,
        limit: 10
      });
      const filteredData = response.data.data.filter(doc =>
        doc.status && (doc.status.toLowerCase() === 'approved_direksi' || doc.status.toLowerCase() === 'rejected')
      );
      setDokumenData(filteredData);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Gagal mengambil data dokumen. Silakan coba lagi nanti.');
      console.error('Error fetching dokumen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumenData(1);
  }, []);

  const handleRowClick = (row) => {
    // Navigate to the detail page for BAPP
    navigate(`/direksi/persetujuan-bapp/${row.id}`);
  };
  
  const handleDownload = async (e, dokumen) => {
    e.stopPropagation();
    if (isDownloading === dokumen.id) return;

    setIsDownloading(dokumen.id);
    try {
      const response = await bappService.downloadBapp(dokumen.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dokumen.nomor_bapp || 'BAPP-document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Gagal mengunduh file untuk ${dokumen.nomor_bapp}.`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchDokumenData(newPage);
    }
  };

  const columns = [
    {
        key: 'nomor_bapp',
        title: 'No BAPP'
    },
    {
        key: 'lokasi_pekerjaan',
        title: 'Nama Proyek',
        render: (value, row) => (
            <div>
                <div className="text-sm font-semibold text-gray-900">{row.lokasi_pekerjaan}</div>
            </div>
        )
    },
    {
        key: 'vendor_name',
        title: 'Vendor'
    },
    {
        key: 'updated_at',
        title: 'Tanggal Review',
        render: (value) => formatDate(value)
    },
    {
        key: 'status',
        title: 'Status',
        render: (value) => {
            const statusConfig = {
                'approved_direksi': { color: 'bg-green-100 text-green-800', label: 'Disetujui' },
                'rejected': { color: 'bg-red-100 text-red-800', label: 'Ditolak' },
            };
            const config = statusConfig[value?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
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
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="View Detail"
                >
                    <Eye size={18} />
                </button>
                {row.status.toLowerCase() === 'approved_direksi' && (
                    <button
                        onClick={(e) => handleDownload(e, row)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download"
                        disabled={isDownloading === row.id}
                    >
                        {isDownloading === row.id ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Download size={18} />
                        )}
                    </button>
                )}
            </div>
        )
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Dokumen Overview</h1>
        <p className="text-gray-500 mt-1">Lihat semua dokumen BAPP yang disetujui dan ditolak</p>
      </div>

      {dokumenData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Belum ada dokumen yang direview</p>
        </div>
      ) : (
        <DataTable
            data={dokumenData}
            columns={columns}
            onRowClick={handleRowClick}
            pagination={pagination}
            onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default DokumenOverview;