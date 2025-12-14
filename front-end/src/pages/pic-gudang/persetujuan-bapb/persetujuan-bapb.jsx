import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Package, CheckCircle2, XCircle, Download } from 'lucide-react';
import { bapbService, uploadService, formatDate } from '../../../services/api';
import LoadingSpinner from '../../../components/common/loading-spinner';
import Modal from '../../../components/common/modal'; // Menggunakan komponen Modal umum
import { useNotification } from '../../../contexts/notification-context';

const PersetujuanBapb = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [dokumen, setDokumen] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [attachments, setAttachments] = useState([]); // State untuk dokumen pendukung
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { addNotification } = useNotification();


  useEffect(() => {
    const loadDokumen = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let docData;
        if (location.state?.dokumen) {
          docData = location.state.dokumen;
        } else {
          const response = await bapbService.getById(id);
          docData = response.data;
        }
        
        // Pastikan rincian_barang adalah array dan parse jika string
        if (typeof docData.rincian_barang === 'string') {
            docData.rincian_barang = JSON.parse(docData.rincian_barang);
        }

        setDokumen(docData);
        setBarangList(docData.rincian_barang || []);
        
        const attachmentsResponse = await uploadService.getAttachments('bapb', id);
        console.log('API attachments response:', attachmentsResponse); // Log the full response
        setAttachments(attachmentsResponse.data.data || []);
        console.log('Attachments state after setting:', attachmentsResponse.data.data || []); // Log the data being set to state

      } catch (err) {
        setError('Gagal memuat data dokumen. Mungkin dokumen tidak ditemukan atau ada masalah jaringan.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDokumen();
  }, [id, location.state]);

  const handleKembaliKeList = () => {
    navigate('/pic-gudang/persetujuan-bapb');
  };

  const handleSetujui = () => {
    setIsApprovalModalOpen(true);
    setApprovalNote('');
  };

  const handleKonfirmasiApproval = async () => {
    setIsApprovalModalOpen(false);
    setIsLoading(true);
    setError(null);
    try {
      await bapbService.approve(dokumen.id, { approval_note: approvalNote });
      navigate('/pic-gudang/persetujuan-bapb', {
        state: { message: `BAPB ${dokumen.nomor_bapb} berhasil disetujui.` }
      });
    } catch (err) {
      setError(err.message || 'Gagal menyetujui dokumen BAPB.');
      console.error(err);
      addNotification({
        title: 'Persetujuan Gagal',
        message: err.message || 'Gagal menyetujui dokumen BAPB.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTolak = () => {
    setIsRejectModalOpen(true);
    setRejectionReason('');
  };

  const handleKonfirmasiRejection = async () => {
    if (!rejectionReason.trim()) {
      addNotification({
        title: 'Validasi Gagal',
        message: 'Alasan penolakan harus diisi.',
        type: 'warning',
      });
      return;
    }
    setIsRejectModalOpen(false);
    setIsLoading(true);
    setError(null);
    try {
      await bapbService.reject(dokumen.id, { rejection_reason: rejectionReason });
      navigate('/pic-gudang/persetujuan-bapb', {
        state: { message: `BAPB ${dokumen.nomor_bapb} berhasil ditolak.` }
      });
    } catch (err) {
      setError(err.message || 'Gagal menolak dokumen BAPB.');
      console.error(err);
      addNotification({
        title: 'Penolakan Gagal',
        message: err.message || 'Gagal menolak dokumen BAPB.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (attachmentId, filename) => {
    try {
        const response = await uploadService.downloadLampiran(attachmentId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (err) {
        addNotification({
            title: 'Unduhan Gagal',
            message: 'Gagal mengunduh lampiran. Silakan coba lagi.',
            type: 'error',
        });
        console.error('Download error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500">
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Kembali
            </button>
        </div>
    );
  }

  if (!dokumen) {
    return null; 
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={handleKembaliKeList}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Kembali ke Daftar Dokumen</span>
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Persetujuan BAPB: {dokumen.nomor_bapb}</h1>
        <p className="text-gray-500 mt-1">Review hasil pengecekan dan lakukan persetujuan</p>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Overview & List Barang */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Dokumen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Overview Dokumen</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nomor BAPB</p>
                <p className="font-semibold text-gray-900">{dokumen.nomor_bapb}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Nama Proyek</p>
                <p className="font-semibold text-gray-900">{dokumen.nama_projek}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Deskripsi Pekerjaan</p>
                <p className="text-gray-700">{dokumen.deskripsi_pekerjaan}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium text-gray-900">{dokumen.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                  <p className="font-medium text-gray-900">{formatDate(dokumen.tanggal_dibuat)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dokumen Pendukung */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dokumen Pendukung</h2>
            <div className="space-y-3">
              {attachments.length > 0 ? (
                attachments.map((dok) => (
                  <div 
                    key={dok.id_lampiran} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{dok.nama_file_asli}</p>
                        <p className="text-sm text-gray-500">{dok.jenis_file}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(dok.id_lampiran, dok.nama_file_asli)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title={`Download ${dok.nama_file_asli}`}
                    >
                      <Download size={20} className="text-blue-600" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada dokumen pendukung.</p>
              )}
            </div>
          </div>

          {/* List Barang - Hasil Pengecekan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">List Barang - Hasil Pengecekan PIC</h2>
            </div>

            <div className="space-y-4">
              {barangList.map((barang, index) => (
                <div 
                  key={index} // Use index if no unique ID from rincian_barang
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Check Icon */}
                    {barang.checked ? (
                        <CheckCircle2 className="mt-1 text-green-600 flex-shrink-0" size={20} />
                    ) : (
                        <XCircle className="mt-1 text-red-600 flex-shrink-0" size={20} />
                    )}

                    {/* Info Barang */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{barang.namaBarang}</h3>
                          <p className="text-sm text-gray-600">
                            {barang.jumlah} {barang.satuan}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{barang.spesifikasi}</p>

                      {/* Display Catatan */}
                      {barang.catatan_pic && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Catatan Pengecekan PIC:</p>
                            <p className="text-sm text-gray-700">
                              {barang.catatan_pic}
                            </p>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="lg:col-span-1">
          <div className="space-y-6 sticky top-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tindakan</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleSetujui}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  {isLoading ? 'Menyetujui...' : 'Setujui BAPB'}
                </button>

                <button
                  onClick={handleTolak}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  {isLoading ? 'Menolak...' : 'Tolak BAPB'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Status Saat Ini</h3>
              
              <div className="space-y-3">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {dokumen.status}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                  <p className="font-semibold text-gray-900">{formatDate(dokumen.tanggal_dibuat)}</p>
                </div>

                {dokumen.tanggal_review && (
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Review</p>
                    <p className="font-semibold text-gray-900">{formatDate(dokumen.tanggal_review)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">No Kontrak</p>
                  <p className="font-semibold text-gray-900">{dokumen.no_kontrak}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Catatan PIC (Saat Pengecekan)</p>
                  <p className="font-semibold text-gray-900">{dokumen.catatan_pic || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Approval */}
      <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} title="Setujui BAPB">
        <p className="text-gray-600 mb-6">
          Anda yakin ingin menyetujui BAPB <span className="font-semibold">{dokumen?.nomor_bapb}</span>?
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan Persetujuan (Opsional)
          </label>
          <textarea
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Tambahkan catatan..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsApprovalModalOpen(false)}
            className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleKonfirmasiApproval}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Menyetujui...' : 'Konfirmasi Setuju'}
          </button>
        </div>
      </Modal>

      {/* Modal Penolakan */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Tolak BAPB">
        <p className="text-gray-600 mb-6">
          Anda yakin ingin menolak BAPB <span className="font-semibold">{dokumen?.nomor_bapb}</span>?
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alasan Penolakan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Mohon berikan alasan penolakan..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleKonfirmasiRejection}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            disabled={isLoading || !rejectionReason.trim()}
          >
            {isLoading ? 'Menolak...' : 'Konfirmasi Tolak'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PersetujuanBapb;