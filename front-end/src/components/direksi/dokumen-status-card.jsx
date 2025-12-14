import React from 'react';

const DokumenStatusCard = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        yellow: 'from-yellow-400 to-orange-400',
        red: 'from-red-500 to-red-600'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-white text-opacity-90 text-sm mb-2">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="text-5xl opacity-80">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default DokumenStatusCard;
