/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/common/loading-spinner';
import Modal from '../../components/common/modal';
import { bapbService, bappService } from '../../services/api';
import { useNotification } from '../../contexts/notification-context';
import { 
  mapBAPBFieldsToFrontend, 
  mapBAPPFieldsToFrontend,
  mapBAPBFieldsToBackend,
  mapBAPPFieldsToBackend,
  validateBAPBForm,
  validateBAPPForm
} from '../../utils/fieldMapper';

const EditDokumen = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const { addNotification } = useNotification();
  
  // Form data state
  const [formData, setFormData] = useState({
    // Common fields
    nomor_bapb: '',
    nomor_bapp: '',
    no_kontrak: '',
    tanggal_kontrak: '',
    nilai_kontrak: '',
    
    // BAPB specific
    tanggal_pengiriman: '',
    lokasi_pengiriman: '',
    rincian_barang: '',
    keterangan: '',
    
    // BAPP specific
    lokasi_pekerjaan: '',
    rincian_pekerjaan: '',
    hasil_pemeriksaan: '',
    
    // Items array (parsed from rincian)
    items: []
  });

  // Fetch document data on load
  useEffect(() => {
    fetchDocument();
  }, [type, id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      
      let response;
      let mappedData;
      
      if (type === 'bapb') {
        response = await bapbService.getById(id);
        mappedData = mapBAPBFieldsToFrontend(response.data);
      } else {
        response = await bappService.getById(id);
        mappedData = mapBAPPFieldsToFrontend(response.data);
      }
      
      // Cek apakah dokumen bisa diedit (harus draft)
      if (mappedData.status !== 'draft') {
        addNotification({
          title: 'Akses Ditolak',
          message: 'Hanya dokumen dengan status draft yang bisa diedit.',
          type: 'error',
        });
        navigate('/vendor/dokumen-saya');
        return;
      }
      
      setFormData(mappedData);
    } catch (error) {
      console.error('Error fetching document:', error);
      addNotification({
        title: 'Error Memuat Dokumen',
        message: 'Gagal memuat data dokumen.',
        type: 'error',
      });
      navigate('/vendor/dokumen-saya');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: (field === 'jumlah') ? Number(value) : value
    };
    
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
                                                  nama_barang: '',                              jumlah: 1,
          satuan: 'unit',
          spesifikasi: '',
          keterangan: '',
          ...(type === 'bapb' && { kondisi: 'Baik' }),
          ...(type === 'bapp' && { progress: '' })
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

  const validateForm = () => {
    let validationErrors = {};
    
    if (type === 'bapb') {
      validationErrors = validateBAPBForm(formData);
    } else {
      validationErrors = validateBAPPForm(formData);
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        title: 'Form Tidak Valid',
        message: 'Harap perbaiki kesalahan pada form.',
        type: 'error',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      let mappedData;
      
      if (type === 'bapb') {
        mappedData = mapBAPBFieldsToBackend(formData);
        await bapbService.update(id, mappedData);
      } else {
        mappedData = mapBAPPFieldsToBackend(formData);
        await bappService.update(id, mappedData);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating document:', error);
      addNotification({
        title: 'Update Gagal',
        message: `Gagal mengupdate dokumen: ${error.message}.`,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/vendor/dokumen-saya');
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/vendor/dokumen-saya');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Memuat data dokumen..." size="large" />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Menyimpan perubahan..." size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit {type === 'bapb' ? 'BAPB' : 'BAPP'}
            </h1>
            <p className="text-gray-600">
              No. Dokumen: <span className="font-mono">{formData.noDokumen}</span>
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
        </div>
        
        <div className={`p-4 rounded-lg ${
          type === 'bapb' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
        }`}>
          <p className="text-sm">
            <strong>Status:</strong> <span className="font-medium">Draft</span> - Dokumen dapat diedit, dihapus, atau diajukan untuk review.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nomor Dokumen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor {type === 'bapb' ? 'BAPB' : 'BAPP'} *
                </label>
                <input
                  type="text"
                  name={type === 'bapb' ? 'nomor_bapb' : 'nomor_bapp'}
                  value={formData[type === 'bapb' ? 'nomor_bapb' : 'nomor_bapp']}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomor_bapb || errors.nomor_bapp ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {(errors.nomor_bapb || errors.nomor_bapp) && (
                  <p className="mt-1 text-sm text-red-600">{errors.nomor_bapb || errors.nomor_bapp}</p>
                )}
              </div>
              
              {/* Nomor Kontrak */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kontrak *
                </label>
                <input
                  type="text"
                  name="no_kontrak"
                  value={formData.no_kontrak}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_kontrak ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.no_kontrak && (
                  <p className="mt-1 text-sm text-red-600">{errors.no_kontrak}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Kontrak */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kontrak *
                </label>
                <input
                  type="date"
                  name="tanggal_kontrak"
                  value={formData.tanggal_kontrak}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggal_kontrak ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.tanggal_kontrak && (
                  <p className="mt-1 text-sm text-red-600">{errors.tanggal_kontrak}</p>
                )}
              </div>
              
              {/* Nilai Kontrak */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Kontrak *
                </label>
                <input
                  type="number"
                  name="nilai_kontrak"
                  value={formData.nilai_kontrak}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nilai_kontrak ? 'border-red-300' : 'border-gray-300'
                  }`}
                  step="1000"
                />
                {errors.nilai_kontrak && (
                  <p className="mt-1 text-sm text-red-600">{errors.nilai_kontrak}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Type-specific Fields */}
          {type === 'bapb' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail Pengiriman</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal Pengiriman */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Pengiriman *
                  </label>
                  <input
                    type="date"
                    name="tanggal_pengiriman"
                    value={formData.tanggal_pengiriman}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.tanggal_pengiriman ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.tanggal_pengiriman && (
                    <p className="mt-1 text-sm text-red-600">{errors.tanggal_pengiriman}</p>
                  )}
                </div>
                
                {/* Lokasi Pengiriman */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Pengiriman *
                  </label>
                  <input
                    type="text"
                    name="lokasi_pengiriman"
                    value={formData.lokasi_pengiriman}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lokasi_pengiriman ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lokasi_pengiriman && (
                    <p className="mt-1 text-sm text-red-600">{errors.lokasi_pengiriman}</p>
                  )}
                </div>
              </div>
              
              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail Pekerjaan</h3>
              
              {/* Lokasi Pekerjaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Pekerjaan *
                </label>
                <input
                  type="text"
                  name="lokasi_pekerjaan"
                  value={formData.lokasi_pekerjaan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lokasi_pekerjaan ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.lokasi_pekerjaan && (
                  <p className="mt-1 text-sm text-red-600">{errors.lokasi_pekerjaan}</p>
                )}
              </div>
              
              {/* Hasil Pemeriksaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Pemeriksaan
                </label>
                <textarea
                  name="hasil_pemeriksaan"
                  value={formData.hasil_pemeriksaan}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi hasil pemeriksaan pekerjaan..."
                />
              </div>
            </div>
          )}
          
          {/* Items/Rincian */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {type === 'bapb' ? 'Rincian Barang' : 'Rincian Pekerjaan'}
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
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Satuan *
                      </label>
                      <select
                        value={item.satuan}
                        onChange={(e) => handleItemChange(index, 'satuan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="unit">Unit</option>
                        <option value="buah">Buah</option>
                        <option value="pack">Pack</option>
                        <option value="meter">Meter</option>
                        <option value="kg">Kg</option>
                        {type === 'bapp' && <option value="hari">Hari</option>}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Type-specific item fields */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    rows="2"
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
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`px-6 py-2 ${
                  type === 'bapb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors`}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Dokumen Berhasil Diupdate! ✅"
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
              Perubahan berhasil disimpan
            </h4>
            <p className="text-gray-600">
              Dokumen <strong>{formData.noDokumen}</strong> telah berhasil diupdate.
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSuccessClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Lihat Dokumen Saya
            </button>
            <button
              onClick={() => navigate(`/vendor/dokumen-saya/${type}/${id}`)}
              className={`flex-1 px-4 py-2 ${
                type === 'bapb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-lg transition-colors`}
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditDokumen;