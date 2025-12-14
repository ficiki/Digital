import React, { useState, useEffect } from 'react';
import { CustomStatsGrid } from '../../components/common/statcard';
import BapbTable from "../../components/pic-gudang/bapb-table";
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/datatable';
import { bapbService, documentsService } from '../../services/api'; // Import bapbService and documentsService
import { Clock, XCircle, CheckCircle, Calendar } from 'lucide-react'; // Import icons

const PicDashboard = () => {
  const navigate = useNavigate();
  const [picBapbData, setPicBapbData] = useState([]);
  const [picDashboardStats, setPicDashboardStats] = useState([]);
  const [loadingBapb, setLoadingBapb] = useState(true);
  const [errorBapb, setErrorBapb] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch BAPB data
      try {
        setLoadingBapb(true);
        const response = await bapbService.getAll({ status: 'submitted' }); // Fetch 'submitted' BAPB data
        setPicBapbData(Array.isArray(response.data) ? response.data : []); 
      } catch (err) {
        setErrorBapb(err);
        console.error("Failed to fetch BAPB data for PIC dashboard:", err);
      } finally {
        setLoadingBapb(false);
      }

      // Fetch stats data
      try {
        setLoadingStats(true);
        const statsResponse = await documentsService.getStats();
        // Map the statsResponse data to the format expected by StatsGrid
        const formattedStats = [
          {
            title: 'Dokumen Menunggu', // Changed from 'BAPP Menunggu' to 'Dokumen Menunggu' to be more general
            value: statsResponse.data.submitted || '0', // Use 'submitted' from backend for pending
            iconComponent: <Clock size={24} />,
            color: 'orange',
          },
          {
            title: 'Dokumen Ditolak',
            value: statsResponse.data.rejected || '0', // Use 'rejected' from backend
            iconComponent: <XCircle size={24} />,
            color: 'red',
          },
          {
            title: 'Dokumen Disetujui',
            value: statsResponse.data.approved || '0', // Use 'approved' from backend
            iconComponent: <CheckCircle size={24} />,
            color: 'green',
          },

        ];
        setPicDashboardStats(formattedStats);
      } catch (err) {
        setErrorStats(err);
        console.error("Failed to fetch stats data for PIC dashboard:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Custom handler jika perlu (opsional)
  const handleViewBapb = (dokumen) => {
    navigate(`/pic-gudang/pengecekan-barang/${dokumen.id}`, { // Use dokumen.id if the API returns an id field
      state: { dokumen }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <h1 className="text-2xl font-bold">Selamat Datang, PIC Gudang!</h1>
        <p className="opacity-90">Overview Projek & Persetujuan</p>
      </div>

      <div className="mb-8">
        {loadingStats ? (
          <p>Loading stats...</p>
        ) : errorStats ? (
          <p className="text-red-500">Error loading stats: {errorStats.message}</p>
        ) : (
          <CustomStatsGrid stats={picDashboardStats} />
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">BAPB Priority List</h2>
        {loadingBapb ? (
          <p>Loading BAPB data...</p>
        ) : errorBapb ? (
          <p className="text-red-500">Error loading BAPB data: {errorBapb.message}</p>
        ) : (
          <BapbTable
            data={picBapbData}
            onView={handleViewBapb}
          />
        )}
      </div>
    </div>
  );
};

export default PicDashboard;