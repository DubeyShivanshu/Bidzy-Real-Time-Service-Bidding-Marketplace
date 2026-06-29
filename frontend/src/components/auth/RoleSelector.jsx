/**
 * components/auth/RoleSelector.jsx — Role Tab Selector
 *
 * Props: selectedRole, onChange, roles (array of available roles)
 * Tab UI for switching between Customer / Provider / Admin on login/register pages
 */
import React from 'react';

export const RoleSelector = ({ selectedRole, onChange, roles }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {roles.map((role) => {
        const isSelected = selectedRole === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`flex-1 text-center py-2.5 text-sm font-medium border-b-2 transition duration-150 capitalize ${
              isSelected
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;

