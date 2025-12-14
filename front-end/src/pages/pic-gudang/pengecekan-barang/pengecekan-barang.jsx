import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Package } from 'lucide-react';
import { bapbService } from '../../../services/api';
import LoadingSpinner from '../../../components/common/loading-spinner';

const PengecekanBarang = () => {
    const { id } = useParams(); // Document ID from URL
    const navigate = useNavigate();
    const location = useLocation();

    const [dokumen, setDokumen] = useState(null);
    const [barangList, setBarangList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDokumen = async () => {
            setIsLoading(true);
            try {
                let docData;
                if (location.state?.dokumen) {
                    docData = location.state.dokumen;
                } else {
                    const response = await bapbService.getById(id);
                    docData = response.data;
                }
                
                // Pastikan rincian_barang adalah array
                if (typeof docData.rincian_barang === 'string') {
                    docData.rincian_barang = JSON.parse(docData.rincian_barang);
                }

                setDokumen(docData);
                // Inisialisasi barangList dengan properti 'checked' dan 'catatan'
                setBarangList((docData.rincian_barang || []).map(item => ({
                    ...item,
                    checked: false, // default ke belum dicek
                    catatan_pic: '' // catatan spesifik per item dari PIC
                })));
            } catch (err) {
                setError('Gagal memuat data dokumen. Mungkin dokumen tidak ditemukan atau ada masalah jaringan.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDokumen();
    }, [id, location.state]);

    const handleKembaliKeList = () => {
        const confirm = window.confirm('Apakah Anda yakin ingin kembali? Progress pengecekan akan hilang.');
        if (confirm) {
            navigate('/pic-gudang/pengecekan-barang/pengecekan-overview');
        }
    };

    const handleCheckboxChange = (index) => {
        setBarangList(prevList => {
            const newList = [...prevList];
            newList[index] = { ...newList[index], checked: !newList[index].checked };
            return newList;
        });
    };

    const handleCatatanChange = (index, value) => {
        setBarangList(prevList => {
            const newList = [...prevList];
            newList[index] = { ...newList[index], catatan_pic: value };
            return newList;
        });
    };

    const allItemsChecked = barangList.length > 0 && barangList.every(item => item.checked);

    const handleSelesaikanPengecekan = async () => {
        if (!allItemsChecked) {
            alert('Harap lakukan pengecekan untuk semua barang terlebih dahulu!');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                rincian_barang_review: barangList,
                catatan_pic: 'Semua barang telah dicek oleh PIC Gudang.' // Bisa ditambahkan field input untuk ini
            };

            await bapbService.review(id, payload);
            
            navigate('/pic-gudang/persetujuan-bapb', { 
                state: { message: 'Pengecekan barang berhasil disimpan! Dokumen telah dipindahkan ke menu Persetujuan BAPB.' }
            });

        } catch (err) {
            setError(err.message || 'Gagal menyimpan hasil pengecekan.');
            console.error(err);
            alert(err.message || 'Gagal menyimpan hasil pengecekan.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500">
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Kembali
                </button>
            </div>
        );
    }

    if (!dokumen) {
        return null; // atau fallback UI lain
    }


    return (
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={handleKembaliKeList}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Kembali ke Daftar Pengecekan</span>
            </button>

            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pengecekan Barang: {dokumen.nomor_bapb}</h1>
                <p className="text-gray-500 mt-1">Lakukan pengecekan dan verifikasi kondisi barang yang diterima.</p>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Overview & List Barang */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview Dokumen */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Overview Dokumen</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Nama Proyek</p>
                                <p className="font-semibold text-gray-900">{dokumen.nama_projek}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Deskripsi</p>
                                <p className="text-gray-700">{dokumen.deskripsi_pekerjaan}</p>
                            </div>
                        </div>
                    </div>

                    {/* List Barang - Pengecekan */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">List Barang untuk Dicek</h2>
                        </div>
                        <div className="space-y-4">
                            {barangList.map((barang, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            checked={barang.checked}
                                            onChange={() => handleCheckboxChange(index)}
                                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{barang.nama_barang}</h3>
                                            <p className="text-sm text-gray-600">{barang.jumlah} {barang.satuan}</p>
                                            <textarea
                                                value={barang.catatan_pic}
                                                onChange={(e) => handleCatatanChange(index, e.target.value)}
                                                placeholder="Tulis catatan kondisi barang (opsional)"
                                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                rows={2}
                                                disabled={!barang.checked}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress Pengecekan:</span>
                                <span className="font-semibold text-blue-600">
                                    {barangList.filter(item => item.checked).length} / {barangList.length} barang
                                </span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${(barangList.filter(item => item.checked).length / barangList.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Info & Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dokumen</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Vendor</p>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{dokumen.vendor_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tanggal Pengajuan</p>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{new Date(dokumen.tanggal_dibuat).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mt-0.5">
                                        {dokumen.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={handleSelesaikanPengecekan}
                                disabled={!allItemsChecked || isLoading}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                    !allItemsChecked || isLoading
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isLoading ? 'Menyimpan...' : (allItemsChecked ? 'Selesai & Lanjut Persetujuan' : 'Selesaikan Pengecekan')}
                            </button>
                            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PengecekanBarang;