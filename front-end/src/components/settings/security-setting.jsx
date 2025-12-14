import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Key, CheckCircle, AlertCircle, Save, Shield, X } from 'lucide-react';

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

const getPasswordStrengthColor = (strength) => {
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getPasswordStrengthText = (strength) => {
  if (strength === 0) return '';
  if (strength < 40) return 'Lemah';
  if (strength < 70) return 'Cukup';
  return 'Kuat';
};

const SecuritySetting = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const validateForm = () => {
    const newErrors = {};
    const passwordStrength = calculatePasswordStrength(formData.newPassword);

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    } else if (formData.currentPassword.length < 6) {
      newErrors.currentPassword = 'Password harus minimal 6 karakter';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password baru harus minimal 8 karakter';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Password baru harus berbeda dengan password lama';
    } else if (passwordStrength < 40) {
      newErrors.newPassword = 'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });

      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage({
        type: 'success',
        text: 'Password berhasil diubah!'
      });
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setIsEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat mengubah password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);
  const passwordRequirements = [
    { label: 'Minimal 8 karakter', met: formData.newPassword.length >= 8 },
    { label: 'Mengandung huruf besar', met: /[A-Z]/.test(formData.newPassword) },
    { label: 'Mengandung huruf kecil', met: /[a-z]/.test(formData.newPassword) },
    { label: 'Mengandung angka', met: /[0-9]/.test(formData.newPassword) },
    { label: 'Mengandung simbol', met: /[^A-Za-z0-9]/.test(formData.newPassword) }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keamanan Akun</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola kata sandi dan pengaturan keamanan akun Anda
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Key size={18} />
            Ubah Password
          </button>
        )}
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Security Info Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <Shield size={36} />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Keamanan</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Pastikan akun Anda aman dengan password yang kuat
              </p>
            </div>
          </div>
        </div>

        {/* Security Tips - dalam card */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Key className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Tips Keamanan
              </h4>
              <ul className="text-blue-800 dark:text-blue-400 text-sm space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Gunakan kata sandi yang kuat dan unik</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Jangan gunakan kata sandi yang sama dengan akun lain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Ubah kata sandi secara berkala untuk keamanan maksimal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Password - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock size={16} />
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPasswords.currentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={({ target: { name, value } }) => handleChange({ target: { name, value } })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                    errors.currentPassword 
                      ? 'border-red-300 bg-red-50' 
                      : isEditing 
                      ? 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white' 
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
                  }`}
                  placeholder="Masukkan password saat ini"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswords.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password - Half Width */}
            <div>
              <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Key size={16} />
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={({ target: { name, value } }) => handleChange({ target: { name, value } })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                    errors.newPassword 
                      ? 'border-red-300 bg-red-50' 
                      : isEditing 
                      ? 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white' 
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
                  }`}
                  placeholder="Masukkan password baru"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {errors.newPassword && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password - Half Width */}
            <div>
              <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock size={16} />
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={({ target: { name, value } }) => handleChange({ target: { name, value } })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                    errors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : isEditing 
                      ? 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white' 
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
                  }`}
                  placeholder="Konfirmasi password baru"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Strength & Requirements - Full Width */}
            {isEditing && formData.newPassword && (
              <div className="md:col-span-2 space-y-4">
                {/* Password Strength Meter */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kekuatan Password</span>
                    <span className={`text-sm font-semibold ${
                      passwordStrength < 40 ? 'text-red-600 dark:text-red-400' :
                      passwordStrength < 70 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Persyaratan Password:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          req.met 
                            ? 'bg-green-500 dark:bg-green-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          {req.met && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${
                          req.met 
                            ? 'text-green-700 dark:text-green-400 font-medium' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Hanya tombol Simpan dan Batal */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading || !isEditing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading || !isEditing}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              <X size={18} />
              Batal
            </button>
          </div>
        </form>
      </div>

      {/* Additional Info - di luar card */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
        <div className="flex gap-3">
          <Shield className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              Perlindungan Akun
            </h3>
            <ul className="text-yellow-800 dark:text-yellow-400 text-sm space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Pastikan Anda menggunakan koneksi internet yang aman</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Jangan gunakan password yang mudah ditebak seperti tanggal lahir atau nama</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Selalu logout setelah menggunakan aplikasi di perangkat bersama</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySetting;