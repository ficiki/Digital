import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BapbTable from '../../../components/pic-gudang/bapb-table';
import { useDocuments } from '../../../hooks/useDocuments';
import LoadingSpinner from '../../../components/common/loading-spinner';
import ErrorBoundary from '../../../components/common/error-boundary';

const DokumenOverview = () => {
  const navigate = useNavigate();
  const { documents, loading, error, fetchDocuments } = useDocuments('bapb');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleView = (dokumen) => {
    navigate(`/pic-gudang/dokumen-overview/${dokumen.nomor_bapb}`, {
      state: { dokumen }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dokumen Overview</h1>
        <p className="text-gray-500 mt-1">Lihat semua dokumen BAPB yang disetujui dan ditolak</p>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorBoundary message={error} />}
      {!loading && !error && (
        <BapbTable data={documents} onView={handleView} />
      )}
    </div>
  );
};

export default DokumenOverview;