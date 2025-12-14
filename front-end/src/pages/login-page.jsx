import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Fungsi validasi email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Fungsi validasi nomor telepon
  const validatePhone = (phone) => {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Silakan pilih role';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email/Phone tidak boleh kosong';
    } else if (!validateEmail(formData.email) && !validatePhone(formData.email)) {
      newErrors.email = 'Format email atau nomor telepon tidak valid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validasi form
  const newErrors = {};
  if (!formData.role) newErrors.role = 'Pilih role terlebih dahulu';
  if (!formData.email) newErrors.email = 'Email wajib diisi';
  if (!formData.password) newErrors.password = 'Password wajib diisi';
  
  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  try {
    setIsLoading(true);
    console.log('📝 Login attempt with:', { role: formData.role, email: formData.email });

    // Panggil login dari auth context dengan object parameter
    const result = await login({
      role: formData.role,
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      console.log('✅ Login successful! Redirecting...');
      
      // Redirect berdasarkan role DENGAN DELAY untuk state update
      setTimeout(() => {
        if (formData.role === 'vendor') {
          navigate('/vendor/dashboard');
        } else if (formData.role === 'pic') {
          navigate('/pic-gudang/dashboard');
        } else if (formData.role === 'direksi') {
          navigate('/direksi/dashboard');
        }
      }, 100); // Small delay to ensure state is updated
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    setErrors({ general: error.message || 'Login gagal. Silakan coba lagi.' });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="form-box">
        <h1>DigiBA</h1>

        {errors.general && (
          <div className="error-message show" style={{ marginBottom: '16px' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="loginRole">Login sebagai</label>
            <select
              id="loginRole"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
              required
              disabled={isLoading}
            >
              <option value="">-- Pilih Role --</option>
              <option value="pic">Pic</option>
              <option value="direksi">Direksi</option>
              <option value="vendor">Vendor</option>
            </select>
            {errors.role && <div className="error-message show">{errors.role}</div>}
          </div>

          <div className="input-group">
            <label htmlFor="loginEmail">Email / Phone</label>
            <input
              type="text"
              id="loginEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email atau nomor telepon"
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && <div className="error-message show">{errors.email}</div>}
          </div>

          <div className="input-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="switch-form">
          <p>
            Belum punya akun?
            <Link to="/register">Daftar disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;