import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './authcontext'; // Import useAuth to get user role

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const fetchNotifications = useCallback(async () => {


    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getAll();
      setNotifications(response.data.data || []);
      setInitialFetchDone(true); // Mark initial fetch as done
    } catch (err) { // This was the problematic line: "catch (err) => {"
      console.error('Failed to fetch notifications:', err);
      setError(err);
      setNotifications([]); // Clear notifications on error
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Rerun when user object changes

  const [preferences, setPreferences] = useState(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    try {
      setPreferencesLoading(true);
      const response = await notificationService.getPreferences();
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch preferences:", err);
      // Keep default or last known preferences on error
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      setPreferencesLoading(true);
      const response = await notificationService.updatePreferences(newPreferences);
      setPreferences(response.data);
      return { success: true };
    } catch (err) {
      console.error("Failed to update preferences:", err);
      return { success: false, error: err.message || "Server error" };
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !initialFetchDone) { // Only fetch if user is logged in AND initial fetch not done
      fetchNotifications();
      fetchPreferences();
    } else if (!user) {
      // Clear data and reset fetch flag on logout
      setNotifications([]);
      setPreferences(null);
      setInitialFetchDone(false);
    }
  }, [user, initialFetchDone, fetchNotifications, fetchPreferences]);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      is_read: false,
      created_at: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const value = {
    notifications,
    unreadCount,
    preferences,
    loading: loading || preferencesLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    updatePreferences,
    fetchPreferences
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
