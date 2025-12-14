import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, HardHat } from 'lucide-react';

const TambahDokumen = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

const handleContinue = () => {
  if (selectedType) {
    navigate(`/vendor/tambah-dokumen/${selectedType}`);
  }
};

  const handleBack = () => {
    navigate('/vendor/dokumen-saya');
  };


  return (
    <div className="w-full">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Buat Berita Acara Baru
        </h1>
        <p className="text-gray-600">
          Pilih jenis berita acara yang ingin Anda buat
        </p>
      </div>

      {/* Cards Container - FULL WIDTH */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* BAPB Card */}
        <div
          onClick={() => handleSelectType('bapb')}
          className={`w-full rounded-xl p-8 cursor-pointer transition-all border-2 ${
            selectedType === 'bapb'
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={48} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              BAPB
            </h3>
            
            <p className="text-blue-600 font-medium mb-3">
              Berita Acara Pemeriksaan Barang
            </p>
            
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Untuk pemeriksaan dan penerimaan barang/material sesuai kontrak
            </p>
            
            <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-4 py-2 inline-block">
              <strong>PIC:</strong> Gudang → Pemesan Barang
            </div>
          </div>
        </div>

        {/* BAPP Card */}
        <div
          onClick={() => handleSelectType('bapp')}
          className={`w-full rounded-xl p-8 cursor-pointer transition-all border-2 ${
            selectedType === 'bapp'
              ? 'border-green-500 bg-green-50 shadow-lg'
              : 'border-gray-200 bg-white shadow-sm hover:border-green-300 hover:shadow-md'
          }`}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-xl flex items-center justify-center">
              <HardHat className="text-green-600" size={48} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              BAPP
            </h3>
            
            <p className="text-green-600 font-medium mb-3">
              Berita Acara Pemeriksaan Pekerjaan
            </p>
            
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Untuk pemeriksaan dan penerimaan hasil pekerjaan/kontruksi
            </p>
            
            <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-4 py-2 inline-block">
              <strong>PIC:</strong> Direksi Pekerjaan
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Kembali ke Dokumen Saya
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg transition-colors font-medium ${
            selectedType
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Lanjut ke Form {selectedType === 'bapb' ? 'BAPB' : 'BAPP'}
        </button>
      </div>

      {/* Informasi Tambahan */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 text-center">
          <strong>Perhatian:</strong> Pastikan data yang dimasukkan sesuai dengan kontrak yang berlaku. 
          Dokumen yang sudah dibuat tidak dapat diubah.
        </p>
      </div>
    </div>
  );
};

export default TambahDokumen;
