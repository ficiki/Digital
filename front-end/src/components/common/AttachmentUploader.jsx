import React, { useState, useEffect, useRef } from 'react';
import { uploadService } from '../../services/api'; // Assuming api.js exports uploadService
import {
  XMarkIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from './loading-spinner'; // Assuming this component exists
import Modal from './modal'; // Import Modal

const AttachmentUploader = ({
  jenisDokumen,
  idDokumen,
  readOnly = false,
  onAttachmentsChange, // Callback for parent to get updated *uploaded* attachment list
  onFilesSelected, // New callback for parent to get *selected* files
  // initialAttachments is not needed in this context, as FormTambahDokumen manages selected files internally
  // It's mainly for components displaying pre-existing attachments fetched from API
  allowedFileTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFileSizeMB = 10,
  maxFiles = 5,
  required = false, // Add required prop
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Initialize as empty array, will be populated by fetchAttachments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Function to fetch attachments from API
  const fetchAttachments = async () => {
    if (!idDokumen) return; // Only fetch if document ID is available
    setLoading(true);
    try {
      const response = await uploadService.getAttachments(jenisDokumen, idDokumen);
      const fetched = response.data.data.map((file) => ({
        ...file,
        id: file.id_lampiran, // Normalize id field
        name: file.nama_file_asli, // Normalize name field
      }));
      setUploadedFiles(fetched);
      if (onAttachmentsChange) {
        onAttachmentsChange(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch attachments:', err);
      setError('Gagal memuat lampiran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [jenisDokumen, idDokumen]);

  const handleFileSelect = (event) => {
    setError(null);
    const files = Array.from(event.target.files);
    const newFiles = [];

    for (const file of files) {
      if (selectedFiles.length + uploadedFiles.length + newFiles.length >= maxFiles) {
        setError(`Maksimal ${maxFiles} file dapat diunggah.`);
        break;
      }

      // Check file type
      const isFileTypeAllowed = allowedFileTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type.includes(type.replace('.', '')) || file.name.toLowerCase().endsWith(type);
      });

      if (!isFileTypeAllowed) {
        setError(
          `Jenis file ${file.name} tidak diizinkan. Hanya ${allowedFileTypes.join(', ')}.`
        );
        continue;
      }

      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`Ukuran file ${file.name} melebihi ${maxFileSizeMB} MB.`);
        continue;
      }
      newFiles.push(file);
    }

    const updatedSelectedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedSelectedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedSelectedFiles);
    }
  };

  const handleRemoveSelectedFile = (fileToRemove) => {
    const updatedSelectedFiles = selectedFiles.filter((file) => file !== fileToRemove);
    setSelectedFiles(updatedSelectedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedSelectedFiles);
    }
  };

  // Removed handleUploadAll - parent component will handle final upload


  const handleDownloadFile = (fileId) => {
    uploadService.downloadLampiran(fileId); // This should trigger a browser download
  };

  const handleDeleteUploadedFile = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      await uploadService.deleteLampiran(fileId);
      await fetchAttachments(); // Re-fetch attachments to update the list
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Gagal menghapus file. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const openDeleteConfirm = (fileId) => {
    setFileToDelete(fileId);
    setIsDeleteModalOpen(true);
  };

  return (
    <React.Fragment>
      <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lampiran Dokumen</h3>

        {loading && <LoadingSpinner />}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {!readOnly && (
          <div className="mb-4">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept={allowedFileTypes.join(',')}
              id="file-upload-input"
              name="attachmentFile" // Added name attribute
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Pilih File
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {selectedFiles.length > 0 ? `${selectedFiles.length} file dipilih` : 'Belum ada file dipilih'}
            </span>
          </div>
        )}

        {selectedFiles.length > 0 && !readOnly && (
          <div className="mb-4 p-3 border border-dashed rounded-md bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">File yang akan diunggah:</p>
            <ul className="divide-y divide-gray-200">
              {selectedFiles.map((file, index) => (
                <li key={index} className="py-2 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{file.name}</span>
                    <span className="ml-2 text-gray-500 text-xs">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(file)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {uploadedFiles.length > 0 ? 'Lampiran terunggah:' : 'Belum ada lampiran terunggah.'}
          </p>
          <ul className="divide-y divide-gray-200">
            {uploadedFiles.map((file) => (
              <li key={file.id_lampiran || file.id} className="py-2 flex items-center justify-between text-sm">
                <div className="flex items-center flex-grow">
                  <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 truncate">
                    {file.nama_file_asli || file.nama_file || file.name}
                  </span>
                  <span className="ml-2 text-gray-500 text-xs flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex items-center ml-4 space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadFile(file.id_lampiran || file.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-gray-100"
                    title="Unduh Lampiran"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => openDeleteConfirm(file.id_lampiran || file.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100"
                      title="Hapus Lampiran"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <p className="text-gray-700 mb-6">Anda yakin ingin menghapus lampiran ini?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => handleDeleteUploadedFile(fileToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default AttachmentUploader;
