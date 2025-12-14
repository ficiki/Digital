// src/components/settings/signature-upload.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, Trash2, CheckCircle, AlertCircle, PenTool } from 'lucide-react';

const SignatureUpload = ({ userRole, currentSignature, onSignatureUpdate }) => {
  const [signature, setSignature] = useState(currentSignature);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const allowedRoles = ['pic', 'direksi'];
  
  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan PNG, JPG, atau SVG.');
      return;
    }

    if (file.size > maxSize) {
      setError('Ukuran file maksimal 2MB.');
      return;
    }

    setError('');
    
    // Buat preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Simulasi upload
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Konversi ke base64 untuk simulasi
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Signature = e.target.result;
        
        // Simpan ke localStorage (simulasi)
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        userProfile.signature = base64Signature;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        setSignature(base64Signature);
        setPreview(null);
        setSuccess('Tanda tangan berhasil diunggah!');
        
        if (onSignatureUpdate) {
          onSignatureUpdate(base64Signature);
        }
        
        // Reset success message setelah 3 detik
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading signature:', error);
      setError('Gagal mengunggah tanda tangan. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSignature = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tanda tangan?')) {
      // Hapus dari localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      delete userProfile.signature;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      setSignature(null);
      setPreview(null);
      setSuccess('Tanda tangan berhasil dihapus!');
      
      if (onSignatureUpdate) {
        onSignatureUpdate(null);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PenTool size={20} />
            Tanda Tangan Digital
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Unggah tanda tangan untuk digunakan pada dokumen digital
          </p>
        </div>
        
        {signature && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            Tersedia
          </span>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Signature Preview/Upload Area */}
      <div className="space-y-4">
        {signature ? (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Pratinjau Tanda Tangan:</p>
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img 
                  src={signature} 
                  alt="Tanda Tangan" 
                  className="max-h-32 object-contain"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Upload size={18} />
                Ganti Tanda Tangan
              </button>
              
              <button
                onClick={handleRemoveSignature}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
                Hapus
              </button>
            </div>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Pratinjau Tanda Tangan Baru:</p>
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img 
                  src={preview} 
                  alt="Pratinjau Tanda Tangan" 
                  className="max-h-32 object-contain"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleUpload(fileInputRef.current?.files?.[0])}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Mengunggah...' : 'Simpan Tanda Tangan'}
              </button>
              
              <button
                onClick={() => {
                  setPreview(null);
                  setError('');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={openFileDialog}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Upload className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  Unggah Tanda Tangan
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Klik untuk memilih file atau drag & drop
                </p>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, atau SVG • Maksimal 2MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".png,.jpg,.jpeg,.svg"
          className="hidden"
        />
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Panduan Tanda Tangan:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Gunakan tanda tangan yang sama dengan dokumen fisik</li>
          <li>• Pastikan background putih dan tanda tangan berwarna hitam</li>
          <li>• Format PNG transparan direkomendasikan</li>
          <li>• Tanda tangan akan digunakan pada dokumen digital yang Anda tanda tangani</li>
        </ul>
      </div>
    </div>
  );
};

export default SignatureUpload;