import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { profileAPI } from '../../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getProfile();
      setUser(response.data.data); // Assuming API returns { data: userObject }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.updateProfile(data);
      setUser(response.data.data); // Assuming API returns { data: updatedUserObject }
      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err);
      setLoading(false);
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]); // Depend on fetchUserProfile

  return (
    <UserContext.Provider value={{
      user,
      loading,
      error, // Expose error state
      updateUserProfile,
      fetchUserProfile,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};