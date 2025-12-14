import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { Zap, Eye, Rocket } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, logout } = useAuth();

  // Debug log
  useEffect(() => {
    console.log('🏠 HomePage auth state:', { isAuthenticated, userRole });
  }, [isAuthenticated, userRole]);



  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Tampilkan loading jika masih checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              D
            </div>
            <span className="text-xl font-bold text-blue-900">DigiBA</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {isAuthenticated ? (
              <>
                <span className="text-blue-600">Halo, {userRole}</span>
                <button 
                  onClick={handleLogout}
                  className="hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
              </>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              null
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Digitalisasi Berita Acara <br className="hidden md:inline" />
              <span className="text-blue-600">Lebih Cepat & Transparan</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-slate-600 mb-10 leading-relaxed">
              Sistem modern untuk mengelola, melacak, dan mengarsipkan berita acara pemerintahan dan bisnis dengan
              efisiensi tinggi. Tinggalkan cara lama, beralih ke digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    switch (userRole) {
                      case 'direksi':
                        navigate('/direksi/dashboard');
                        break;
                      case 'pic':
                        navigate('/pic-gudang/dashboard');
                        break;
                      case 'vendor':
                        navigate('/vendor/dashboard');
                        break;
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-base font-medium text-white shadow transition-colors hover:bg-blue-700"
                >
                  Lanjut ke Dashboard
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-base font-medium text-white shadow transition-colors hover:bg-blue-700"
                >
                  Masuk ke Sistem
                </Link>
              )}
              
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Mengapa Memilih DigiBA?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Platform kami dirancang khusus untuk meningkatkan produktivitas dan akuntabilitas instansi Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <Zap className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Efisiensi Tinggi</h3>
                <p className="text-slate-600">
                  Otomatisasi proses pembuatan dokumen menghemat waktu hingga 70% dibandingkan
                  cara manual.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <Eye className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Transparansi Penuh</h3>
                <p className="text-slate-600">
                  Setiap perubahan dan persetujuan tercatat dalam log sistem yang tidak dapat diubah, menjamin
                  akuntabilitas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <Rocket className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Kecepatan Akses</h3>
                <p className="text-slate-600">
                  Cari dan temukan dokumen berita acara dalam hitungan detik dengan sistem pencarian cerdas
                  berbasis metadata.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                D
               </div>
              <span className="text-xl font-bold text-blue-900">DigiBA</span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} DigiBA. All rights reserved. <br />
              A digital solution for modern governance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;