/**
 * Utility untuk mapping field antara frontend dan backend
 */

// ============================
// FIELD MAPPING: FRONTEND → BACKEND
// ============================

/**
 * Map form data frontend ke format backend untuk BAPB
 */
export const mapBAPBFieldsToBackend = (frontendData) => {
  console.log('🔄 Mapping BAPB frontend to backend:', frontendData);

  const itemsMapped = (frontendData.items || []).map(item => ({
    nama_barang: item.nama_barang,
    jumlah: item.jumlah,
    satuan: item.satuan,
    keterangan: item.keterangan,
    status_pemeriksaan: item.kondisi === 'Baik' ? 'sesuai' : (item.kondisi === 'Tidak Sesuai' ? 'tidak_sesuai' : 'tidak_sesuai') // 'Rusak' also maps to 'tidak_sesuai'
  }));

  const backendData = {
    nomor_bapb: frontendData.noDokumen || frontendData.nomor_bapb,
    no_kontrak: frontendData.nomorSuratPesanan || frontendData.no_kontrak,
    nama_projek: frontendData.projek || frontendData.nama_projek,
    nilai_kontrak: parseFloat(frontendData.nilaiKontrak) > 0 ? parseFloat(frontendData.nilaiKontrak) : null,
    deskripsi_pekerjaan: frontendData.deskripsiPekerjaan || frontendData.deskripsi_pekerjaan,
    tanggal_dibuat: frontendData.tanggalDibuat || frontendData.tanggal_dibuat || new Date().toISOString().split('T')[0],
    deadline: frontendData.deadline || frontendData.deadline,
    tanggal_pengiriman: frontendData.tanggalPengiriman || frontendData.tanggal_pengiriman,
    kurir_pengiriman: frontendData.kurirPengiriman || frontendData.kurir_pengiriman,
    rincian_barang: JSON.stringify(itemsMapped),
    hasil_pemeriksaan: frontendData.hasilPemeriksaan || frontendData.hasil_pemeriksaan || 'Sesuai',
    catatan_tambahan: frontendData.catatanTambahan || frontendData.catatan_tambahan,
    status: 'draft'
  };

  console.log('📦 Backend data:', backendData);
  return backendData;
};

/**
 * Map form data frontend ke format backend untuk BAPP
 */
export const mapBAPPFieldsToBackend = (frontendData) => {
  // Generate nomor BAPP jika tidak ada
  const nomor_bapp = frontendData.noDokumen ||
                    frontendData.nomor_bapp ||
                    generateDocNumber('BAPP');

  // Parse nilai kontrak dari string ke number
  const nilai_kontrak = parseFloat(
    (frontendData.nilaiKontrak || frontendData.nilai_kontrak || 0)
      .toString()
      .replace(/[^0-9.-]+/g, '')
  ) || 0;

  return {
    // Field utama
    nomor_bapp: nomor_bapp,
    no_kontrak: frontendData.nomorSuratPesanan || frontendData.no_kontrak || '',
    tanggal_kontrak: frontendData.tanggal_kontrak ||
                    frontendData.tanggalKontrak ||
                    new Date().toISOString().split('T')[0],
    nilai_kontrak: nilai_kontrak,

    // Field khusus BAPP
    lokasi_pekerjaan: frontendData.lokasiPekerjaan ||
                     frontendData.lokasi_pekerjaan || '',
    rincian_pekerjaan: frontendData.items && frontendData.items.length > 0 ?
                      frontendData.items.map(item => ({
                        item: item.nama_barang, // Map nama_barang to item
                        jumlah: item.jumlah,
                        satuan: item.satuan,
                        harga_satuan: item.harga_satuan, // Include harga_satuan
                        total: item.total // Include total
                      })) :
                      [], // Ensure it sends an empty array if no items
    hasil_pemeriksaan: frontendData.statusPekerjaan ||
                      frontendData.hasilPemeriksaan ||
                      frontendData.hasil_pemeriksaan || 'Selesai',
    keterangan: frontendData.catatanTambahan || frontendData.keterangan || '',
    deadline: frontendData.deadline || null, // Add deadline here
    // Status default
    status: 'draft'
  };
};

// ============================
// FIELD MAPPING: BACKEND → FRONTEND
// ============================

/**
 * Map data backend ke format frontend untuk BAPB
 */
export const mapBAPBFieldsToFrontend = (backendData) => {
  // Parse rincian_barang dari JSON string ke array
  let items = [];
  try {
    if (typeof backendData.rincian_barang === 'string') {
      const parsedItems = backendData.rincian_barang ? JSON.parse(backendData.rincian_barang) : [];
      items = parsedItems.map(item => ({
        nama_barang: item.nama_barang || '',
        jumlah: item.jumlah || 0,
        satuan: item.satuan || 'unit',
        spesifikasi: item.spesifikasi || '',
        keterangan: item.keterangan || '',
        kondisi: item.kondisi || 'Baik', // Default for BAPB
        id: item.id || Math.random() // Ensure a unique ID for React keys if not present
      }));
    } else {
      // If it's already an array, or null/undefined, handle it directly
      items = (backendData.rincian_barang || []).map(item => ({
        nama_barang: item.nama_barang || '',
        jumlah: item.jumlah || 0,
        satuan: item.satuan || 'unit',
        spesifikasi: item.spesifikasi || '',
        keterangan: item.keterangan || '',
        kondisi: item.kondisi || 'Baik',
        id: item.id || Math.random()
      }));
    }
  } catch(e) {
    console.error('Failed to parse rincian_barang:', e);
    console.log('Original rincian_barang:', backendData.rincian_barang);
    items = [];
  }

  return {
    // Field utama
    noDokumen: backendData.nomor_bapb,
    nomor_bapb: backendData.nomor_bapb,
    nomorSuratPesanan: backendData.no_kontrak,
    no_kontrak: backendData.no_kontrak,
    tanggal_kontrak: backendData.tanggal_kontrak,
    tanggalKontrak: backendData.tanggal_kontrak,
    nilaiKontrak: backendData.nilai_kontrak,
    nilai_kontrak: backendData.nilai_kontrak,
    
    // Field khusus BAPB
    tanggalPengiriman: backendData.tanggal_pengiriman,
    tanggal_pengiriman: backendData.tanggal_pengiriman,
    lokasiPengiriman: backendData.lokasi_pengiriman,
    lokasi_pengiriman: backendData.lokasi_pengiriman,
    
    // Field deskripsi
    items: items,
    rincian_barang: backendData.rincian_barang,
    catatanTambahan: backendData.keterangan,
    keterangan: backendData.keterangan,
    
    // Metadata
    status: backendData.status,
    id: backendData.id_bapb,
    id_bapb: backendData.id_bapb,
    created_at: backendData.created_at,
    updated_at: backendData.updated_at,
    
    // Joined fields
    vendor_nama: backendData.vendor_nama,
    nama_perusahaan: backendData.nama_perusahaan,
    pic_nama: backendData.pic_nama
  };
};

/**
 * Map data backend ke format frontend untuk BAPP
 */
export const mapBAPPFieldsToFrontend = (backendData) => {
  // Parse rincian_pekerjaan dari JSON string ke array
  let items = [];
  try {
    if (typeof backendData.rincian_pekerjaan === 'string') {
        const parsedItems = backendData.rincian_pekerjaan ? JSON.parse(backendData.rincian_pekerjaan) : [];
        items = parsedItems.map(item => ({
        nama_barang: item.nama_barang || '',
        jumlah: item.jumlah || 0,
        satuan: item.satuan || 'unit',
        spesifikasi: item.spesifikasi || '',
        keterangan: item.keterangan || '',
        progress: item.progress || '', // Default for BAPP
        id: item.id || Math.random() // Ensure a unique ID for React keys if not present
    }));
    } else {
        items = (backendData.rincian_pekerjaan || []).map(item => ({
            nama_barang: item.nama_barang || '',
            jumlah: item.jumlah || 0,
            satuan: item.satuan || 'unit',
            spesifikasi: item.spesifikasi || '',
            keterangan: item.keterangan || '',
            progress: item.progress || '',
            id: item.id || Math.random()
        }));
    }
  } catch (e) {
    console.error('Failed to parse rincian_pekerjaan:', e);
    console.log('Original rincian_pekerjaan:', backendData.rincian_pekerjaan);
    items = [];
  }

  return {
    // Field utama
    noDokumen: backendData.nomor_bapp,
    nomor_bapp: backendData.nomor_bapp,
    nomorSuratPesanan: backendData.no_kontrak,
    no_kontrak: backendData.no_kontrak,
    tanggal_kontrak: backendData.tanggal_kontrak,
    tanggalKontrak: backendData.tanggal_kontrak,
    nilaiKontrak: backendData.nilai_kontrak,
    nilai_kontrak: backendData.nilai_kontrak,
    
    // Field khusus BAPP
    lokasiPekerjaan: backendData.lokasi_pekerjaan,
    lokasi_pekerjaan: backendData.lokasi_pekerjaan,
    items: items,
    rincian_pekerjaan: backendData.rincian_pekerjaan,
    hasilPemeriksaan: backendData.hasil_pemeriksaan,
    hasil_pemeriksaan: backendData.hasil_pemeriksaan,
    deadline: backendData.deadline, // Add deadline here
    // Metadata
    status: backendData.status,
    id: backendData.id_bapp,
    id_bapp: backendData.id_bapp,
    created_at: backendData.created_at,
    updated_at: backendData.updated_at,
    
    // Joined fields
    vendor_nama: backendData.vendor_nama,
    nama_perusahaan: backendData.nama_perusahaan,
    pic_nama: backendData.pic_nama,
    direksi_nama: backendData.direksi_nama
  };
};

// ============================
// STATUS MAPPING
// ============================

/**
 * Map status backend ke label dan warna frontend
 */
const _getStaticStatusLabel = (backendStatus) => {
  const statusMap = {
    // BAPB & BAPP common
    'draft': {
      label: 'Draft',
      color: 'gray',
      badgeClass: 'bg-gray-100 text-gray-800'
    },
    'submitted': {
      label: 'Menunggu Review',
      color: 'yellow',
      badgeClass: 'bg-yellow-100 text-yellow-800'
    },

    // BAPB specific
    'reviewed': {
      label: 'Direview PIC',
      color: 'blue',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    'approved': { // This will be dynamic based on pic_signed_at
      label: 'Disetujui PIC',
      color: 'green',
      badgeClass: 'bg-green-100 text-green-800'
    },

    // BAPP specific
    'reviewed_pic': {
      label: 'Direview PIC',
      color: 'blue',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    'approved_direksi': { // This will be dynamic based on direksi_signed_at
      label: 'Disetujui Direksi',
      color: 'green',
      badgeClass: 'bg-green-100 text-green-800'
    },

    // Rejected status (jika ada)
    'rejected': {
      label: 'Ditolak',
      color: 'red',
      badgeClass: 'bg-red-100 text-red-800'
    }
  };

  return statusMap[backendStatus] || {
    label: backendStatus || 'Unknown',
    color: 'gray',
    badgeClass: 'bg-gray-100 text-gray-800'
  };
};

/**
 * Map status backend ke label dan warna frontend, mempertimbangkan status tanda tangan.
 */
export const mapStatusToFrontend = (document) => {
  if (!document || !document.status) {
    return { label: 'Unknown', color: 'gray', badgeClass: 'bg-gray-100 text-gray-800' };
  }

  const staticStatus = _getStaticStatusLabel(document.status);

  if (document.status === 'approved') { // BAPB specific (approved by PIC)
    if (document.pic_signed_at) {
      return {
        label: 'Disetujui PIC (Sudah ditandatangani)',
        color: 'green',
        badgeClass: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        label: 'Disetujui PIC',
        color: 'blue',
        badgeClass: 'bg-blue-100 text-blue-800'
      };
    }
  }

  if (document.status === 'approved_direksi') { // BAPP specific (approved by Direksi)
    if (document.direksi_signed_at) {
      return {
        label: 'Disetujui Direksi (Sudah ditandatangani)',
        color: 'green',
        badgeClass: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        label: 'Disetujui Direksi',
        color: 'green',
        badgeClass: 'bg-green-100 text-green-800'
      };
    }
  }

  return staticStatus;
};
/**
 * Map status frontend ke backend
 */
export const mapStatusToBackend = (frontendStatus) => {
  const reverseMap = {
    'Draft': 'draft',
    'Menunggu Review': 'submitted',
    'Pending': 'submitted',
    'Direview': 'reviewed',
    'Disetujui': 'approved',
    'Direview PIC': 'reviewed_pic',
    'Disetujui Direksi': 'approved_direksi',
    'Ditolak': 'rejected'
  };

  return reverseMap[frontendStatus] || frontendStatus;
};

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Generate nomor dokumen otomatis
 */
export const generateDocNumber = (type = 'BAPB') => {
  const prefix = type.toUpperCase();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}-${random}`;
};

/**
 * Parse items array untuk form
 */
export const parseItemsForForm = (items) => {
  if (!items) return [{ id: 1, namaItem: '', quantity: 1, satuan: 'unit', spesifikasi: '', keterangan: '' }];
  
  if (Array.isArray(items)) return items;
  
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [{ id: 1, namaItem: items || '', quantity: 1, satuan: 'unit', spesifikasi: '', keterangan: '' }];
  }
};

/**
 * Validate form data sebelum submit
 */
export const validateBAPBForm = (data) => {
  const errors = {};
  
  if (!data.nomor_bapb && !data.noDokumen) {
    errors.nomor_bapb = 'Nomor BAPB wajib diisi';
  }
  
  if (!data.no_kontrak && !data.nomorSuratPesanan) {
    errors.no_kontrak = 'Nomor kontrak wajib diisi';
  }
  
  if (!data.tanggal_kontrak && !data.tanggalKontrak) {
    errors.tanggal_kontrak = 'Tanggal kontrak wajib diisi';
  }
  
  if (!data.nilai_kontrak && !data.nilaiKontrak) {
    errors.nilai_kontrak = 'Nilai kontrak wajib diisi';
  }
  
  if (!data.tanggal_pengiriman && !data.tanggalPengiriman) {
    errors.tanggal_pengiriman = 'Tanggal pengiriman wajib diisi';
  }
  
  return errors;
};

export const validateBAPPForm = (data) => {
  const errors = {};
  
  if (!data.nomor_bapp && !data.noDokumen) {
    errors.nomor_bapp = 'Nomor BAPP wajib diisi';
  }
  
  if (!data.no_kontrak && !data.nomorSuratPesanan) {
    errors.no_kontrak = 'Nomor kontrak wajib diisi';
  }
  
  if (!data.tanggal_kontrak && !data.tanggalKontrak) {
    errors.tanggal_kontrak = 'Tanggal kontrak wajib diisi';
  }
  
  if (!data.nilai_kontrak && !data.nilaiKontrak) {
    errors.nilai_kontrak = 'Nilai kontrak wajib diisi';
  }
  
  if (!data.lokasi_pekerjaan && !data.lokasiPekerjaan) {
    errors.lokasi_pekerjaan = 'Lokasi pekerjaan wajib diisi';
  }
  
  return errors;
};

export default {
  mapBAPBFieldsToBackend,
  mapBAPPFieldsToBackend,
  mapBAPBFieldsToFrontend,
  mapBAPPFieldsToFrontend,
  _getStaticStatusLabel,
  mapStatusToBackend,
  generateDocNumber,
  parseItemsForForm,
  validateBAPBForm,
  validateBAPPForm
};