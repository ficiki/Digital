import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/statcard';
import DataTable from '../../components/common/datatable';
import EmptyState from '../../components/common/empty-state';
import LoadingSpinner from '../../components/common/loading-spinner';
import Modal from '../../components/common/modal';
import { useDocuments } from "../../hooks/useDocuments";
import { useAuth } from "../../contexts/authcontext";
import { formatDate, formatCurrency } from "../../services/api";
import { DOCUMENT_TYPES, STATUS_LABELS } from "../../utils/constants";
import { FileText, Clock, CheckCircle, Edit3 } from 'lucide-react';


const VendorDashboard = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    documentId: null,
    documentType: null,
    documentNumber: '',
    isDeleting: false
  });
  
  // State for submit modal
  const [submitModal, setSubmitModal] = useState({
    isOpen: false,
    documentId: null,
    documentType: null,
    documentNumber: ''
  });

  // Use custom hook for documents
  const {
    documents,
    loading,
    error,
    pagination,
    fetchDocuments,
    mapStatusToFrontend,
    deleteDocument,
    submitDocument,
    documentStats // Destructure documentStats from the hook
  } = useDocuments('all', {
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const statusColorMap = {
    total: 'blue',        // Default color for total or general stats
    submitted: 'yellow',  // For documents awaiting review
    approved: 'green',    // For approved documents
    draft: 'purple',      // For documents in draft state
    reviewed: 'orange',   // For documents that have been reviewed (if applicable to vendor dashboard)
    rejected: 'red'       // For rejected documents (if applicable)
  };

  // Update dashboardStats to use actual data and assign colors
  const dashboardStats = [
    { 
      title: "Total Dokumen", 
      value: loading ? "..." : (documentStats?.total || 0), 
      description: "Semua berita acara yang Anda buat",
      color: statusColorMap.total,
      iconComponent: <FileText size={24} />
    },
    { 
      title: "Menunggu Review", 
      value: loading ? "..." : (documentStats?.submitted || 0), 
      description: "Dokumen menunggu persetujuan",
      color: statusColorMap.submitted,
      iconComponent: <Clock size={24} />
    },
    { 
      title: "Disetujui", 
      value: loading ? "..." : (documentStats?.approved || 0), 
      description: "Dokumen yang sudah disetujui",
      color: statusColorMap.approved,
      iconComponent: <CheckCircle size={24} />
    },
    { 
      title: "Draft", 
      value: loading ? "..." : (documentStats?.draft || 0), 
      description: "Dokumen yang belum diajukan",
      color: statusColorMap.draft,
      iconComponent: <Edit3 size={24} />
    },
  ];

  // Format data for the table
  const tableData = documents.map(doc => {
    const statusInfo = mapStatusToFrontend(doc);
    
    return {
      id: doc.id,
      jenis: doc.jenis || (doc.id_bapb ? 'BAPB' : 'BAPP'),
      jenisDokumen: doc.jenis || (doc.id_bapb ? 'BAPB' : 'BAPP'),
      noDokumen: doc.noDokumen || doc.nomor_bapb || doc.nomor_bapp,
      nomor_kontrak: doc.no_kontrak || doc.nomorSuratPesanan,
      tanggalDibuat: formatDate(doc.created_at),
      nilai_kontrak: doc.nilai_kontrak || doc.nilaiKontrak,
      status: doc.status,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color,
      statusBadgeClass: statusInfo.badgeClass,
      isDraft: doc.status === 'draft',
      canEdit: doc.status === 'draft' && hasRole('vendor'),
      canDelete: doc.status === 'draft' && hasRole('vendor'),
      canSubmit: doc.status === 'draft' && hasRole('vendor'),
      vendor_nama: doc.vendor_nama,
      nama_perusahaan: doc.nama_perusahaan
    };
  });

  // Columns configuration for DataTable
  const columns = [
    { 
      key: 'noDokumen', 
      title: 'NO DOKUMEN', 
      width: 'w-48',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.nomor_kontrak}</div>
        </div>
      )
    },
    { 
      key: 'jenisDokumen', 
      title: 'JENIS', 
      width: 'w-24',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          value === 'BAPB' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'tanggalDibuat', 
      title: 'TANGGAL', 
      width: 'w-32',
      responsive: true
    },
    { 
      key: 'nilai_kontrak', 
      title: 'NILAI', 
      width: 'w-40',
      render: (value) => formatCurrency(value || 0),
      responsive: true
    },
    { 
      key: 'statusLabel', 
      title: 'STATUS', 
      width: 'w-36',
      render: (value, row) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${row.statusBadgeClass}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'AKSI',
      width: 'w-48',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Lihat
          </button>



          {/* Submit Button (only for draft) */}
          {row.canSubmit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitClick(row);
              }}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              Ajukan
            </button>
          )}

          {/* Delete Button (only for draft) */}
          {row.canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
      )
    }
  ];

  // Handlers
  const handleView = (row) => {
    const path = row.jenis === 'BAPB' 
      ? `/vendor/dokumen-saya/bapb/${row.id}`
      : `/vendor/dokumen-saya/bapp/${row.id}`;
    navigate(path);
  };



  const handleDeleteClick = (row) => {
    setDeleteModal({
      isOpen: true,
      documentId: row.id,
      documentType: row.jenis.toLowerCase(),
      documentNumber: row.noDokumen
    });
  };

  const handleSubmitClick = (row) => {
    setSubmitModal({
      isOpen: true,
      documentId: row.id,
      documentType: row.jenis.toLowerCase(),
      documentNumber: row.noDokumen
    });
  };

  const confirmSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!submitModal.documentId || !submitModal.documentType) {
      return;
    }

    try {
      const result = await submitDocument(
        submitModal.documentId,
        submitModal.documentType
      );

      if (result.success) {
        await fetchDocuments();
        setSubmitModal({ isOpen: false, documentId: null, documentType: null, documentNumber: '' });

      } else {

      }
    } catch (error) {
    }
  };

  const handlePageChange = (action) => {
    switch(action) {
      case 'first':
        goToPage(1);
        break;
      case 'prev':
        prevPage();
        break;
      case 'next':
        nextPage();
        break;
      case 'last':
        goToPage(pagination.totalPages);
        break;
      default:
        break;
    }
  };


  const handleTambahDokumen = () => {
    navigate('/vendor/tambah-dokumen');
  };

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Memuat dokumen..." size="large" />
      </div>
    );
  }

  // If error, display error state
  if (error && documents.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Terjadi Kesalahan"
          message={error}
          icon="⚠️"
          actionButton={
            <button
              onClick={fetchDocuments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Selamat Datang, PT. Vendor!</h1>
        <p className="opacity-90">Kelola dan pantau berita acara Anda dengan mudah</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Aktivitas Terbaru</h2>
          <button 
            onClick={handleTambahDokumen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Buat Dokumen Baru
          </button>
        </div>
        
        {documents.length > 0 ? (
          <DataTable
            data={tableData}
            columns={columns}
            pagination={{
              currentPage: pagination.currentPage,
              lastPage: pagination.totalPages,
              from: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
              to: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
              total: pagination.totalItems
            }}
            onPageChange={handlePageChange}
            compact={true}
          />
        ) : (
          <EmptyState
            title={"Belum ada dokumen"}
            message={"Mulai dengan membuat dokumen BAPB atau BAPP baru."}
            icon={"📄"}
            actionButton={
              <button
                onClick={() => navigate('/vendor/tambah-dokumen')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Dokumen Pertama
              </button>
            }
          />
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        title="Konfirmasi Hapus Dokumen"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-600">🗑️</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Hapus Dokumen?
            </h4>
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus dokumen <strong>{deleteModal.documentNumber}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              <strong>Perhatian:</strong> Aksi ini tidak dapat dibatalkan. Semua data dan lampiran akan dihapus permanen.
            </p>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex space-x-3 pt-4"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteModal({ ...deleteModal, isOpen: false });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={deleteModal.isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!deleteModal.documentId || !deleteModal.documentType) {
                  return;
                }

                setDeleteModal(prev => ({ ...prev, isDeleting: true }));

                try {
                  const result = await deleteDocument(
                    deleteModal.documentId,
                    deleteModal.documentType
                  );

                  if (result.success) {
                    await fetchDocuments();
                    setDeleteModal({ isOpen: false, documentId: null, documentType: null, documentNumber: '', isDeleting: false });
                  } else {

                    setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                  }
                } catch (error) {

                  setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                deleteModal.isDeleting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {deleteModal.isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ ...submitModal, isOpen: false })}
        title="Ajukan Dokumen untuk Review"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-green-600">📤</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Ajukan Dokumen?
            </h4>
            <p className="text-gray-600">
              Apakah Anda yakin ingin mengajukan dokumen <strong>{submitModal.documentNumber}</strong> untuk review?
            </p>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Setelah diajukan:</strong>
                <br />• Tidak bisa diedit/dihapus oleh Vendor
                <br />• Akan direview oleh {submitModal.documentType === 'bapb' ? 'PIC Gudang' : 'PIC terlebih dahulu'}
                <br />• Status akan berubah menjadi "Menunggu Review"
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSubmitModal({ ...submitModal, isOpen: false });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmSubmit}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ya, Ajukan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorDashboard;
