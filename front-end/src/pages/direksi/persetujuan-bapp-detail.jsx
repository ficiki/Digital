import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Download, FileText, Calendar, DollarSign, User, Info, Paperclip } from 'lucide-react';
import { bappService, formatDate, formatCurrency, uploadService } from '../../services/api';
import LoadingSpinner from '../../components/common/loading-spinner';
import { useNotification } from '../../contexts/notification-context';

const PersetujuanBappDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
    const [catatan, setCatatan] = useState('');
    const [bappData, setBappData] = useState(null);
    const [attachments, setAttachments] = useState([]); // State untuk dokumen pendukung
    const { addNotification } = useNotification();

    useEffect(() => {
        fetchBappDetail();
    }, [id]);

    const fetchBappDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await bappService.getById(id);
            setBappData(response.data);

            const attachmentsResponse = await uploadService.getAttachments('bapp', id);
            console.log('API attachments response (BAPP):', attachmentsResponse); // Log the full response
            setAttachments(attachmentsResponse.data.data || []);
            console.log('Attachments state after setting (BAPP):', attachmentsResponse.data.data || []); // Log the data being set to state

        } catch (err) {
            console.error('Error fetching BAPP detail:', err);
            setError(err.message || 'Gagal mengambil detail dokumen BAPP.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = (action) => {
        setApprovalAction(action);
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        setIsSubmitting(true);
        try {
            let responseMessage = '';
            if (approvalAction === 'approve') {
                await bappService.approveDireksi(id, { catatan });
                responseMessage = `BAPP ${bappData.nomor_bapp} berhasil disetujui.`;
                addNotification({ message: responseMessage, type: 'success' });
            } else if (approvalAction === 'reject') {
                await bappService.reject(id, { catatan });
                responseMessage = `BAPP ${bappData.nomor_bapp} berhasil ditolak.`;
                addNotification({ message: responseMessage, type: 'error' });
            }
            
            setShowApprovalModal(false);
            navigate('/direksi/persetujuan-bapp', { 
                state: { message: responseMessage }
            });

        } catch (err) {
            console.error('Failed to submit approval:', err);
            addNotification({
                title: 'Gagal Menyetujui/Menolak',
                message: `Terjadi kesalahan saat memproses BAPP: ${err.message}`,
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDownload = async (attachmentId, filename) => {
        try {
            const response = await uploadService.downloadLampiran(attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            addNotification({
                title: 'Unduhan Gagal',
                message: 'Gagal mengunduh lampiran. Silakan coba lagi.',
                type: 'error',
            });
            console.error('Download error:', err);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-center p-12 text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => navigate('/direksi/persetujuan-bapp')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Kembali ke List
                </button>
            </div>
        );
    }
    
    if (!bappData) {
        return (
             <div className="text-center p-12 text-gray-500">
                <p>Data BAPP tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/direksi/persetujuan-bapp')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Kembali ke List</span>
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1e3a8a]">{bappData.nomor_bapp}</h1>
                <p className="text-gray-500 mt-1">Review dan persetujuan BAPP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <InfoCard icon={FileText} label="No. Kontrak" value={bappData.no_kontrak} color="blue" />
                 <InfoCard icon={DollarSign} label="Nilai Kontrak" value={formatCurrency(bappData.nilai)} color="green" />
                 <InfoCard icon={Calendar} label="Tgl. Kontrak" value={formatDate(bappData.tanggal_kontrak)} color="purple" />
                 <InfoCard icon={User} label="Vendor" value={bappData.vendor_name} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Pekerjaan</h2>
                        <DetailSection title="Lokasi Pekerjaan" content={bappData.lokasi_pekerjaan} />
                        <DetailSection title="Hasil Pemeriksaan" content={bappData.hasil_pemeriksaan} />
                        {bappData.keterangan && <DetailSection title="Keterangan Tambahan" content={bappData.keterangan} />}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                         <h2 className="text-xl font-semibold text-gray-800 mb-4">Rincian Pekerjaan</h2>
                         <RincianPekerjaanTable items={bappData.rincian_pekerjaan} />
                    </div>

                    {/* Dokumen Pendukung */}
                    {attachments.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dokumen Pendukung</h2>
                            <div className="space-y-3">
                                {attachments.map((dok) => (
                                    <div key={dok.id_lampiran} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Paperclip size={20} className="text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{dok.nama_file_asli}</p>
                                                <p className="text-xs text-gray-500">{dok.jenis_file || 'Lampiran'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDownload(dok.id_lampiran, dok.nama_file_asli)} 
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Action Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tindakan</h3>
                        {bappData.status === 'approved_direksi' ? (
                            <div className="space-y-3 text-center">
                                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                                    <p className="font-semibold">Dokumen telah disetujui.</p>
                                </div>
                            </div>
                        ) : bappData.status === 'rejected' ? (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                                <p className="font-semibold">Dokumen telah ditolak.</p>
                                {bappData.catatan && <p className="text-sm mt-2">Catatan: {bappData.catatan}</p>}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button onClick={() => handleApproval('approve')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    <CheckCircle size={20} />
                                    <span>Setujui BAPP</span>
                                </button>
                                <button onClick={() => handleApproval('reject')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                    <XCircle size={20} />
                                    <span>Tolak BAPP</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {approvalAction === 'approve' ? 'Setujui BAPP' : 'Tolak BAPP'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Anda yakin ingin {approvalAction === 'approve' ? 'menyetujui' : 'menolak'} BAPP {bappData.nomor_bapp}?
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan {approvalAction === 'reject' ? '(Wajib)' : '(Opsional)'}
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows="4"
                                placeholder="Tambahkan catatan..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowApprovalModal(false)} className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors">
                                Batal
                            </button>
                            <button
                                onClick={submitApproval}
                                disabled={isSubmitting || (approvalAction === 'reject' && !catatan.trim())}
                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                                    approvalAction === 'approve'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const InfoCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{value || '-'}</p>
                </div>
            </div>
        </div>
    );
};

const DetailSection = ({ title, content }) => (
    <div>
        <label className="text-sm font-medium text-gray-600">{title}</label>
        <p className="text-gray-800 mt-1 leading-relaxed">{content}</p>
    </div>
);

const RincianPekerjaanTable = ({ items }) => {
    let parsedItems = [];

    // Safely parse items
    if (typeof items === 'string' && items.trim().startsWith('[')) {
        try {
            parsedItems = JSON.parse(items);
        } catch (error) {
            console.error("Failed to parse rincian pekerjaan:", error);
            // Fallback to empty array
        }
    } else if (Array.isArray(items)) {
        parsedItems = items;
    }

    if (!parsedItems || parsedItems.length === 0) {
        return <p className="text-gray-500">Tidak ada rincian pekerjaan.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {parsedItems.map((item, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.item}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jumlah} {item.satuan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.harga_satuan)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default PersetujuanBappDetail;