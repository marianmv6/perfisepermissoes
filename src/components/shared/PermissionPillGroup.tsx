import React from 'react';
import type { PermissionOption } from '../../constants/permissionCatalog';
import { parsePermissionIds, togglePermissionPill } from '../../utils/permissionPills';

interface PermissionPillGroupProps {
  options: PermissionOption[];
  value: string;
  onChange: (value: string) => void;
}

export const PermissionPillGroup: React.FC<PermissionPillGroupProps> = ({ options, value, onChange }) => {
  const selectedIds = parsePermissionIds(value);
  const optionIds = options.map((option) => option.id);

  return (
    <div className="permission-pill-group" role="group">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            className={`permission-pill${isSelected ? ' permission-pill--selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => onChange(togglePermissionPill(value, option.id, optionIds))}
          >
            <span className="permission-pill__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
