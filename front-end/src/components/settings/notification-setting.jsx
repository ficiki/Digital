import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/notification-context';
import { Bell, WifiOff, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

// Helper for shallow comparison of preference objects
const shallowEqual = (objA, objB) => {
  if (objA === objB) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }
  return true;
};

const NotificationSetting = () => {
  const { preferences, loading, error, updatePreferences } = useNotification();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [message, setMessage] = useState({ type: '', text: '' }); // success, error

  useEffect(() => {
    // Update local preferences when context preferences change,
    // but only if the preferences have actually changed to prevent cascading renders.
    // Use shallowEqual for object comparison.
    if (preferences && !shallowEqual(preferences, localPreferences)) {
      setLocalPreferences(preferences);
    }
  }, [preferences]); // localPreferences is *not* a dependency here to avoid triggering the effect when local state changes

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleToggle = (key) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    const result = await updatePreferences(localPreferences);
    if (result.success) {
      showMessage('success', 'Preferensi notifikasi berhasil disimpan!');
    } else {
      showMessage('error', result.error || 'Gagal menyimpan preferensi notifikasi.');
    }
  };

  const handleReset = async () => {
    // Assuming there's a reset function in the context or we reset to default manually
    // For now, let's manually reset to a hardcoded default (or what fetchPreferences returns initially)
    const defaultPrefs = {
      barangMasuk: true,
      dokumenDisetujui: true,
      komentarBaru: true,
    };
    const result = await updatePreferences(defaultPrefs);
    if (result.success) {
      showMessage('success', 'Preferensi notifikasi direset ke default!');
      setLocalPreferences(defaultPrefs);
    } else {
      showMessage('error', result.error || 'Gagal mereset preferensi notifikasi.');
    }
  };


  if (loading) {
    return <div className="text-center py-8 dark:text-gray-200">Memuat preferensi notifikasi...</div>;
  }

  if (error && !preferences) { // Only show error if preferences couldn't be loaded at all
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <WifiOff className="h-6 w-6 mr-2" />
        <p>Gagal memuat preferensi notifikasi. {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Pengaturan Notifikasi</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Notifikasi Barang Masuk</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dapatkan pemberitahuan saat ada barang baru masuk</p>
          </div>
          <button
            onClick={() => handleToggle('barangMasuk')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localPreferences.barangMasuk ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localPreferences.barangMasuk ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Notifikasi Dokumen Disetujui</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dapatkan pemberitahuan saat dokumen Anda disetujui</p>
          </div>
          <button
            onClick={() => handleToggle('dokumenDisetujui')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localPreferences.dokumenDisetujui ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localPreferences.dokumenDisetujui ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Notifikasi Komentar Baru</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dapatkan pemberitahuan saat ada komentar baru pada dokumen Anda</p>
          </div>
          <button
            onClick={() => handleToggle('komentarBaru')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localPreferences.komentarBaru ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localPreferences.komentarBaru ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X size={18} />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save size={18} />
          )}
          Simpan
        </button>
      </div>
    </div>
  );
};

export default NotificationSetting;