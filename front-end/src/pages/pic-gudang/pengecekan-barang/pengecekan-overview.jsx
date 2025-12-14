import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsGrid } from "../../../components/common/statcard";
import BapbTable from '../../../components/pic-gudang/bapb-table';
import { bapbService } from '../../../services/api';
import LoadingSpinner from '../../../components/common/loading-spinner';

const PengecekanOverview = () => {
    const navigate = useNavigate();
    const [dokumenList, setDokumenList] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBapbForChecking = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Mengambil BAPB yang telah diajukan oleh vendor (status 'submitted')
            const response = await bapbService.getAll({ 
                status: 'submitted', 
                page: page, 
                limit: 10 
            });
            setDokumenList(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setError('Gagal mengambil data dokumen. Silakan coba lagi nanti.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBapbForChecking(1);
    }, []);

    const handlePageChange = (page) => {
        fetchBapbForChecking(page);
    };

    const handleMulaiPengecekan = (dokumen) => {
        // Navigasi ke halaman detail pengecekan, lewatkan seluruh objek dokumen
        navigate(`/pic-gudang/pengecekan-barang/${dokumen.id}`, {
            state: { dokumen }
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pengecekan Barang</h1>
                <p className="text-gray-500 mt-1">
                    Daftar dokumen BAPB yang perlu dilakukan pengecekan barang di gudang
                </p>
            </div>

            {/* Statistics Cards - Bisa disesuaikan nanti */}
            <div className="mb-8">
                <StatsGrid />
            </div>

            {/* Daftar Dokumen Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menunggu Pengecekan</h2>
            </div>

            {loading ? (
                <div className="text-center p-12">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="text-center p-12 text-red-500">{error}</div>
            ) : (
                <BapbTable 
                    data={dokumenList} 
                    onView={handleMulaiPengecekan}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default PengecekanOverview;