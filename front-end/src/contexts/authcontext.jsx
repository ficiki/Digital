import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Initial state
// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'), // ← LOAD USER DARI LOCALSTORAGE
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'), // ← SET TRUE JIKA ADA TOKEN
  loading: true,
  error: null
};

// Action types
const ActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    
    case ActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };
    
    case ActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case ActionTypes.UPDATE_USER_PROFILE:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate(); // Add this line

// Initialize auth dari localStorage
// Initialize auth dari localStorage
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('🔄 initAuth:', { token, userData });

    if (token && userData) {
      try {
        // Set user dari localStorage dulu (untuk UI cepat)
        const parsedUser = JSON.parse(userData);
        console.log('📱 User from localStorage:', parsedUser);
        
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            user: parsedUser,
            token: token
          }
        });

        // Lalu verify token dengan server (async)
        try {
          const response = await authService.verifyToken();
          console.log('✅ Token verified, user:', response.data.user);
          
          // Update dengan data terbaru dari server
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: token
            }
          });
        } catch (verifyError) {
          console.warn('⚠️ Token verification failed, using cached data:', verifyError.message);
          // Tetap gunakan data dari localStorage
        }
      } catch (parseError) {
        console.error('❌ Error parsing user data:', parseError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: ActionTypes.LOGOUT });
        navigate('/'); // Redirect to home on parsing error
      }
    } else {
      console.log('🚫 No auth data in localStorage');
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  initAuth();
}, []);

  // Login function
const login = async (credentials) => {
  dispatch({ type: ActionTypes.SET_LOADING, payload: true });
  dispatch({ type: ActionTypes.CLEAR_ERROR });

  try {
    const response = await authService.login(credentials);
    
    console.log('🔑 Full login response:', response);
    console.log('👤 User data:', response.data?.user);
    console.log('🎭 User role:', response.data?.user?.role);
    
    if (response.data.token && response.data.user) {
      // Pastikan user object punya role
      const userData = {
        ...response.data.user,
        role: response.data.user.role || credentials.role // Fallback ke credentials.role
      };
      
      console.log('💾 Saving user to localStorage:', userData);
      
      // Save to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: response.data.token
        }
      });
      
      return { success: true, data: response.data };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login gagal';
    
    dispatch({
      type: ActionTypes.LOGIN_FAILURE,
      payload: errorMessage
    });
    
    return { success: false, error: errorMessage };
  }
};

  

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: ActionTypes.LOGOUT });
    navigate('/'); // Redirect to home page after logout
    window.location.reload(); // Full page reload to clear all state
  };

  // Register vendor
  const registerVendor = async (data) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });


    try {
      const response = await authService.registerVendor(data);
      
      dispatch({
        type: ActionTypes.REGISTER_SUCCESS
      });
      
      return { 
        success: true, 
        data: response.data,
        message: 'Registrasi berhasil. Silakan login.' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registrasi gagal';
      
      dispatch({
        type: ActionTypes.REGISTER_FAILURE,
        payload: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (data) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await authService.changePassword(data);
      
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mengubah password';
      
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({
        type: ActionTypes.UPDATE_USER_PROFILE,
        payload: updatedUser
      });
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil';
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Check if user has role
  const hasRole = (role) => {
    console.log('🔍 hasRole check:', { 
      user: state.user, 
      userRole: state.user?.role,
      requiredRole: role,
      result: state.user?.role === role 
    });
    return state.user?.role === role;
  };

  // Get user role
    const getUserRole = () => {
      console.log('👤 getUserRole:', state.user?.role);
      return state.user?.role;
    };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    registerVendor,
    changePassword,
    updateUserProfile, // Add updateUserProfile here
    clearError,
    hasRole,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

