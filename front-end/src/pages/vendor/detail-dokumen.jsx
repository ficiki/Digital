import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bapbService, bappService, uploadService } from '../../services/api'; // Added uploadService
import useAuth from '../../hooks/useAuth'; // Import useAuth hook
import { useNotification } from '../../contexts/notification-context'; // Import useNotification

const DetailDokumen = () => {

  const { type, id } = useParams();

  const navigate = useNavigate();

  const [documentData, setDocumentData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [attachments, setAttachments] = useState([]); // New state for attachments

  const [attachmentsLoading, setAttachmentsLoading] = useState(true); // New state for attachment loading

  const { user, token } = useAuth(); // Get the token and user from useAuth

  const { addNotification } = useNotification();



  const fetchAttachments = async () => {

    try {

      setAttachmentsLoading(true);

      const response = await uploadService.getAttachments(type, id);

      setAttachments(response.data.data); // Assuming response.data.data contains the array of attachments

    } catch (err) {

      console.error('Failed to fetch attachments:', err);

      // Optionally, set an error state specific to attachments

      addNotification({

        title: 'Gagal Memuat Lampiran',

        message: err.message || 'Terjadi kesalahan saat memuat lampiran.',

        type: 'error',

      });

    } finally {

      setAttachmentsLoading(false);

    }

  };



  useEffect(() => {

    const fetchDocumentDetail = async () => {

      try {

        setLoading(true);

        setError(null);

        let response;

        if (type === 'bapb') {

          response = await bapbService.getById(id);

        } else if (type === 'bapp') {

          response = await bappService.getById(id);

        } else {

          throw new Error('Invalid document type provided in URL.');

        }

        console.log("API Response for document detail:", response); // Add this line

        setDocumentData(response.data);

      } catch (err) {

        console.error('Failed to fetch document detail:', err);

        setError(err.message || 'Gagal memuat detail dokumen.');

        addNotification({

          title: 'Gagal Memuat Dokumen',

          message: err.message || 'Terjadi kesalahan saat memuat detail dokumen.',

          type: 'error',

        });

      } finally {

        setLoading(false);

      }

    };



    if (id && type) {

      fetchDocumentDetail();

      fetchAttachments(); // Fetch attachments when document detail is fetched

    }

  }, [type, id]);



  // New useEffect to fetch attachments - Merged into the main useEffect to avoid double fetching for now

  // useEffect(() => {

  //   if (id && type) {

  //     fetchAttachments();

  //   }

  // }, [type, id]);





  const handleDownloadAttachment = async (attachmentId, originalFileName) => {

    try {

      const response = await uploadService.downloadLampiran(attachmentId);

      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', originalFileName);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      addNotification({

        title: 'Unduh Berhasil',

        message: `Lampiran "${originalFileName}" berhasil diunduh.`,

        type: 'success',

      });

    } catch (err) {

      console.error('Error downloading attachment:', err);

      addNotification({

        title: 'Unduh Gagal',

        message: err.message || 'Terjadi kesalahan saat mengunduh lampiran.',

        type: 'error',

      });

    }

  };



  const handleDeleteAttachment = async (attachmentId) => {

    if (!window.confirm('Apakah Anda yakin ingin menghapus lampiran ini?')) {

      return;

    }

    try {

      await uploadService.deleteLampiran(attachmentId);

      addNotification({

        title: 'Hapus Berhasil',

        message: 'Lampiran berhasil dihapus.',

        type: 'success',

      });

      fetchAttachments(); // Re-fetch attachments after deletion

    } catch (err) {

      console.error('Error deleting attachment:', err);

      addNotification({

        title: 'Hapus Gagal',

        message: err.message || 'Terjadi kesalahan saat menghapus lampiran.',

        type: 'error',

      });

    }

  };



  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColorGlobal = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'DISETUJUI';
      case 'pending': return 'PENDING';
      case 'rejected': return 'DITOLAK';
      case 'draft': return 'DRAFT';
      default: return 'UNKNOWN';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadPdf = async () => { // Made async
    if (!documentData || !documentData.type || !documentData.id) {
      addNotification({
        title: 'Unduhan Gagal',
        message: 'Dokumen tidak lengkap untuk diunduh.',
        type: 'error',
      });
      return;
    }
    if (!token) {
      addNotification({
        title: 'Autentikasi Diperlukan',
        message: 'Anda tidak terautentikasi untuk mengunduh dokumen ini.',
        type: 'error',
      });
      navigate('/login'); // Redirect to login if no token
      return;
    }

    const pdfUrl = `/api/${documentData.type}/download/${documentData.id}`;
    
    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the authorization token
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          addNotification({
            title: 'Izin Tidak Cukup',
            message: 'Anda tidak memiliki izin untuk mengunduh dokumen ini. Silakan login kembali.',
            type: 'error',
          });
          navigate('/login');
          return;
        }
        throw new Error(`Server responded with status ${response.status}`);
      }

      const blob = await response.blob();
      const filename = `${documentData.type.toUpperCase()}-${documentData.nomor_bapp || documentData.nomor_bapb || documentData.id}.pdf`;

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up the object URL

      addNotification({
        title: 'Unduhan Berhasil',
        message: `Dokumen "${filename}" berhasil diunduh!`,
        type: 'success',
      });

    } catch (err) {
      console.error('Error downloading PDF:', err);
      addNotification({
        title: 'Unduhan Gagal',
        message: 'Gagal mengunduh PDF: ' + (err.message || 'Terjadi kesalahan tidak dikenal.'),
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex justify-center items-center">
        <p className="text-gray-700">Memuat detail dokumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-red-600">
          <p className="font-semibold mb-2">Terjadi kesalahan:</p>
          <p>{error}</p>
          <button
            onClick={() => navigate('/vendor/dokumen-saya')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-700">
          <p className="font-semibold mb-2">Dokumen tidak ditemukan.</p>
          <button
            onClick={() => navigate('/vendor/dokumen-saya')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header dengan Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/vendor/dokumen-saya')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <span className="mr-2">←</span>
            Kembali ke Dokumen Saya
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Dokumen</h1>
                <p className="text-gray-600 mt-1">No. Dokumen: <span className="font-mono">{documentData?.id}</span></p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColorGlobal(documentData?.status)}`}>
                  {getStatusLabel(documentData?.status)}
                </span>
                <p className="text-sm text-gray-500 mt-1">Terakhir ditangani: {documentData?.picTerakhir}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - FULL WIDTH */}
        <div className="space-y-6">
          
          {/* Informasi Dokumen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dokumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Projek</label>
                  <p className="text-gray-900 font-medium">{documentData?.judul}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    documentData?.type === 'bapb' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {documentData?.type?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Kontrak</label>
                  <p className="text-gray-900 font-medium">{documentData?.nilai}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Surat Pesanan</label>
                  <p className="text-gray-900">{documentData?.nomorSuratPesanan}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dibuat</label>
                  <p className="text-gray-900">{formatDate(documentData?.created_at || documentData?.tanggalDibuat)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <p className="text-gray-900">{formatDate(documentData?.deadline)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Persetujuan</h2>
            <div className="space-y-4">
             {documentData?.timeline
                ?.slice() // Create a shallow copy to avoid modifying the original array
                .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)) // Sort by date ascending
                .map((step, index) => (
                <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg border ${getStatusColor(step.status)}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-600 text-white' :
                    step.status === 'current' ? 'bg-blue-600 text-white' :
                    step.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {step.status === 'completed' ? '✓' : 
                     step.status === 'current' ? '⋯' :
                     step.status === 'rejected' ? '✕' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{step.action}</p>
                        <p className="text-sm text-gray-600">Oleh: {step.oleh}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDateTime(step.tanggal)}</span>
                    </div>
                    {step.catatan && (
                      <p className="text-sm text-gray-600 mt-2 bg-white bg-opacity-50 p-2 rounded">
                        <strong>Catatan:</strong> {step.catatan}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lampiran Dokumen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lampiran Dokumen</h2>
            {attachmentsLoading ? (
              <p className="text-gray-700">Memuat lampiran...</p>
            ) : attachments.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada lampiran yang ditambahkan.</p>
            ) : (
              <div className="space-y-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id_lampiran} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-gray-900">{attachment.nama_file_asli}</p>
                      <p className="text-sm text-gray-600">
                        {(attachment.ukuran / 1024).toFixed(2)} KB - Diunggah pada {formatDateTime(attachment.uploaded_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadAttachment(attachment.id_lampiran, attachment.nama_file_asli)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Unduh
                      </button>
                      {documentData?.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id_lampiran)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PREVIEW DOKUMEN */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Dokumen</h2>
            <div className="bg-gray-50 rounded-lg p-8">
              {/* Header Preview */}
              <div className="text-center mb-8 border-b pb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {documentData?.type === 'bapb' ? 'BERITA ACARA PEMERIKSAAN BARANG' : 'BERITA ACARA PEMERIKSAAN PEKERJAAN'}
                </h3>
                <p className="text-gray-600">Nomor: {documentData?.judul}</p>
              </div>

              {/* Content Preview */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Nama Projek:</p>
                    <p className="text-gray-700">{documentData?.judul}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Nilai Kontrak:</p>
                    <p className="text-gray-700">{documentData?.nilai}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-2">Deskripsi:</p>
                  <p className="text-gray-700 leading-relaxed">
                    {documentData?.type === 'bapb' 
                      ? documentData?.deskripsi_pekerjaan // Assuming deskripsi_pekerjaan for BAPB
                      : documentData?.hasil_pemeriksaan // For BAPP
                    }
                  </p>
                </div>

                {/* Item Details */}
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 mb-3">Rincian:</p>
                  <div className="bg-white rounded-lg p-4 border">
                    {documentData?.type === 'bapp' && documentData?.rincian_pekerjaan && documentData.rincian_pekerjaan.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {documentData.rincian_pekerjaan.map((item, index) => (
                          <li key={index}>
                            {item.item} - {item.jumlah} {item.satuan} @ {formatCurrency(item.harga_satuan)} (Total: {formatCurrency(item.total)})
                          </li>
                        ))}
                      </ul>
                    ) : documentData?.type === 'bapb' && documentData?.rincian_barang && documentData.rincian_barang.length > 0 ? ( // Assuming rincian_barang for BAPB
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {documentData.rincian_barang.map((item, index) => (
                          <li key={index}>
                            {item.item} - {item.jumlah} {item.satuan}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Tidak ada rincian yang tersedia.</p>
                    )}
                  </div>
                </div>

                {/* Signature Area */}
                <div className="mt-12 pt-8 border-t">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-12">Vendor</p>
                      <p className="text-gray-600">(___________________)</p>
                      <p className="text-sm text-gray-500 mt-2">Nama & Cap Perusahaan</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-12">
                        {documentData?.type === 'bapb' ? 'PIC Gudang' : 'Direksi Pekerjaan'}
                      </p>
                      {documentData?.type === 'bapb' && documentData?.status === 'approved' && documentData?.pic_signed_at ? (
                        <div className="text-gray-600">
                          <p>Ditandatangani oleh PIC Gudang</p>
                          <p className="text-sm text-gray-500 mt-1">Pada: {formatDateTime(documentData.pic_signed_at)}</p>
                        </div>
                      ) : documentData?.type === 'bapp' && documentData?.status === 'approved_direksi' && documentData?.direksi_signed_at ? (
                        <div className="text-gray-600">
                          <p>Ditandatangani oleh Direksi</p>
                          <p className="text-sm text-gray-500 mt-1">Pada: {formatDateTime(documentData.direksi_signed_at)}</p>
                        </div>
                      ) : (
                        <p className="text-gray-600">(___________________)</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">Nama & Tanda Tangan</p>
                    </div>
                  </div>
                </div>

                {/* Date & Place */}
                <div className="text-center mt-8">
                  <p className="text-gray-700">
                    Samarinda, {formatDate(documentData?.tanggalDibuat)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons untuk Preview */}
            <div className="flex justify-center space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={handleDownloadPdf}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDokumen;
