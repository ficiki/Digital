// src/components/common/statcard.jsx
import React from 'react';
import { Clock, XCircle, CheckCircle, Calendar } from 'lucide-react';

// Komponen StatCard Individual (versi gabungan)
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue', 
  trend,
  iconComponent 
}) => {
  // Color classes untuk background gradient
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  // Color classes untuk solid background
  const solidColorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  // Icon colors
  const iconColors = {
    blue: 'text-blue-100',
    green: 'text-green-100',
    yellow: 'text-yellow-100',
    orange: 'text-orange-100',
    red: 'text-red-100',
    purple: 'text-purple-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        {/* Left Side - Text Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          
          {/* Value dengan trend indicator */}
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            
            {trend && (
              <span className={`text-sm font-medium ${
                trend.value > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Right Side - Icon Box */}
        <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {iconComponent ? (
            <div className={`text-xl ${iconColors[color]}`}>
              {iconComponent}
            </div>
          ) : (
            <span className={`text-xl ${iconColors[color]}`}>{icon}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Grid Universal - untuk PIC Dashboard
export const StatsGrid = ({ stats = [] }) => { // Change to accept 'stats' prop directly
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          iconComponent={stat.iconComponent}
          color={stat.color}
        />
      ))}
    </div>
  );
};

// Komponen StatsGrid yang lebih fleksibel untuk semua role
export const CustomStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          iconComponent={stat.iconComponent}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

// Export untuk semua kebutuhan
export { StatCard };
export default StatCard;