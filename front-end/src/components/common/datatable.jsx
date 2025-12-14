import React from 'react';

const DataTable = ({ 
  data, 
  columns, 
  onRowClick,
  pagination,
  onPageChange,
  compact = false
}) => {
  // Jika tidak ada data
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak ada data
        </h3>
        <p className="text-gray-600">
          Belum ada data yang tersedia untuk ditampilkan
        </p>
      </div>
    );
  }

  // Pagination config
  const paginationConfig = pagination || {
    currentPage: 1,
    lastPage: 1,
    from: 1,
    to: data.length,
    total: data.length
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${compact ? 'text-sm' : ''}`}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''} ${column.responsive ? 'hidden md:table-cell' : ''}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-6 py-4 whitespace-nowrap ${compact ? 'py-2' : 'py-4'} ${column.responsive ? 'hidden md:table-cell' : ''}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row, rowIndex)
                      : (
                        <div className={`text-gray-900 ${compact ? 'text-sm' : ''}`}>
                          {row[column.key]}
                        </div>
                      )
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info */}
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{paginationConfig.from}</span> sampai{' '}
              <span className="font-medium">{paginationConfig.to}</span> dari{' '}
              <span className="font-medium">{paginationConfig.total}</span> entri
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <button
                onClick={() => onPageChange('first')}
                disabled={paginationConfig.currentPage === 1}
                className={`px-3 py-1 text-sm border rounded ${
                  paginationConfig.currentPage === 1
                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Awal
              </button>
              
              {/* Previous Page */}
              <button
                onClick={() => onPageChange('prev')}
                disabled={paginationConfig.currentPage === 1}
                className={`px-3 py-1 text-sm border rounded ${
                  paginationConfig.currentPage === 1
                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                ←
              </button>
              
              {/* Current Page */}
              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                {paginationConfig.currentPage}
              </span>
              
              {/* Page Info */}
              <span className="text-sm text-gray-500">
                dari {paginationConfig.lastPage}
              </span>
              
              {/* Next Page */}
              <button
                onClick={() => onPageChange('next')}
                disabled={paginationConfig.currentPage === paginationConfig.lastPage}
                className={`px-3 py-1 text-sm border rounded ${
                  paginationConfig.currentPage === paginationConfig.lastPage
                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                →
              </button>
              
              {/* Last Page */}
              <button
                onClick={() => onPageChange('last')}
                disabled={paginationConfig.currentPage === paginationConfig.lastPage}
                className={`px-3 py-1 text-sm border rounded ${
                  paginationConfig.currentPage === paginationConfig.lastPage
                    ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Akhir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;