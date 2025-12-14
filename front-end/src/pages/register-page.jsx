import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    confirmPassword: '',
    perusahaan: '',
    no_telepon: '',
    alamat: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

  // Cek apakah email sudah terdaftar
  const checkEmailExists = async (email) => {
    if (!email || !validateEmail(email)) return false;
    
    try {
      setEmailChecking(true);
      // Endpoint untuk cek email (perlu dibuat di backend)
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      setEmailChecking(false);
    }
  };

  const handleChange = async (e) => {
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

    // Validasi real-time untuk email
    if (name === 'email' && value.trim()) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Format email tidak valid' 
        }));
      } else {
        // Cek email setelah user berhenti mengetik (debounce)
        const timer = setTimeout(async () => {
          const exists = await checkEmailExists(value);
          if (exists) {
            setErrors(prev => ({ 
              ...prev, 
              email: 'Email sudah terdaftar' 
            }));
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    // Validasi real-time untuk password confirmation
    if ((name === 'password' || name === 'confirmPassword') && 
        formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ 
          ...prev, 
          confirmPassword: 'Password tidak cocok' 
        }));
      } else if (errors.confirmPassword) {
        setErrors(prev => ({ 
          ...prev, 
          confirmPassword: '' 
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validasi Nama Lengkap
    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap tidak boleh kosong';
    } else if (formData.nama_lengkap.length < 3) {
      newErrors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
    }

    // Validasi Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi Password
    if (!formData.password.trim()) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf dan angka';
    }

    // Validasi Konfirmasi Password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password tidak boleh kosong';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    // Validasi Nomor Telepon (jika diisi)
    if (formData.no_telepon.trim() && !validatePhone(formData.no_telepon)) {
      newErrors.no_telepon = 'Format nomor telepon tidak valid (10-13 digit)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Register attempt started');
    
    // Clear previous messages
    setSuccessMessage('');
    setErrors({ general: '' });
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setIsLoading(true);
      
      // Kirim ke API register vendor
      console.log('📤 Sending registration data to API...');
      const response = await fetch('/api/auth/register/vendor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nama_lengkap: formData.nama_lengkap.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          perusahaan: formData.perusahaan.trim() || `${formData.nama_lengkap.trim()} Company`,
          no_telepon: formData.no_telepon.trim() || '',
          alamat: formData.alamat.trim() || '- belum diisi -'
        })
      });

      console.log('📥 API Response status:', response.status);
      
      let data;
      try {
        const text = await response.text();
        console.log('📥 API Response raw:', text.substring(0, 200));
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error(`Invalid server response. Status: ${response.status}`);
      }
      
      if (!response.ok) {
        throw new Error(data?.message || `Registrasi gagal (${response.status})`);
      }

      // REGISTRASI BERHASIL - TIDAK AUTO LOGIN
      console.log('✅ Registration successful! Redirecting to login...');
      
      const successMsg = `Registrasi berhasil! Akun ${formData.email} telah dibuat. Silakan login dengan email dan password Anda.`;
      setSuccessMessage(successMsg);
      
      // Reset form
      setFormData({
        nama_lengkap: '',
        email: '',
        password: '',
        confirmPassword: '',
        perusahaan: '',
        no_telepon: '',
        alamat: ''
      });
      
      // Scroll ke atas untuk lihat pesan sukses
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Redirect ke login setelah 5 detik
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            fromRegister: true,
            registeredEmail: formData.email 
          } 
        });
      }, 5000);
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle specific error messages
      let errorMsg = error.message;
      if (error.message.includes('Email sudah terdaftar')) {
        errorMsg = 'Email sudah terdaftar. Silakan gunakan email lain.';
      } else if (error.message.includes('password')) {
        errorMsg = 'Password tidak memenuhi kriteria keamanan.';
      }
      
      setErrors({ 
        general: errorMsg || 'Registrasi gagal. Silakan coba lagi.' 
      });
      
      // Scroll ke error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan loading jika checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">D</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">DigiBA</h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            Sistem Digitalisasi Berita Acara - Registrasi Vendor Baru
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Registrasi</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Data Diri Lengkap</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Isi data diri dengan benar sesuai identitas resmi
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Email Valid</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Gunakan email aktif untuk verifikasi dan notifikasi
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Password Aman</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Gunakan kombinasi huruf dan angka minimal 6 karakter
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Catatan Penting</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Registrasi hanya untuk vendor/perusahaan</li>
                      <li>• PIC dan Direksi dibuat oleh administrator</li>
                      <li>• Pastikan data yang diisi valid dan dapat diverifikasi</li>
                      <li>• Setelah registrasi, silakan login dengan akun yang dibuat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              
              {/* Messages */}
              {successMessage && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-green-800">Registrasi Berhasil!</h3>
                      <p className="text-green-700 mt-1">{successMessage}</p>
                      <div className="mt-3 flex items-center text-green-600 text-sm">
                        <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Mengalihkan ke halaman login dalam 5 detik...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-red-800">Registrasi Gagal</h3>
                      <p className="text-red-700 mt-1">{errors.general}</p>
                      <button
                        onClick={() => setErrors({ ...errors, general: '' })}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Tutup pesan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-8">Form Registrasi Vendor</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-3 transition-all ${
                      errors.nama_lengkap 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {errors.nama_lengkap && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.nama_lengkap}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contoh@perusahaan.com"
                      className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-3 transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      disabled={isLoading || emailChecking}
                      required
                    />
                    {emailChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-3 transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      disabled={isLoading}
                      required
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                    {formData.password && !errors.password && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Password valid
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-3 transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      disabled={isLoading}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                    {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Password cocok
                      </p>
                    )}
                  </div>
                </div>

                {/* Perusahaan & Telepon Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Perusahaan */}
                  <div>
                    <label htmlFor="perusahaan" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      id="perusahaan"
                      name="perusahaan"
                      value={formData.perusahaan}
                      onChange={handleChange}
                      placeholder="Nama perusahaan (opsional)"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Telepon */}
                  <div>
                    <label htmlFor="no_telepon" className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="no_telepon"
                      name="no_telepon"
                      value={formData.no_telepon}
                      onChange={handleChange}
                      placeholder="081234567890 (opsional)"
                      className={`w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-3 transition-all ${
                        errors.no_telepon 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.no_telepon && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.no_telepon}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Alamat lengkap perusahaan (opsional)"
                    rows="4"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all resize-none"
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Jika tidak diisi, akan otomatis terisi "- belum diisi -"
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                        <span>Memproses Registrasi...</span>
                      </div>
                    ) : (
                      'Daftar Sekarang'
                    )}
                  </button>
                  
                  <p className="mt-4 text-center text-sm text-gray-600">
                    Dengan mendaftar, Anda menyetujui{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Syarat & Ketentuan
                    </a>{' '}
                    dan{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Kebijakan Privasi
                    </a>
                  </p>
                </div>

              </form>

              {/* Login Link */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-700">
                    Sudah punya akun?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center"
                    >
                      Masuk disini
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} DigiBA - Digitalisasi Berita Acara. Semua hak dilindungi undang-undang.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Need help?{' '}
            <a href="mailto:support@digiba.com" className="text-blue-600 hover:text-blue-500">
              support@digiba.com
            </a>{' '}
            |{' '}
            <a href="tel:+622112345678" className="text-blue-600 hover:text-blue-500">
              +62 21 1234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;