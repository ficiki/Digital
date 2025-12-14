// components/common/RoleSwitcher.jsx
import React, { useState } from 'react';

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: 'vendor', label: 'Vendor', icon: '🏢' },
    { id: 'direksi', label: 'Direksi', icon: '👔' },
    { id: 'pic', label: 'PIC Gudang', icon: '📦' }
  ];

  const currentRoleData = roles.find(role => role.id === currentRole) || roles[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>{currentRoleData.icon}</span>
        <span>{currentRoleData.label}</span>
        <span>▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                onRoleChange(role.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm ${
                currentRole === role.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{role.icon}</span>
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;