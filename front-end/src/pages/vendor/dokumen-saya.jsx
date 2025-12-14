import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/datatable';
import EmptyState from '../../components/common/empty-state';
import LoadingSpinner from '../../components/common/loading-spinner';
import Modal from "../../components/common/modal";
import { useDocuments } from "../../hooks/useDocuments";
import { useAuth } from "../../contexts/authcontext"; // ← PERUBAHAN: dari context bukan hooks
import { useNotification } from '../../contexts/notification-context';
import { formatDate, formatCurrency } from "../../services/api";
import { STATUS_LABELS } from "../../utils/constants"

const DokumenSaya = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  // State untuk modal delete confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    documentId: null,
    documentType: null,
    documentNumber: '',
    isDeleting: false
  });
  const { addNotification } = useNotification();
  
  // State untuk submit modal
  const [submitModal, setSubmitModal] = useState({
    isOpen: false,
    documentId: null,
    documentType: null,
    documentNumber: ''
  });
  
  // Gunakan custom hook untuk documents
  const {
    documents,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    deleteDocument,
    submitDocument,
    fetchDocuments,
    mapStatusToFrontend
  } = useDocuments('all', {
    page: 1,
    limit: 10
  });

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Format data untuk table
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
      nama_perusahaan: doc.nama_perusahaan,
      isSignedPic: doc.jenis === 'BAPB' && !!doc.pic_signed_at, // New property for PIC signature status
      picSignedAt: doc.pic_signed_at ? formatDate(doc.pic_signed_at) : null // New property for PIC signature date
    };
  });

  // Columns configuration untuk DataTable
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
      width: 'w-32' 
    },
    { 
      key: 'nilai_kontrak', 
      title: 'NILAI', 
      width: 'w-40',
      render: (value) => formatCurrency(value || 0)
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

    console.log('📤 confirmSubmit called');
    console.log('📤 submitModal state:', submitModal);

    if (!submitModal.documentId || !submitModal.documentType) {
      console.log('❌ Missing documentId or documentType');
      return;
    }

    try {
      const result = await submitDocument(
        submitModal.documentId,
        submitModal.documentType
      );

      console.log('📤 submitDocument result:', result);

      if (result.success) {
        console.log('✅ Submit successful, refreshing documents and closing modal');
        // Refresh documents list
        await fetchDocuments();
        setSubmitModal({ isOpen: false, documentId: null, documentType: null, documentNumber: '' });

      } else {
        console.log('❌ Submit failed:', result.error);

      }
    } catch (error) {

    }
  };

  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: e.target.search.value });
  };

  const clearFilters = () => {
    updateFilters({
      page: 1
    });
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

  const hasActiveFilters = false;

  // Jika loading, tampilkan spinner
  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Memuat dokumen..." size="large" />
      </div>
    );
  }

  // Jika error, tampilkan error state
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
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dokumen Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau berita acara yang telah Anda buat
              {pagination.totalItems > 0 && (
                <span className="ml-2 text-gray-500">
                  ({pagination.totalItems} dokumen ditemukan)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/vendor/tambah-dokumen')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <span className="mr-2">+</span> Buat Dokumen Baru
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="space-y-4">


          {/* Filter Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">


            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
              >
                Hapus Semua Filter
              </button>
            )}
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">


            </div>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length > 0 ? (
          <>
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
              compact={false}
            />
            
            {/* Summary */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                  <span>BAPB: {documents.filter(d => d.jenis === 'BAPB').length}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                  <span>BAPP: {documents.filter(d => d.jenis === 'BAPP').length}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
                  <span>Draft: {documents.filter(d => d.status === 'draft').length}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></span>
                  <span>Pending: {documents.filter(d => d.status === 'submitted').length}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title={hasActiveFilters ? "Tidak ada dokumen ditemukan" : "Belum ada dokumen"}
            message={
              hasActiveFilters 
                ? "Coba ubah filter pencarian Anda atau hapus filter untuk melihat semua dokumen."
                : "Mulai dengan membuat dokumen BAPB atau BAPP baru."
            }
            icon={hasActiveFilters ? "🔍" : "📄"}
            actionButton={
              hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hapus Semua Filter
                </button>
              ) : (
                <button
                  onClick={() => navigate('/vendor/tambah-dokumen')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buat Dokumen Pertama
                </button>
              )
            }
          />
        )}
      </div>

      {/* Quick Actions Info */}
      {documents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">Informasi:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <span className="font-medium">Draft</span> bisa diedit, diajukan, atau dihapus</li>
            <li>• <span className="font-medium">Diajukan</span> tidak bisa diedit/dihapus, tunggu review PIC/Direksi</li>
            <li>• <span className="font-medium">BAPB</span> direview & disetujui oleh PIC Gudang</li>
            <li>• <span className="font-medium">BAPP</span> direview oleh PIC, disetujui oleh Direksi</li>
          </ul>
        </div>
      )}

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
                    // Refresh documents list
                    await fetchDocuments();
                    setDeleteModal({ isOpen: false, documentId: null, documentType: null, documentNumber: '', isDeleting: false });
                  } else {

                    setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                  }
                } catch (error) {
                  addNotification({
                    title: 'Penghapusan Gagal',
                    message: `Terjadi kesalahan saat menghapus dokumen: ${error.message}.`,
                    type: 'error',
                  });
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

export default DokumenSaya;