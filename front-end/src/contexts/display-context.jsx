// src/contexts/DisplayContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Helper functions for applying theme and font size
const applySystemTheme = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else if (theme === 'system') {
    applySystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
};

const applyFontSize = (fontSize) => {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };
  const size = sizes[fontSize] || '16px';
  document.documentElement.style.fontSize = size;
};

const DisplayContext = createContext();

export const useDisplay = () => {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error('useDisplay must be used within a DisplayProvider');
  }
  return context;
};

export const DisplayProvider = ({ children }) => {
  const defaultPreferences = {
    theme: 'light', // Default light mode
    fontSize: 'medium',
    sidebarVisible: true,
  };

  // Load from localStorage first
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('displayPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all default keys are present in parsed preferences
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('❌ Error loading display preferences:', error);
    }
    return defaultPreferences;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial application of preferences and theme listener
  useEffect(() => {
    applyTheme(preferences.theme);
    applyFontSize(preferences.fontSize);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemThemeListener = (e) => {
      if (preferences.theme === 'system') {
        applySystemTheme(e.matches);
      }
    };
    mediaQuery.addEventListener('change', systemThemeListener);

    return () => mediaQuery.removeEventListener('change', systemThemeListener);
  }, [preferences.theme, preferences.fontSize]); // Re-run if theme or font size preferences change

  const updatePreferences = useCallback(async (newPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      // Apply changes immediately (already handled by useEffect, but good for instant feedback)
      applyTheme(newPreferences.theme);
      applyFontSize(newPreferences.fontSize);
      
      // Update state
      setPreferences(newPreferences);
      
      // Save to localStorage
      localStorage.setItem('displayPreferences', JSON.stringify(newPreferences));
      
      // Simulate API call (500ms delay)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoading(false);
      return { 
        success: true, 
        data: newPreferences,
        message: 'Preferensi berhasil disimpan'
      };
    } catch (error) {
      console.error('❌ Error updating display preferences:', error);
      setError(error.message);
      
      setLoading(false);
      return { 
        success: false, 
        error: 'Gagal menyimpan preferensi',
        data: preferences
      };
    }
  }, [preferences]); // Dependency on preferences to ensure latest state for rollback on error

  const resetToDefault = useCallback(async () => {
    return await updatePreferences(defaultPreferences);
  }, [updatePreferences]);

  return (
    <DisplayContext.Provider
      value={{
        preferences,
        loading,
        error,
        updatePreferences,
        resetToDefault,
      }}
    >
      {children}
    </DisplayContext.Provider>
  );
};