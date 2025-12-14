// components/common/EmptyState.jsx
import React from 'react';

const EmptyState = ({ 
  title = "Data tidak ditemukan", 
  message = "Belum ada data yang tersedia",
  actionButton,
  icon = "📊"
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {actionButton && (
        <div className="flex justify-center">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;