// src/hooks/useDocuments.js
import { useState, useCallback } from 'react';
import {
  bapbService,
  bappService,
  uploadService,
  documentsService,
} from '../services/api';
import {
  mapBAPBFieldsToBackend,
  mapBAPPFieldsToBackend,
  mapStatusToFrontend,
} from '../utils/fieldMapper';

export const useDocuments = (initialType = null) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    type: initialType,
  });

  const fetchDocumentStats = useCallback(async () => {
    try {
      const response = await documentsService.getStats();
      setDocumentStats(response.data);
    } catch (err) {
      console.error('Error fetching document stats:', err);
    }
  }, []);

  const fetchDocuments = useCallback(
    async (page = 1, customFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: pagination.itemsPerPage,
          ...filters,
          ...customFilters,
        };

        let response;
        if (initialType === 'all') {
          // Exclude 'type' param for combined fetch
          const { type: _, ...filteredParams } = params;
          response = await documentsService.getCombined(filteredParams);
          const combinedData = response.data?.data || [];
          setDocuments(combinedData);
          setPagination(response.data?.pagination || pagination);
        } else {
          const service = params.type === 'bapb' || initialType === 'bapb' ? bapbService : bappService;
          response = await service.getAll(params);
          const data = response.data?.data || response.data || [];
          setDocuments(data);
          setPagination(response.data?.pagination || pagination);
        }
        await fetchDocumentStats(); // Fetch stats after documents are loaded
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal mengambil data');
        console.error('Fetch documents error:', err);
      } finally {
        setLoading(false);
      }
    },
    [filters, initialType, pagination.itemsPerPage, fetchDocumentStats] 
  );

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchDocuments();
  }, [fetchDocuments]);

  const goToPage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, goToPage]);

  const deleteDocument = async (id, type) => {
    console.log('🗑️ deleteDocument called with:', { id, type });

    try {
      setLoading(true);
      const service = type === 'bapb' ? bapbService : bappService;
      console.log('🗑️ Using service:', service === bapbService ? 'bapbService' : 'bappService');

      console.log('🗑️ Calling service.delete with id:', id);
      await service.delete(id);
      console.log('🗑️ service.delete completed successfully');

      return { success: true };
    } catch (err) {
      console.log('❌ deleteDocument error:', err);
      console.log('❌ Error response:', err.response);
      return { success: false, error: err.response?.data?.message || 'Gagal menghapus dokumen' };
    } finally {
      setLoading(false);
    }
  };

  const submitDocument = async (id, type) => {
    try {
      setLoading(true);
      const service = type === 'bapb' ? bapbService : bappService;
      await service.submit(id);
      await fetchDocuments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal mengajukan dokumen' };
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (type, formData) => {
    try {
      setLoading(true);
      const mappedData =
        type === 'bapb'
          ? mapBAPBFieldsToBackend(formData)
          : mapBAPPFieldsToBackend(formData);

      const service = type === 'bapb' ? bapbService : bappService;
      const response = await service.post('', mappedData);

      await fetchDocuments();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal membuat dokumen' };
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (type, id, formData) => {
    try {
      setLoading(true);
      const mappedData =
        type === 'bapb'
          ? mapBAPBFieldsToBackend(formData)
          : mapBAPPFieldsToBackend(formData);

      const service = type === 'bapb' ? bapbService : bappService;
      await service.put(`/${id}`, mappedData);

      await fetchDocuments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal update dokumen' };
    } finally {
      setLoading(false);
    }
  };

  const uploadLampiran = async (type, id, files) => {
    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      await uploadService.post(`/${type}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal upload lampiran' };
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    deleteDocument,
    submitDocument,
    fetchDocuments,
    createDocument,
    updateDocument,
    uploadLampiran,
    mapStatusToFrontend,
    documentStats,
  };
};