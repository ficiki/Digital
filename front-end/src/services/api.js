import axios from 'axios';

// Konfigurasi base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 detik timeout
});

// Interceptor request untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor response untuk handling error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expired atau tidak valid
          console.error('Unauthorized - Token mungkin expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        
        case 403:
          // Akses ditolak
          console.error('Forbidden - Tidak memiliki akses');
          break;
        
        case 404:
          // Resource tidak ditemukan
          console.error('Not Found - Resource tidak ditemukan');
          break;
        
        case 500:
          // Server error
          console.error('Server Error - Silakan coba lagi nanti');
          break;
      }
      
      // Return error message dari server jika ada
      return Promise.reject({
        message: data.message || 'Terjadi kesalahan',
        status,
        data
      });
    } else if (error.request) {
      // Tidak ada response dari server
      console.error('No response from server');
      return Promise.reject({
        message: 'Tidak ada koneksi ke server. Periksa jaringan Anda.',
        status: 0
      });
    } else {
      // Error lain
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// ============================
// BAPB SERVICES
// ============================
export const bapbService = {
  // Get all BAPB dengan filter & pagination
  getAll: (params = {}) => {
    const defaultParams = {
      page: 1,
      limit: 10,
      status: '',
      search: ''
    };
    return api.get('/bapb', { params: { ...defaultParams, ...params } });
  },

  // Get single BAPB by ID
  getById: (id) => api.get(`/bapb/${id}`),

  // Create new BAPB
  create: (data) => api.post('/bapb', data),

  // Update existing BAPB
  update: (id, data) => api.put(`/bapb/${id}`, data),

  // Delete BAPB (only draft)
  delete: (id) => api.delete(`/bapb/${id}`),

  // Submit BAPB untuk review
  submit: (id) => api.patch(`/bapb/${id}/submit`),


  // REVIEW oleh PIC (BARU)
  review: (id, data) => api.put(`/bapb/${id}/review`, data),
  
  // APPROVE oleh Direksi (BARU)
  approve: (id, data) => api.put(`/bapb/${id}/approve`, data),
  
  // REJECT oleh PIC/Direksi (BARU)
  reject: (id, data) => api.put(`/bapb/${id}/reject`, data),

  // Download BAPB as PDF
  downloadBapb: (id) => api.get(`/bapb/download/${id}`, { responseType: 'blob' }),
};

// ============================
// BAPP SERVICES
// ============================
export const bappService = {
  // Get all BAPP dengan filter & pagination
  getAll: (params = {}) => {
    const defaultParams = {
      page: 1,
      limit: 10,
      status: '',
      search: ''
    };
    return api.get('/bapp', { params: { ...defaultParams, ...params } });
  },

  // Get single BAPP by ID
  getById: (id) => api.get(`/bapp/${id}`),

  // Create new BAPP
  create: (data) => api.post('/bapp', data),

  // Update existing BAPP
  update: (id, data) => api.put(`/bapp/${id}`, data),

  // Delete BAPP (only draft)
  delete: (id) => api.delete(`/bapp/${id}`),

  // Submit BAPP untuk review
  submit: (id) => api.patch(`/bapp/${id}/submit`),

    // REVIEW oleh PIC (BARU)
  review: (id, data) => api.put(`/bapp/${id}/review`, data),
  
  // APPROVE oleh Direksi (BARU)
  approveDireksi: (id, data) => api.put(`/bapp/${id}/approve-direksi`, data),
  
  // REJECT oleh PIC/Direksi (BARU)
  reject: (id, data) => api.put(`/bapp/${id}/reject`, data),

  // Download BAPP as PDF
  downloadBapp: (id) => api.get(`/bapp/download/${id}`, { responseType: 'blob' }),
};

// ============================
// DOCUMENTS SERVICES (General)
// ============================
export const documentsService = {
  // Get document statistics
  getStats: () => api.get('/documents/stats'),

  // Get document history
  getHistory: (params = {}) => api.get('/documents/history', { params }),

  // Get combined documents (BAPB + BAPP) - Untuk dashboard
  getCombined: (params = {}) => api.get('/documents/combined', { params })
};

// ============================
// UPLOAD SERVICES
// ============================
export const uploadService = {
  // Upload files untuk dokumen
  upload: (jenis, id, files, keterangan = '') => {
    const formData = new FormData();
    
    // Tambahkan setiap file ke formData
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Tambahkan keterangan jika ada
    if (keterangan) {
      formData.append('keterangan', keterangan);
    }

    return api.post(`/upload/${jenis}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete lampiran
  deleteLampiran: (id) => api.delete(`/upload/${id}`),

  // Download lampiran
  downloadLampiran: (id) => 
    api.get(`/upload/download/${id}`, { responseType: 'blob' }),

  // Get list of attachments for a document
  getAttachments: (jenis, id) => api.get(`/upload/${jenis}/${id}/list`)
};

// ============================
// AUTH SERVICES
// ============================
export const authService = {
  // Login dengan credentials object
  login: (credentials) => {
    const { role, email, password } = credentials;
    return api.post('/auth/login', {
      role,
      email,
      password
    });
  },

  // Register vendor
  registerVendor: (data) => api.post('/auth/register/vendor', data),

  // Change password
  changePassword: (data) => api.post('/auth/change-password', data),

  // Verify token
  verifyToken: () => api.get('/auth/verify'),

  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),

  // Get full user profile
  getProfile: () => api.get('/auth/profile'),

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  }
};

// ============================
// NOTIFICATION SERVICES
// ============================
export const notificationService = {
  // Get all notifications for the current user
  getAll: () => api.get('/notifications'),

  // Mark a single notification as read
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => api.patch('/notifications/read-all'),

  // Get notification preferences
  getPreferences: () => api.get('/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),

  // Get VAPID public key
  getVapidKey: () => api.get('/notifications/vapid-key'),

  // Subscribe to push notifications
  subscribe: (subscription) => api.post('/notifications/subscribe', { subscription }),
};

// ============================
// UTILITY FUNCTIONS
// ============================

// Format currency untuk display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date untuk display
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Format date time untuk display
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Export default instance untuk custom calls
export default api;

