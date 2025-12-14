import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, Briefcase, Calendar, MapPin, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/authcontext';
import { authService } from '../../services/api';

const getRoleDisplayName = (role) => {
  const roleNames = {
    'vendor': 'Vendor',
    'pic': 'PIC Gudang',
    'direksi': 'Direksi',
  };
  return roleNames[role] || role;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start text-gray-700 dark:text-gray-300">
    <div className="flex-shrink-0 w-6 h-6 mr-4 text-gray-500">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-gray-900 dark:text-white font-semibold text-base">{value || '-'}</p>
    </div>
  </div>
);

const ProfileSetting = () => {
  const { user: authUser } = useAuth(); // Rename to avoid confusion
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setProfile(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Gagal memuat profil lengkap.');
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 p-8">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-4 text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 p-8 bg-red-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="ml-4 text-red-700">{error}</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p className="text-gray-500 dark:text-gray-400">Data profil tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ProfileInfoItem icon={<User />} label="Nama Lengkap" value={profile.nama_lengkap} />
          <ProfileInfoItem icon={<Mail />} label="Email" value={profile.email} />
          <ProfileInfoItem icon={<Phone />} label="Telepon" value={profile.no_telepon} />
          {profile.role === 'vendor' && (
            <>
              <ProfileInfoItem icon={<Building />} label="Perusahaan" value={profile.perusahaan} />
              <ProfileInfoItem icon={<MapPin />} label="Alamat" value={profile.alamat} />
            </>
          )}
          {profile.role !== 'vendor' && (
            <ProfileInfoItem icon={<Briefcase />} label="Jabatan" value={profile.jabatan} />
          )}
          <ProfileInfoItem icon={<User />} label="Peran" value={getRoleDisplayName(profile.role)} />
          <ProfileInfoItem icon={<Calendar />} label="Tanggal Bergabung" value={formatDate(profile.created_at)} />
        </div>
    </div>
  );
};

export default ProfileSetting;