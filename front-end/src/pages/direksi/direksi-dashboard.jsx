import React, { useState, useEffect } from 'react';
import { StatsGrid, CustomStatsGrid } from '../../components/common/statcard';
import BappPriorityTable from '../../components/direksi/bapp-priority-table';
import { useNavigate } from 'react-router-dom';
import { documentsService, bappService } from '../../services/api'; // Import services
import { Clock, XCircle, CheckCircle, Calendar } from 'lucide-react'; // Import icons

const DireksiDashboard = () => {
  const navigate = useNavigate();
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [loadingBappList, setLoadingBappList] = useState(true);
  const [errorBappList, setErrorBappList] = useState(null);

  const [dashboardStats, setDashboardStats] = useState([]);
  const [bappPriorityList, setBappPriorityList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Menampilkan 3 item per halaman di dashboard

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      // Fetch stats
      try {
        setLoadingStats(true);
        const statsResponse = await documentsService.getStats(); // Assuming this service provides relevant stats
        const fetchedStats = [
          {
            title: 'BAPP Menunggu',
            value: statsResponse.data.pendingBapp || '0', 
            iconComponent: <Clock size={24} />,
            color: 'orange',
          },
          {
            title: 'Dokumen Ditolak',
            value: statsResponse.data.rejectedBapp || '0', 
            iconComponent: <XCircle size={24} />,
            color: 'red',
          },
          {
            title: 'Dokumen Disetujui',
            value: statsResponse.data.approvedBapp || '0', 
            iconComponent: <CheckCircle size={24} />,
            color: 'green',
          },
        ];
        setDashboardStats(fetchedStats);
      } catch (err) {
        setErrorStats(err);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }

      // Fetch BAPP priority list
      try {
        setLoadingBappList(true);
        const bappListResponse = await bappService.getAll({ status: 'submitted' }); // Fetch BAPP with status 'submitted'
        setBappPriorityList(bappListResponse.data.data || []);
      } catch (err) {
        setErrorBappList(err);
        console.error('Error fetching BAPP priority list:', err);
      } finally {
        setLoadingBappList(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  const handleReview = (bapp) => {
    // Navigate ke halaman persetujuan BAPP dengan data item
    navigate(`/direksi/persetujuan-bapp/${bapp.id}`, { state: { bappData: bapp } }); // Use bapp.id
  };

  // Fungsi untuk pagination
  const handlePageChange = (action) => {
    const totalPages = Math.ceil(bappPriorityList.length / itemsPerPage);
    
    switch (action) {
      case 'first':
        setCurrentPage(1);
        break;
      case 'prev':
        if (currentPage > 1) setCurrentPage(currentPage - 1);
        break;
      case 'next':
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
        break;
      case 'last':
        setCurrentPage(totalPages);
        break;
      default:
        break;
    }
  };

  // Hitung data yang ditampilkan berdasarkan pagination
  const totalItems = bappPriorityList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = bappPriorityList.slice(startIndex, endIndex);

  // Konfigurasi pagination
  const paginationConfig = {
    currentPage,
    lastPage: totalPages,
    from: totalItems > 0 ? startIndex + 1 : 0,
    to: endIndex,
    total: totalItems
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Dashboard Direksi</h1>
        <p className="text-gray-500 mt-1">Overview Projek & Persetujuan</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        {loadingStats ? (
          <p>Loading stats...</p>
        ) : errorStats ? (
          <p className="text-red-500">Error loading stats: {errorStats.message}</p>
        ) : (
          <CustomStatsGrid stats={dashboardStats} />
        )}
      </div>

      {/* BAPP Priority List */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          BAPP Priority List
        </h2>
        {loadingBappList ? (
          <p>Loading BAPP priority list...</p>
        ) : errorBappList ? (
          <p className="text-red-500">Error loading BAPP priority list: {errorBappList.message}</p>
        ) : (
          <BappPriorityTable
            data={currentData}
            onReview={handleReview}
            pagination={paginationConfig}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
};

export default DireksiDashboard;