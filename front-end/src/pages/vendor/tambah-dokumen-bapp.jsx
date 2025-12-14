import React, { useState, useEffect } from 'react'; // Make sure useEffect is imported
import { useNavigate } from 'react-router-dom';
import { bappService, uploadService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import AttachmentUploader from '../../components/common/AttachmentUploader';
import Lampiran from '../../components/vendor/Lampiran'; // Import Lampiran

const TambahDokumenBAPP = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filesForUploadService, setFilesForUploadService] = useState([]);
  
  // Data form untuk semua tahap
  const [formData, setFormData] = useState({
    // Lampiran
    lampiranFile: null,
    keteranganLampiran: '',

    // Tahap 1 - Informasi Umum
    nomorDokumen: '', // Will be generated in useEffect
    namaVendor: user?.nama_lengkap || 'PT. Karya Mandiri Konstruksi',
    noKontrak: '', // Will be generated in useEffect
    tanggalKontrak: '2023-08-15',
    nilaiKontrak: '2450000000',
    lokasiPekerjaan: 'Jl. Menteng Raya No. 15, Jakarta Pusat',
    hasil_pemeriksaan: '',
    deadline: '', // Add deadline field
    
    // Tahap 2 - Rincian Pekerjaan
    rincianPekerjaan: [
      {
        item: 'Pengecatan ulang gedung kantor 5 lantai',
        jumlah: 1,
        satuan: 'paket',
        harga_satuan: 2450000000,
        total: 2450000000
      }
    ],
    
    // Tahap 3 - Dokumen Pendukung
    keterangan: ''
  });

  // useEffect to generate initial values for nomorDokumen and noKontrak
  useEffect(() => {
    if (!formData.nomorDokumen) {
      const generatedNomorDokumen = 'BAPP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setFormData(prev => ({ ...prev, nomorDokumen: generatedNomorDokumen }));
    }
    if (!formData.noKontrak) {
      // Generate a simple contract number, e.g., SPK-YYYYMMDD-RANDOM
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
      const generatedNoKontrak = `SPK-${year}${month}${day}-${randomPart}`;
      setFormData(prev => ({ ...prev, noKontrak: generatedNoKontrak }));
    }
  }, [formData.nomorDokumen, formData.noKontrak]); // Dependencies ensure it runs only if values are missing


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      lampiranFile: e.target.files[0]
    }));
  };

  const handleKeteranganChange = (e) => {
    setFormData(prev => ({
      ...prev,
      keteranganLampiran: e.target.value
    }));
  };

  const handlePekerjaanChange = (index, field, value) => {
    const updatedPekerjaan = [...formData.rincianPekerjaan];
    updatedPekerjaan[index] = {
      ...updatedPekerjaan[index],
      [field]: value
    };
    
    if (field === 'jumlah' || field === 'harga_satuan') {
      const jumlah = field === 'jumlah' ? parseInt(value) || 0 : updatedPekerjaan[index].jumlah;
      const harga_satuan = field === 'harga_satuan' ? parseInt(value) || 0 : updatedPekerjaan[index].harga_satuan;
      updatedPekerjaan[index].total = jumlah * harga_satuan;
    }
    
    setFormData(prev => ({
      ...prev,
      rincianPekerjaan: updatedPekerjaan
    }));
  };

  const addPekerjaan = () => {
    setFormData(prev => ({
      ...prev,
      rincianPekerjaan: [
        ...prev.rincianPekerjaan,
        {
          item: '', // Renamed from uraianPekerjaan
          jumlah: 1,
          satuan: 'paket',
          harga_satuan: 0,
          total: 0
        }
      ]
    }));
  };

  const removePekerjaan = (index) => {
    if (formData.rincianPekerjaan.length > 1) {
      setFormData(prev => ({
        ...prev,
        rincianPekerjaan: prev.rincianPekerjaan.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotalKontrak = () => {
    return formData.rincianPekerjaan.reduce((total, pekerjaan) => total + pekerjaan.total, 0);
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

    // Client-side validation for required string fields
    if (formData.nomorDokumen.trim() === '') {
      setError('Nomor Dokumen tidak boleh kosong.');
      setIsLoading(false);
      return;
    }
    if (formData.noKontrak.trim() === '') {
      setError('No Kontrak tidak boleh kosong.');
      setIsLoading(false);
      return;
    }
    if (formData.lokasiPekerjaan.trim() === '') {
      setError('Lokasi Pekerjaan tidak boleh kosong.');
      setIsLoading(false);
      return;
    }
    if (formData.hasil_pemeriksaan.trim() === '') {
      setError('Hasil Pemeriksaan Pekerjaan tidak boleh kosong.');
      setIsLoading(false);
      return;
    }
    
    // Client-side validation for numeric fields
    if (parseInt(formData.nilaiKontrak) <= 0) {
      setError('Nilai Kontrak harus lebih besar dari 0.');
      setIsLoading(false);
      return;
    }

    if (formData.rincianPekerjaan.length === 0) {
      setError('Rincian Pekerjaan tidak boleh kosong. Tambahkan setidaknya satu pekerjaan.');
      setIsLoading(false);
      return;
    }

    for (const item of formData.rincianPekerjaan) {
      if (item.item.trim() === '') { // Changed from item.uraianPekerjaan.trim()
        setError('Uraian Pekerjaan tidak boleh kosong.');
        setIsLoading(false);
        return;
      }
      if (item.jumlah <= 0) {
        setError('Jumlah pekerjaan harus lebih besar dari 0.');
        setIsLoading(false);
        return;
      }
      if (item.harga_satuan <= 0) {
        setError('Harga Satuan pekerjaan harus lebih besar dari 0.');
        setIsLoading(false);
        return;
      }
      if (item.total <= 0) {
        setError('Total pekerjaan harus lebih besar dari 0.');
        setIsLoading(false);
        return;
      }
    }

    // Client-side validation for lampiranFile
    if (!formData.lampiranFile) {
      setError('Lampiran dokumen tidak boleh kosong. Harap unggah file.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Upload lampiran file if it exists
      let lampiranUrl = '';
      if (formData.lampiranFile) {
        const uploadData = new FormData();
        uploadData.append('file', formData.lampiranFile);
        const uploadResponse = await uploadService.upload(uploadData);
        lampiranUrl = uploadResponse.data.url; // Assuming the API returns the URL of the uploaded file
      }

      // 2. Prepare BAPP payload
      const bappPayload = {
        nomor_bapp: formData.nomorDokumen,
        no_kontrak: formData.noKontrak,
        tanggal_kontrak: formData.tanggalKontrak,
        nilai_kontrak: parseInt(formData.nilaiKontrak) || 0, // Ensure it's a number, default to 0
        lokasi_pekerjaan: formData.lokasiPekerjaan,
        rincian_pekerjaan: formData.rincianPekerjaan.map(item => ({
          item: item.item,
          jumlah: item.jumlah || 0,
          satuan: item.satuan,
          harga_satuan: item.harga_satuan || 0,
          total: item.total || 0
        })),
        hasil_pemeriksaan: formData.hasil_pemeriksaan,
        keterangan: formData.keterangan,
        deadline: formData.deadline, // Include deadline in payload
        lampiran: lampiranUrl,
        keterangan_lampiran: formData.keteranganLampiran,
        // status: 'submitted', // Backend defaults to 'draft' and handles status transitions
      };
      
      console.log('Sending BAPP Payload:', bappPayload); // Debugging line

      // 3. Create BAPP document
      const response = await bappService.create(bappPayload);
      const newBappId = response.data.id;

      // 4. Upload files if any
      if (filesForUploadService.length > 0) {
        await uploadService.upload('bapp', newBappId, filesForUploadService);
      }


      navigate('/vendor/dokumen-saya');

    } catch (error) {
      console.error('Failed to create BAPP:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat dokumen BAPP. Silakan coba lagi.';
      const errorDetails = error.response?.data?.details ? error.response.data.details.map(d => d.message).join(', ') : '';
      setError(errorMessage + (errorDetails ? ` (${errorDetails})` : ''));

    } finally {
      setIsLoading(false);
    }
  };

  // Render Progress Bar
  const renderProgressBar = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-green-600">
          {currentStep === 1 && 'Informasi Umum'}
          {currentStep === 2 && 'Rincian Pekerjaan'}
          {currentStep === 3 && 'Lampiran dan Keterangan'}
        </div>
        <div className="text-sm text-gray-500">Tahap {currentStep} dari 3</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Pekerjaan
              </label>
              <textarea
                value={formData.lokasiPekerjaan}
                onChange={(e) => handleInputChange('lokasiPekerjaan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasil Pemeriksaan Pekerjaan (Vendor)
              </label>
              <textarea
                value={formData.hasil_pemeriksaan}
                onChange={(e) => handleInputChange('hasil_pemeriksaan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Contoh: Pekerjaan telah diselesaikan 100% sesuai spesifikasi kontrak. Hasil pengecatan rapi dan telah diuji."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Pekerjaan
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                // required // Consider if deadline is always required or optional based on backend schema
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
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Lanjut ke Rincian Pekerjaan
          </button>
        </div>
      </div>
    </form>
  );

  // Tahap 2 - Rincian Pekerjaan
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">RINCIAN PEKERJAAN</h2>
          <button
            type="button"
            onClick={addPekerjaan}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            + Tambah Pekerjaan
          </button>
        </div>

        <div className="space-y-4">
          {formData.rincianPekerjaan.map((pekerjaan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">Pekerjaan {index + 1}</h3>
                {formData.rincianPekerjaan.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePekerjaan(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Uraian Pekerjaan
                                  </label>
                                  <textarea
                                    value={pekerjaan.item}
                                    onChange={(e) => handlePekerjaanChange(index, 'item', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    rows="3"
                                    required
                                  />
                                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={pekerjaan.jumlah}
                    onChange={(e) => handlePekerjaanChange(index, 'jumlah', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>
                  <select
                    value={pekerjaan.satuan}
                    onChange={(e) => handlePekerjaanChange(index, 'satuan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="paket">Paket</option>
                    <option value="unit">Unit</option>
                    <option value="m2">M²</option>
                    <option value="m3">M³</option>
                    <option value="hari">Hari</option>
                    <option value="bulan">Bulan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Satuan
                  </label>
                  <input
                    type="number"
                    value={pekerjaan.harga_satuan}
                    onChange={(e) => handlePekerjaanChange(index, 'harga_satuan', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(pekerjaan.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Kontrak */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">TOTAL KONTRAK:</span>
            <span className="text-xl font-bold text-green-700">
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
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        <Lampiran
          onFileChange={handleFileChange}
          onKeteranganChange={handleKeteranganChange}
          required={true} // Mark as required
        />
        {/* Keterangan Tambahan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Catatan Tambahan</h2>
          <textarea
            value={formData.keterangan}
            onChange={(e) => handleInputChange('keterangan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            Kembali ke Rincian Pekerjaan
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim BAPP'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </form>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Berita Acara Pemeriksaan Pekerjaan (BAPP)</h1>
            <p className="text-gray-600 mt-1">
              {currentStep === 1 && 'Tahap 1: Informasi Dasar'}
              {currentStep === 2 && 'Tahap 2: Rincian Pekerjaan'}
              {currentStep === 3 && 'Tahap 3: Lampiran dan Keterangan'}
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
    </div>
  );
};

// Helper function for currency formatting (assuming it exists elsewhere or needs to be added)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default TambahDokumenBAPP;
