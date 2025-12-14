// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    barangMasuk: true,
    dokumenDisetujui: true,
    komentarBaru: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = async () => {
    try {
      setError(null);
      const response = await notificationAPI.getPreferences();
      setPreferences(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn('Error fetching notification preferences:', error.message);
      setError('Tidak dapat mengambil preferensi, menggunakan default');
      
      // Tetap set default preferences meski error
      const defaultPrefs = {
        barangMasuk: true,
        dokumenDisetujui: true,
        komentarBaru: true,
      };
      setPreferences(defaultPrefs);
      
      return { success: false, error: error.message };
    }
  };

  const updatePreferences = async (newPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update state dulu untuk UX yang lebih baik
      setPreferences(newPreferences);
      
      // Simpan ke localStorage sebagai backup
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      
      // Coba simpan ke backend
      const response = await notificationAPI.updatePreferences(newPreferences);
      
      setLoading(false);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn('Error updating preferences:', error.message);
      setError('Gagal menyimpan ke server, namun preferensi tersimpan lokal');
      
      // Tetap simpan di localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      
      setLoading(false);
      return { 
        success: false, 
        error: 'Preferensi disimpan lokal (server offline)',
        data: newPreferences 
      };
    }
  };

  // Load preferences on mount
  useEffect(() => {
    // Coba load dari localStorage dulu
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved preferences:', e);
      }
    }
    
    // Kemudian coba fetch dari server
    fetchPreferences();
  }, []);

  return (
    <NotificationContext.Provider value={{
      preferences,
      loading,
      error,
      updatePreferences,
      fetchPreferences
    }}>
      {children}
    </NotificationContext.Provider>
  );
};