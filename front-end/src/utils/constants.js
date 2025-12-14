// Status constants
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REVIEWED_PIC: 'reviewed_pic',
  APPROVED_DIREKSI: 'approved_direksi',
  REJECTED: 'rejected'
};

// Status labels untuk display
export const STATUS_LABELS = {
  [DOCUMENT_STATUS.DRAFT]: 'Draft',
  [DOCUMENT_STATUS.SUBMITTED]: 'Menunggu Review',
  [DOCUMENT_STATUS.REVIEWED]: 'Direview',
  [DOCUMENT_STATUS.APPROVED]: 'Disetujui',
  [DOCUMENT_STATUS.REVIEWED_PIC]: 'Direview PIC',
  [DOCUMENT_STATUS.APPROVED_DIREKSI]: 'Disetujui Direksi',
  [DOCUMENT_STATUS.REJECTED]: 'Ditolak'
};

// Status colors untuk badge
export const STATUS_COLORS = {
  [DOCUMENT_STATUS.DRAFT]: 'gray',
  [DOCUMENT_STATUS.SUBMITTED]: 'yellow',
  [DOCUMENT_STATUS.REVIEWED]: 'blue',
  [DOCUMENT_STATUS.APPROVED]: 'green',
  [DOCUMENT_STATUS.REVIEWED_PIC]: 'blue',
  [DOCUMENT_STATUS.APPROVED_DIREKSI]: 'green',
  [DOCUMENT_STATUS.REJECTED]: 'red'
};

// Status badge classes
export const STATUS_BADGE_CLASSES = {
  [DOCUMENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [DOCUMENT_STATUS.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
  [DOCUMENT_STATUS.REVIEWED]: 'bg-blue-100 text-blue-800',
  [DOCUMENT_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [DOCUMENT_STATUS.REVIEWED_PIC]: 'bg-blue-100 text-blue-800',
  [DOCUMENT_STATUS.APPROVED_DIREKSI]: 'bg-green-100 text-green-800',
  [DOCUMENT_STATUS.REJECTED]: 'bg-red-100 text-red-800'
};

// Document types
export const DOCUMENT_TYPES = {
  BAPB: 'bapb',
  BAPP: 'bapp'
};

// Document type labels
export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.BAPB]: 'BAPB',
  [DOCUMENT_TYPES.BAPP]: 'BAPP'
};

// Document type colors
export const DOCUMENT_TYPE_COLORS = {
  [DOCUMENT_TYPES.BAPB]: 'blue',
  [DOCUMENT_TYPES.BAPP]: 'green'
};

// User roles
export const USER_ROLES = {
  VENDOR: 'vendor',
  PIC: 'pic',
  DIREKSI: 'direksi'
};

// User role labels
export const USER_ROLE_LABELS = {
  [USER_ROLES.VENDOR]: 'Vendor',
  [USER_ROLES.PIC]: 'PIC Gudang',
  [USER_ROLES.DIREKSI]: 'Direksi'
};

// Route paths based on role
export const ROLE_ROUTES = {
  [USER_ROLES.VENDOR]: '/vendor/dashboard',
  [USER_ROLES.PIC]: '/pic-gudang/dashboard',
  [USER_ROLES.DIREKSI]: '/direksi/dashboard'
};

// Allowed file types untuk upload
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Allowed file extensions
export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.doc',
  '.docx'
];

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 25, 50]
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss'
};

// Currency format options
export const CURRENCY_OPTIONS = {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
};

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Email tidak valid',
  MIN_LENGTH: (min) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max) => `Maksimal ${max} karakter`,
  MIN_VALUE: (min) => `Nilai minimal ${min}`,
  MAX_VALUE: (max) => `Nilai maksimal ${max}`,
  INVALID_FILE_TYPE: 'Tipe file tidak didukung',
  FILE_TOO_LARGE: (maxSize) => `File terlalu besar. Maksimal ${maxSize}MB`
};

// API error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Tidak ada koneksi ke server',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses ke resource ini',
  NOT_FOUND: 'Resource tidak ditemukan',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  VALIDATION_ERROR: 'Data yang dikirim tidak valid'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATE_DOCUMENT: 'Dokumen berhasil dibuat',
  UPDATE_DOCUMENT: 'Dokumen berhasil diperbarui',
  DELETE_DOCUMENT: 'Dokumen berhasil dihapus',
  SUBMIT_DOCUMENT: 'Dokumen berhasil diajukan',
  UPLOAD_FILE: 'File berhasil diupload',
  DELETE_FILE: 'File berhasil dihapus'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Environment
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
};

// Export semua constants
export default {
  DOCUMENT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BADGE_CLASSES,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS,
  ROLE_ROUTES,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  PAGINATION_DEFAULTS,
  DATE_FORMATS,
  CURRENCY_OPTIONS,
  VALIDATION_MESSAGES,
  API_ERRORS,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ENV
};