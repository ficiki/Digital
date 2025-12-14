import React, { useState, useEffect } from 'react';
import { StatsGrid } from "../../../components/common/statcard";
import BapbTable from "../../../components/pic-gudang/bapb-table";
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { bapbService } from '../../../services/api';
import LoadingSpinner from '../../../components/common/loading-spinner';

const PersetujuanOverview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [dokumenList, setDokumenList] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const fetchBapbForApproval = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Mengambil BAPB yang telah dicek oleh PIC (status 'reviewed')
            const response = await bapbService.getAll({ 
                status: 'reviewed', 
                page: page, 
                limit: 10 
            });
            setDokumenList(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setError('Gagal mengambil data dokumen untuk persetujuan. Silakan coba lagi nanti.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBapbForApproval(1);
    }, []);
    
    // Effect untuk menampilkan pesan sukses dari navigasi sebelumnya
    useEffect(() => {
        if (location.state?.message) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            // Membersihkan state lokasi untuk mencegah pesan muncul lagi saat refresh
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const handlePageChange = (page) => {
        fetchBapbForApproval(page);
    };

    const handleReviewDokumen = (dokumen) => {
        navigate(`/pic-gudang/persetujuan-bapb/${dokumen.id}`, {
            state: { dokumen }
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {showSuccessMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-semibold text-green-900">Pengecekan Berhasil Diselesaikan!</p>
                        <p className="text-sm text-green-700 mt-1">
                            {location.state.message}
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Persetujuan BAPB</h1>
                <p className="text-gray-500 mt-1">Daftar dokumen BAPB yang menunggu persetujuan akhir.</p>
            </div>

            <div className="mb-8">
                <StatsGrid />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Menunggu Persetujuan</h2>
                {loading ? (
                    <div className="text-center p-12"><LoadingSpinner /></div>
                ) : error ? (
                    <div className="text-center p-12 text-red-500">{error}</div>
                ) : (
                    <BapbTable
                        data={dokumenList}
                        onView={handleReviewDokumen}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default PersetujuanOverview;