// pages/pic-gudang/dokumen-overview/dokumen-overview-detail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, DollarSign, Calendar, User, Download as DownloadIcon } from 'lucide-react';
import Modal from '../../../components/common/modal';
import { bapbService, uploadService, formatDate } from '../../../services/api';
import { useNotification } from '../../../contexts/notification-context';
import AttachmentUploader from '../../../components/common/AttachmentUploader'; // Import AttachmentUploader

const DokumenOverviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bapbData, setBapbData] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false); // State untuk modal
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchBapbDetail();
  }, [id]);

  const fetchBapbDetail = async () => {
          try {
            setLoading(true);
            const response = await bapbService.getById(id);
            setBapbData(response.data);
          } catch (error) {
            console.error('Error fetching BAPB detail:', error);
            // Optionally, set an error state or show a user-friendly message
            setBapbData(null); // Clear data on error
          } finally {
            setLoading(false);
          }  };

  const handleDownloadSurat = () => {
    setShowDownloadModal(true); // Buka modal konfirmasi unduhan
  };

  const confirmDownload = async () => {
    try {
      console.log('Mencoba mengunduh surat BAPB dengan ID:', bapbData.id);
      // Asumsi: Backend dapat menghasilkan surat BAPB berdasarkan ID BAPB
      const response = await bapbService.downloadBapb(bapbData.id);
      
      const filename = `Surat_BAPB_${bapbData.nomor_bapb}.pdf`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        title: 'Unduhan Berhasil',
        message: `Surat BAPB "${filename}" berhasil diunduh!`,
        type: 'success',
      });
      setShowDownloadModal(false); // Tutup modal setelah konfirmasi
    } catch (error) {
      console.error('Gagal mengunduh surat BAPB:', error);
      addNotification({
        title: 'Unduhan Gagal',
        message: 'Terjadi kesalahan saat mengunduh surat BAPB. Silakan coba lagi.',
        type: 'error',
      });
      setShowDownloadModal(false); // Tutup modal meskipun ada error
    }
  };

  const handleDownloadDokumen = (dokumen) => {
    console.log('Downloading:', dokumen);
    addNotification({
      title: 'Mengunduh Dokumen',
      message: `Sedang mengunduh ${dokumen.nama}...`,
      type: 'info',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!bapbData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Data BAPB tidak ditemukan</p>
        <button
          onClick={() => navigate('/pic-gudang/dokumen-overview')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali ke List
        </button>
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (bapbData.status === 'approved') {
      return {
        icon: <CheckCircle size={24} className="text-green-600" />,
        badge: (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={18} />
            Disetujui
          </span>
        ),
        color: 'green',
        title: 'BAPB Disetujui',
        bgColor: 'border-green-200'
      };
    } else {
      return {
        icon: <XCircle size={24} className="text-red-600" />,
        badge: (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle size={18} />
            Ditolak
          </span>
        ),
        color: 'red',
        title: 'BAPB Ditolak',
        bgColor: 'border-red-200'
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/pic-gudang/dokumen-overview')}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Kembali ke List</span>
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bapbData.nomor_bapb}</h1>
          <p className="text-gray-500 mt-1">Detail lengkap dokumen BAPB</p>
        </div>
        <div>
          {statusDisplay.badge}
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">No. BAPB</p>
              <p className="font-semibold text-gray-900 text-sm">{bapbData.nomor_bapb}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tanggal Review</p>
              <p className="font-semibold text-gray-900 text-sm">{formatDate(bapbData.tanggal_review)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vendor</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{bapbData.vendor_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Pengadaan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview Dokumen</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nama Projek</label>
                <p className="text-gray-900 mt-1">{bapbData.nama_projek}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                <p className="text-gray-700 mt-1 leading-relaxed">{bapbData.deskripsi_pekerjaan}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">Daftar Barang</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nama Barang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bapbData.rincian_barang && bapbData.rincian_barang.map((barang, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{barang.nama_barang}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{barang.jumlah}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{barang.satuan}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatDate(bapbData.tanggal_review)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Attachment Uploader in Read-Only Mode */}
          <AttachmentUploader
            jenisDokumen="bapb" // Specify document type
            idDokumen={bapbData.id} // Pass the BAPB ID
            readOnly={true} // Display in read-only mode
          />
        </div>

        {/* Sidebar - Info & Download */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Download Surat</h3>

              <button
                onClick={handleDownloadSurat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <DownloadIcon size={20} />
                <span>Download Surat BAPB</span>
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                File: Surat_BAPB_{bapbData.nomor_bapb}.pdf
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Informasi</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">
                    {statusDisplay.badge}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Tanggal Pengajuan</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">{new Date(bapbData.tanggal_dibuat).toLocaleDateString('id-ID')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Tanggal Review</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">{formatDate(bapbData.tanggal_review)}</p>
                </div>

                {/* <div>
                  <p className="text-xs text-gray-500">Reviewer</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">N/A</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Confirmation Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Konfirmasi Unduh Surat BAPB"
      >
        <p className="text-gray-700 mb-6">
          Anda yakin ingin mengunduh surat BAPB dengan nomor{' '}
          <span className="font-semibold">{bapbData?.nomor_bapb}</span>?
          File akan diunduh sebagai <span className="font-semibold">Surat_BAPB_{bapbData?.nomor_bapb}.pdf</span>.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDownloadModal(false)}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Batalkan
          </button>
          <button
            onClick={confirmDownload}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Unduh Sekarang
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DokumenOverviewDetail;
