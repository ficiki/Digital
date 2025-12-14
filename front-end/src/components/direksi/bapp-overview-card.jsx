import React from 'react';

const BappOverviewCard = ({ title, value, icon, bgColor = 'bg-blue-600' }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Left side - Text content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-3">{title}</p>
          <h3 className="text-4xl font-bold text-gray-900">{value}</h3>
        </div>
        
        {/* Right side - Icon with solid color - CONSISTENT WITH STATCARD */}
        <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 ml-6 shadow-lg`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default BappOverviewCard;
