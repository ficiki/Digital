import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bapbService, uploadService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import AttachmentUploader from '../../components/common/AttachmentUploader'; // Import AttachmentUploader
import Modal from '../../components/common/modal'; // Import Modal

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TambahDokumenBAPB = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]); // New state for selected files from AttachmentUploader

  // Data form untuk semua tahap
  const [formData, setFormData] = useState({
    // Tahap 1 - Informasi Umum
    nomorDokumen: '', // Will be generated in useEffect
    namaVendor: user?.nama_lengkap || 'PT. Midi Utama Indonesia',
    noKontrak: '', // Will be generated in useEffect
    tanggalKontrak: '2024-01-25',
    nilaiKontrak: '285000000',
    tanggalPengiriman: '2025-02-14',
    lokasiPengiriman: 'Gudang Pusat, Jl. Sudirman No. 123, Jakarta',
    nama_projek: '',
    deskripsi_pekerjaan: '',
    hasil_pemeriksaan: '',

    // Tahap 2 - Rincian Barang
    rincianBarang: [
      {
        namaBarang: 'Komputer Desktop - Core i5, RAM 8GB, HDD 1TB, Monitor 21"',
        jumlah: 15,
        satuan: 'unit',
        hargaSatuan: 19000000,
        total: 285000000
      }
    ],
    
    // Tahap 3 - Dokumen Pendukung (handled by AttachmentUploader and a 'catatan' field)
    catatan: ''
  });

  // useEffect to generate initial values for nomorDokumen and noKontrak
  useEffect(() => {
    if (!formData.nomorDokumen) {
      const generatedNomorDokumen = 'BAPB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setFormData(prev => ({ ...prev, nomorDokumen: generatedNomorDokumen }));
    }
    if (!formData.noKontrak) {
      // Generate a simple contract number, e.g., PO-YYYYMMDD-RANDOM
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
      const generatedNoKontrak = `PO-${year}${month}${day}-${randomPart}`;
      setFormData(prev => ({ ...prev, noKontrak: generatedNoKontrak }));
    }
  }, [formData.nomorDokumen, formData.noKontrak]); // Dependencies ensure it runs only if values are missing

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleBarangChange = (index, field, value) => {
    const updatedBarang = [...formData.rincianBarang];
    updatedBarang[index] = {
      ...updatedBarang[index],
      [field]: value
    };
    
    if (field === 'jumlah' || field === 'hargaSatuan') {
      const jumlah = field === 'jumlah' ? parseInt(value) || 0 : updatedBarang[index].jumlah;
      const hargaSatuan = field === 'hargaSatuan' ? parseInt(value) || 0 : updatedBarang[index].hargaSatuan;
      updatedBarang[index].total = jumlah * hargaSatuan;
    }
    
    setFormData(prev => ({
      ...prev,
      rincianBarang: updatedBarang
    }));
  };

  const addBarang = () => {
    setFormData(prev => ({
      ...prev,
      rincianBarang: [
        ...prev.rincianBarang,
        {
          namaBarang: '',
          jumlah: 1,
          satuan: 'unit',
          hargaSatuan: 0,
          total: 0
        }
      ]
    }));
  };

  const removeBarang = (index) => {
    if (formData.rincianBarang.length > 1) {
      setFormData(prev => ({
        ...prev,
        rincianBarang: prev.rincianBarang.filter((_, i) => i !== index)
      }));
    }
  };


  const calculateTotalKontrak = () => {
    return formData.rincianBarang.reduce((total, barang) => total + barang.total, 0);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation for mandatory fields (example, adjust as per your form)
    if (formData.nomorDokumen.trim() === '') {
      setError('Nomor Dokumen tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.noKontrak.trim() === '') {
      setError('No Kontrak tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.nama_projek.trim() === '') {
      setError('Nama Proyek tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.deskripsi_pekerjaan.trim() === '') {
      setError('Deskripsi Pekerjaan tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.tanggalKontrak.trim() === '') {
      setError('Tanggal Kontrak tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (parseInt(formData.nilaiKontrak) <= 0) {
      setError('Nilai Kontrak harus lebih besar dari 0.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.tanggalPengiriman.trim() === '') {
      setError('Tanggal Pengiriman tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.lokasiPengiriman.trim() === '') {
      setError('Lokasi Pengiriman tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (formData.hasil_pemeriksaan.trim() === '') {
      setError('Hasil Pemeriksaan Awal tidak boleh kosong.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }

    if (formData.rincianBarang.length === 0) {
      setError('Rincian Barang tidak boleh kosong. Tambahkan setidaknya satu barang.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }

    for (const item of formData.rincianBarang) {
      if (item.namaBarang.trim() === '') {
        setError('Nama Barang tidak boleh kosong.');
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      if (item.jumlah <= 0) {
        setError('Jumlah barang harus lebih besar dari 0.');
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      if (item.hargaSatuan <= 0) {
        setError('Harga Satuan barang harus lebih besar dari 0.');
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      if (item.total <= 0) {
        setError('Total barang harus lebih besar dari 0.');
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
    }

    // Client-side validation for attachments
    if (selectedAttachments.length === 0) {
      setError('Lampiran dokumen tidak boleh kosong. Harap unggah setidaknya satu file.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // 1. Prepare data payload for BAPB creation
      const bapbPayload = {
        nomor_bapb: formData.nomorDokumen,
        no_kontrak: formData.noKontrak,
        nama_projek: formData.nama_projek,
        nilai_kontrak: parseInt(formData.nilaiKontrak),
        deskripsi_pekerjaan: formData.deskripsi_pekerjaan,
        tanggal_dibuat: new Date().toISOString(),
        tanggal_pengiriman: formData.tanggalPengiriman,
        rincian_barang: JSON.stringify(formData.rincianBarang),
        hasil_pemeriksaan: formData.hasil_pemeriksaan,
        catatan: formData.catatan,
        status: 'submitted', // Langsung diajukan
      };

      // 2. Create BAPB document
      const response = await bapbService.create(bapbPayload);
      const newBapbId = response.data.id;

      // 3. Upload supporting documents if any
      if (selectedAttachments.length > 0) {
        const uploadPromises = selectedAttachments.map(async (file) => {
          // Pass 'bapb' as jenis, newBapbId as id, and [file] as files (array of one file)
          return uploadService.upload('bapb', newBapbId, [file]);
        });
        await Promise.all(uploadPromises);
      }

      navigate('/vendor/dokumen-saya');

    } catch (error) {
      console.error('Failed to create BAPB:', error);
      setError(error.message || 'Gagal membuat dokumen BAPB. Silakan coba lagi.');
      setIsErrorModalOpen(true);

    } finally {
      setIsLoading(false);
    }
  };

  // Render Progress Bar
  const renderProgressBar = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-blue-600">
          {currentStep === 1 && 'Informasi Umum'}
          {currentStep === 2 && 'Rincian Barang'}
          {currentStep === 3 && 'Lampiran dan Catatan'}
        </div>
        <div className="text-sm text-gray-500">Tahap {currentStep} dari 3</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Tahap 1 - Informasi Umum
  const renderStep1 = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Vendor
              </label>
              <input
                type="text"
                value={formData.namaVendor}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Kontrak
              </label>
              <input
                type="text"
                value={formData.noKontrak}
                onChange={(e) => handleInputChange('noKontrak', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Projek
              </label>
              <input
                type="text"
                value={formData.nama_projek}
                onChange={(e) => handleInputChange('nama_projek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="cth: Pengadaan Komputer Kantor"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Pekerjaan
              </label>
              <input
                type="text"
                value={formData.deskripsi_pekerjaan}
                onChange={(e) => handleInputChange('deskripsi_pekerjaan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="cth: Menyediakan 15 unit komputer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Kontrak
              </label>
              <input
                type="date"
                value={formData.tanggalKontrak}
                onChange={(e) => handleInputChange('tanggalKontrak', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai Kontrak
              </label>
              <input
                type="text"
                value={formatCurrency(parseInt(formData.nilaiKontrak) || 0)}
                onChange={(e) => handleInputChange('nilaiKontrak', e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Pengiriman
              </label>
              <input
                type="date"
                value={formData.tanggalPengiriman}
                onChange={(e) => handleInputChange('tanggalPengiriman', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasil Pemeriksaan Awal (Vendor)
              </label>
              <textarea
                value={formData.hasil_pemeriksaan}
                onChange={(e) => handleInputChange('hasil_pemeriksaan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Contoh: Barang telah diperiksa dan sesuai dengan spesifikasi. Kondisi baik dan siap dikirim."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Pengiriman
              </label>
              <textarea
                value={formData.lokasiPengiriman}
                onChange={(e) => handleInputChange('lokasiPengiriman', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/tambah-dokumen')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lanjut ke Rincian Barang
          </button>
        </div>
      </div>
    </form>
  );

  // Tahap 2 - Rincian Barang
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">RINCIAN BARANG</h2>
          <button
            type="button"
            onClick={addBarang}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            + Tambah Barang
          </button>
        </div>

        <div className="space-y-4">
          {formData.rincianBarang.map((barang, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">Barang {index + 1}</h3>
                {formData.rincianBarang.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBarang(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    value={barang.namaBarang}
                    onChange={(e) => handleBarangChange(index, 'namaBarang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={barang.jumlah}
                    onChange={(e) => handleBarangChange(index, 'jumlah', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>
                  <select
                    value={barang.satuan}
                    onChange={(e) => handleBarangChange(index, 'satuan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="unit">Unit</option>
                    <option value="pcs">Pcs</option>
                    <option value="set">Set</option>
                    <option value="paket">Paket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Satuan
                  </label>
                  <input
                    type="number"
                    value={barang.hargaSatuan}
                    onChange={(e) => handleBarangChange(index, 'hargaSatuan', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(barang.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Kontrak */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">TOTAL KONTRAK:</span>
            <span className="text-xl font-bold text-blue-700">
              {formatCurrency(calculateTotalKontrak())}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={handlePrevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Kembali ke Informasi Umum
        </button>
        <button
          onClick={handleNextStep}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lanjut ke Lampiran
        </button>
      </div>
    </div>
  );

  // Tahap 3 - Dokumen Pendukung
  const renderStep3 = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Lampiran */}
        <AttachmentUploader
          jenisDokumen="bapb" // Or a more specific type if needed
          idDokumen={null} // ID will be available after BAPB creation
          onFilesSelected={setSelectedAttachments} // Callback to get selected files
          readOnly={false} // Allow uploads in this form
          required={true} // Mark as required
        />
        {/* Keterangan Tambahan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Catatan Tambahan</h2>
          <textarea
            value={formData.catatan}
            onChange={(e) => handleInputChange('catatan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Tambahkan catatan atau instruksi penting lainnya..."
          />
        </div>

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kembali ke Rincian Barang
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim BAPB'}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Berita Acara Pemeriksaan Barang (BAPB)</h1>
            <p className="text-gray-600 mt-1">
              {currentStep === 1 && 'Tahap 1: Informasi Dasar'}
              {currentStep === 2 && 'Tahap 2: Rincian Barang'}
              {currentStep === 3 && 'Tahap 3: Lampiran dan Catatan'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Nomor Dokumen</div>
            <div className="font-semibold text-gray-900">{formData.nomorDokumen}</div>
          </div>
        </div>

        {renderProgressBar()}
      </div>

      {/* Render Current Step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Terjadi Kesalahan"
      >
        <p className="text-gray-700">{error}</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsErrorModalOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TambahDokumenBAPB;
