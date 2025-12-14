import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ✅ PERBAIKI PATH IMPORT - Gunakan path yang benar dari struktur Anda
import Modal from '../../components/common/modal';
import LoadingSpinner from '../../components/common/loading-spinner';
import AttachmentUploader from '../../components/common/AttachmentUploader'; 
import api, { uploadService } from '../../services/api'; // TAMBAHKAN INI
import { mapBAPBFieldsToBackend, mapBAPPFieldsToBackend } from '../../utils/fieldMapper'; // TAMBAHKAN INI


const FormTambahDokumen = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data form yang disesuaikan berdasarkan type
  const [formData, setFormData] = useState({
    // Step 1: Informasi Dasar (Umum untuk BAPB & BAPP)
    noDokumen: '',
    nomorSuratPesanan: '',
    projek: '',
    nilaiKontrak: '',
    deskripsiPekerjaan: '',
    tanggalDibuat: new Date().toISOString().split('T')[0],
    deadline: '',
    
    // Step 2: Detail (Spesifik berdasarkan type)
    items: [{
      nama_barang: '',
      jumlah: '',
      satuan: '',
      spesifikasi: '',
      keterangan: '',
      // Field tambahan untuk BAPB
                ...(type === 'bapb' && { kondisi: 'Baik' }),
                // Field tambahan untuk BAPP  
                ...(type === 'bapp' && { progress: '', harga_satuan: '', total: '' })    }],
    
    // Step 3: Lampiran
    attachments: [],
    catatanTambahan: '',

    // Field khusus BAPB
    ...(type === 'bapb' && {
      tanggalPengiriman: new Date().toISOString().split('T')[0],
      kurirPengiriman: '',
      hasilPemeriksaan: 'Sesuai'
    }),

    // Field khusus BAPP
    ...(type === 'bapp' && {
      lokasiPekerjaan: '',
      periodePekerjaan: { start: '', end: '' },
      statusPekerjaan: 'Selesai',
      tanggalKontrak: ''
    })
  });

  // Generate document number
  const generateDocNumber = () => {
    const prefix = type === 'bapb' ? 'BAPB' : 'BAPP';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${randomNum}`;
  };

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      noDokumen: generateDocNumber()
    }));
  }, [type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = (field === 'jumlah' || field === 'harga_satuan') ? Number(value) : value;

    // Calculate total if BAPP and relevant fields are numbers
    if (type === 'bapp' && (field === 'jumlah' || field === 'harga_satuan')) {
      const jumlah = Number(updatedItems[index].jumlah);
      const harga_satuan = Number(updatedItems[index].harga_satuan);
      if (!isNaN(jumlah) && !isNaN(harga_satuan)) {
        updatedItems[index].total = jumlah * harga_satuan;
      } else {
        updatedItems[index].total = ''; // Clear total if inputs are not valid numbers
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
                                      {
                                        id: prev.items.length + 1,
                                        nama_barang: '',                              jumlah: '',
          satuan: '',
          spesifikasi: '',
          keterangan: '',
          ...(type === 'bapb' && { kondisi: 'Baik' }),
          ...(type === 'bapp' && { progress: '', harga_satuan: '', total: '' })
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };






  const handleAttachmentsSelected = (selectedFilesFromUploader) => {
    // Replace the attachments entirely with the current selection from the uploader
    setFormData(prev => ({
      ...prev,
      attachments: selectedFilesFromUploader.map(file => ({ file: file, description: '' }))
    }));
  };

  const handleAttachmentDescriptionChange = (index, description) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments[index].description = description;
    setFormData(prev => ({
      ...prev,
      attachments: updatedAttachments
    }));
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  console.log('FORM SUBMIT START ==========');
  console.log('Tipe dokumen:', type);
  console.log('Form data to submit:', formData);

  // Client-side validation for attachments
  if (formData.attachments.length === 0) {
    alert('Harap unggah setidaknya satu lampiran.');
    setIsSubmitting(false);
    return;
  }

  try {
    // 1. Create the main document (BAPB/BAPP)
    const mappedData = type === 'bapb'
      ? mapBAPBFieldsToBackend(formData)
      : mapBAPPFieldsToBackend(formData);

    // Remove attachments from mappedData as they will be uploaded separately
    delete mappedData.attachments;
    // Add catatanTambahan to main document // REMOVED: This field is not expected by the backend for initial document creation
    // mappedData.catatanTambahan = formData.catatanTambahan;


    console.log('Data ke backend (tanpa lampiran):', mappedData);

    const documentResponse = await api.post(
      type === 'bapb' ? '/bapb' : '/bapp',
      mappedData
    );

    const documentId = documentResponse.data.id;
    console.log('Dokumen berhasil dibuat! ID:', documentId);

    // 2. Upload attachments if any
    if (formData.attachments.length > 0) {
      console.log('Mengunggah lampiran...');
      for (const attachment of formData.attachments) {
        // uploadService.upload takes (jenis, id, files, keterangan)
        await uploadService.upload(
          type, // jenis dokumen (bapb/bapp)
          documentId, // ID dokumen yang baru dibuat
          [attachment.file], // Kirim file dalam array
          attachment.description || formData.catatanTambahan // Gunakan deskripsi individual, fallback ke catatanTambahan umum
        );
      }
      console.log('Semua lampiran berhasil diunggah.');
    }

    setShowSuccessModal(true);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    const errorMessage = err.response?.data?.message || err.message || 'Gagal membuat dokumen atau mengunggah lampiran. Silakan coba lagi.';
    alert(errorMessage);
  } finally {
    setIsSubmitting(false);
    console.log('FORM SUBMIT END ==========');
  }
};


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/vendor/tambah-dokumen');
    }
  };

  const handleNext = () => {
    // Basic validation before moving to the next step
    if (currentStep === 1) {
      // Validate Step 1 fields
      const { noDokumen, nomorSuratPesanan, projek, nilaiKontrak, deskripsiPekerjaan } = formData;
      if (!noDokumen || !nomorSuratPesanan || !projek || !nilaiKontrak || !deskripsiPekerjaan) {
        alert('Mohon lengkapi semua field yang wajib diisi pada Informasi Dasar.');
        return;
      }
      if (type === 'bapp' && !formData.tanggalKontrak) {
        alert('Mohon lengkapi Tanggal Kontrak.');
        return;
      }
    } else if (currentStep === 2) {
      // Validate Step 2 fields (items)
      const allItemsValid = formData.items.every(item => {
        const baseValid = item.nama_barang && item.jumlah && item.satuan;
        if (type === 'bapp') {
          return baseValid && item.harga_satuan;
        }
        return baseValid;
      });
      if (!allItemsValid) {
        alert(`Mohon lengkapi semua field yang wajib diisi pada Detail ${type === 'bapb' ? 'Barang' : 'Pekerjaan'}.`);
        return;
      }
    }
    
    if (currentStep < steps.length) { // Use steps.length dynamically
      setCurrentStep(currentStep + 1);
    }
  };


  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/vendor/dokumen-saya');
  };

  // Progress Steps - Disesuaikan berdasarkan type
  const steps = [
    { number: 1, title: 'Informasi Dasar', description: 'Data utama dokumen' },
    { number: 2, title: type === 'bapb' ? 'Detail Barang' : 'Detail Pekerjaan', description: type === 'bapb' ? 'Barang yang diperiksa' : 'Pekerjaan yang dilakukan' },
    { number: 3, title: 'Lampiran Dokumen', description: 'Unggah file pendukung' },

  ];

  if (isSubmitting) {
    return <LoadingSpinner text="Mengirim dokumen..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header dengan Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Buat {type === 'bapb' ? 'BAPB' : 'BAPP'} Baru
            </h1>
            <p className="text-gray-600">
              {type === 'bapb' 
                ? 'Berita Acara Pemeriksaan Barang' 
                : 'Berita Acara Pemeriksaan Pekerjaan'}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number 
                  ? `${type === 'bapb' ? 'bg-blue-600 border-blue-600' : 'bg-green-600 border-green-600'} text-white` 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step.number}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number 
                    ? `${type === 'bapb' ? 'text-blue-600' : 'text-green-600'}` 
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                  currentStep > step.number 
                    ? `${type === 'bapb' ? 'bg-blue-600' : 'bg-green-600'}` 
                    : 'bg-gray-300'
                }`} style={{ left: `${(index * 33) + 16.5}%` }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Informasi Dasar */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar Dokumen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No Dokumen
                  </label>
                  <input
                    type="text"
                    name="noDokumen"
                    value={formData.noDokumen}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Surat Pesanan *
                  </label>
                  <input
                    type="text"
                    name="nomorSuratPesanan"
                    value={formData.nomorSuratPesanan}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {type === 'bapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Kontrak *
                    </label>
                    <input
                      type="date"
                      name="tanggalKontrak"
                      value={formData.tanggalKontrak}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Field khusus BAPB - Step 1 */}
              {type === 'bapb' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Pengiriman *
                    </label>
                    <input
                      type="date"
                      name="tanggalPengiriman"
                      value={formData.tanggalPengiriman}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kurir Pengiriman
                    </label>
                    <input
                      type="text"
                      name="kurirPengiriman"
                      value={formData.kurirPengiriman}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Field khusus BAPP - Step 1 */}
              {type === 'bapp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi Pekerjaan *
                    </label>
                    <input
                      type="text"
                      name="lokasiPekerjaan"
                      value={formData.lokasiPekerjaan}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periode Pekerjaan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={formData.periodePekerjaan?.start}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          periodePekerjaan: { ...prev.periodePekerjaan, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Mulai"
                      />
                      <input
                        type="date"
                        value={formData.periodePekerjaan?.end}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          periodePekerjaan: { ...prev.periodePekerjaan, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Selesai"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Projek *
                </label>
                <input
                  type="text"
                  name="projek"
                  value={formData.projek}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai Kontrak *
                  </label>
                  <input
                    type="number"
                    name="nilaiKontrak"
                    value={formData.nilaiKontrak}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi {type === 'bapb' ? 'Barang' : 'Pekerjaan'} *
                </label>
                <textarea
                  name="deskripsiPekerjaan"
                  value={formData.deskripsiPekerjaan}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Detail Items */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail {type === 'bapb' ? 'Barang' : 'Pekerjaan'}
                </h3>
                <button
                  type="button"
                  onClick={addNewItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + Tambah Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama {type === 'bapb' ? 'Barang' : 'Pekerjaan'} *
                      </label>
                      <input
                        type="text"
                        value={item.nama_barang}
                        onChange={(e) => handleItemChange(index, 'nama_barang', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jumlah *
                                          </label>
                                          <input
                                            type="number"
                                            value={item.jumlah}
                                            onChange={(e) => handleItemChange(index, 'jumlah', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                        </div>
                    
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Satuan *
                                          </label>
                                          <select
                                            value={item.satuan}
                                            onChange={(e) => handleItemChange(index, 'satuan', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          >
                                            <option value="">Pilih</option>
                                            <option value="unit">Unit</option>
                                            <option value="buah">Buah</option>
                                            <option value="pack">Pack</option>
                                            <option value="meter">Meter</option>
                                            <option value="kg">Kg</option>
                                            {type === 'bapp' && <option value="hari">Hari</option>}
                                          </select>
                                        </div>
                                      </div>
                    
                                      {/* Field khusus BAPP: Harga Satuan dan Total */}
                                      {type === 'bapp' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                              Harga Satuan *
                                            </label>
                                            <input
                                              type="number"
                                              value={item.harga_satuan}
                                              onChange={(e) => handleItemChange(index, 'harga_satuan', e.target.value)}
                                              required
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                              Total
                                            </label>
                                            <input
                                              type="number"
                                              value={item.total}
                                              readOnly
                                              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-500"
                                            />
                                          </div>
                                        </div>
                                      )}                  </div>

                  {/* Field khusus BAPB - Step 2 */}
                  {type === 'bapb' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kondisi Barang
                      </label>
                      <select
                        value={item.kondisi}
                        onChange={(e) => handleItemChange(index, 'kondisi', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak">Rusak</option>
                        <option value="Tidak Sesuai">Tidak Sesuai</option>
                      </select>
                    </div>
                  )}

                  {/* Field khusus BAPP - Step 2 */}
                  {type === 'bapp' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Progress Pekerjaan
                      </label>
                      <input
                        type="text"
                        value={item.progress}
                        onChange={(e) => handleItemChange(index, 'progress', e.target.value)}
                        placeholder="Contoh: 100%, 50%, dll"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spesifikasi Teknis
                    </label>
                    <textarea
                      value={item.spesifikasi}
                      onChange={(e) => handleItemChange(index, 'spesifikasi', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      value={item.keterangan}
                      onChange={(e) => handleItemChange(index, 'keterangan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Lampiran */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Lampiran Dokumen</h3>
              
              {/* Field khusus BAPB - Step 3 */}
              {type === 'bapb' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasil Pemeriksaan
                  </label>
                  <select
                    name="hasilPemeriksaan"
                    value={formData.hasilPemeriksaan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Sesuai">Sesuai</option>
                    <option value="Tidak Sesuai">Tidak Sesuai</option>
                    <option value="Sebagian Sesuai">Sebagian Sesuai</option>
                  </select>
                </div>
              )}

              {/* Field khusus BAPP - Step 3 */}
              {type === 'bapp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Pekerjaan
                  </label>
                  <select
                    name="statusPekerjaan"
                    value={formData.statusPekerjaan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Selesai">Selesai</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Tertunda">Tertunda</option>
                  </select>
                </div>
              )}

              <AttachmentUploader
                onFilesSelected={handleAttachmentsSelected}
                allowedFileTypes={['image/*', '.pdf']}
                maxFiles={5}
                maxFileSizeMB={10}
                required={true} // Added required prop
              />

              {/* List selected files with description input */}
              {formData.attachments.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium text-gray-900">Lampiran yang akan diunggah:</h4>
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-start md:items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex-1 flex items-center space-x-3 mb-2 md:mb-0">
                        <span className="text-blue-600 text-xl">📄</span>
                        <span className="text-sm text-gray-700 font-medium break-all">{attachment.file.name}</span>
                        <span className="text-xs text-gray-500">({(attachment.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <div className="flex-1 w-full md:w-auto md:ml-4">
                        <label htmlFor={`description-${index}`} className="sr-only">Deskripsi Lampiran</label>
                        <input
                          id={`description-${index}`}
                          type="text"
                          value={attachment.description}
                          onChange={(e) => handleAttachmentDescriptionChange(index, e.target.value)}
                          placeholder="Keterangan lampiran (opsional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="ml-0 md:ml-4 mt-2 md:mt-0 text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors self-end md:self-center"
                        title="Hapus lampiran ini"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  name="catatanTambahan"
                  value={formData.catatanTambahan}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tambahkan catatan atau instruksi khusus..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Kembali ke Pilihan' : 'Sebelumnya'}
            </button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`px-6 py-2 ${
                    type === 'bapb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="submit"
                  className={`px-6 py-2 ${
                    type === 'bapb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Kirim Dokumen
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title={`${type === 'bapb' ? 'BAPB' : 'BAPP'} Berhasil Dikirim! 🎉`}
        size="md"
      >
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto ${
            type === 'bapb' ? 'bg-blue-100' : 'bg-green-100'
          } rounded-full flex items-center justify-center`}>
            <span className={`text-2xl ${
              type === 'bapb' ? 'text-blue-600' : 'text-green-600'
            }`}>✓</span>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {type === 'bapb' ? 'BAPB' : 'BAPP'} telah dikirim untuk persetujuan
            </h4>
            <p className="text-gray-600">
              Dokumen <strong>{formData.noDokumen}</strong> telah berhasil dikirim dan sedang menunggu persetujuan.
            </p>
          </div>

          <div className={`${
            type === 'bapb' ? 'bg-blue-50' : 'bg-green-50'
          } rounded-lg p-4 text-left`}>
            <p className={`text-sm ${
              type === 'bapb' ? 'text-blue-800' : 'text-green-800'
            }`}>
              <strong>Next:</strong> Dokumen akan direview oleh {type === 'bapb' ? 'PIC Gudang' : 'Direksi Pekerjaan'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => navigate('/vendor/tambah-dokumen')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Buat Dokumen Baru
            </button>
            <button
              onClick={handleSuccessClose}
              className={`flex-1 px-4 py-2 ${
                type === 'bapb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-lg transition-colors`}
            >
              Lihat Dokumen Saya
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormTambahDokumen;