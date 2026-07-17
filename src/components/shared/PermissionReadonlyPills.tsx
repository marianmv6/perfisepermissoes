import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PermissionOption } from '../../constants/permissionCatalog';
import { parsePermissionIds } from '../../utils/permissionPills';
import { AppTooltipBubble } from './AppTooltipBubble';

interface PermissionReadonlyPillsProps {
  value: string;
  options: PermissionOption[];
}

const TOOLTIP_OFFSET_Y = -8;

export const PermissionReadonlyDash: React.FC = () => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const tip = tooltipRef.current;
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top}px`;
    tip.style.transform = `translate(-50%, -100%) translateY(${TOOLTIP_OFFSET_Y}px)`;
  }, [visible]);

  return (
    <span
      ref={wrapRef}
      className="permission-readonly-dash-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="permission-readonly-dash" aria-label="Sem permissão">
        —
      </span>
      {visible &&
        createPortal(
          <span ref={tooltipRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <AppTooltipBubble text="Sem permissão" className="permission-readonly-dash-tooltip" nowrap />
          </span>,
          document.body,
        )}
    </span>
  );
};

export const PermissionReadonlyPills: React.FC<PermissionReadonlyPillsProps> = ({ value, options }) => {
  const selectedIds = parsePermissionIds(value);
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id));

  if (selectedOptions.length === 0) {
    return <PermissionReadonlyDash />;
  }

  return (
    <div className="permission-pill-group permission-pill-group--readonly">
      {selectedOptions.map((option) => (
        <span
          key={option.id}
          className="permission-pill permission-pill--matrix permission-pill--readonly"
        >
          {option.label}
        </span>
      ))}
    </div>
  );
};

export const PermissionReadonlyText: React.FC<{ text: string }> = ({ text }) => {
  if (!text.trim()) {
    return <PermissionReadonlyDash />;
  }

  return <span className="permission-readonly-text">{text}</span>;
};

interface PermissionReadonlySummaryProps {
  labels: string[];
}

export const PermissionReadonlySummary: React.FC<PermissionReadonlySummaryProps> = ({ labels }) => {
  const visibleLabels = labels.filter((label) => label.length > 0 && label !== 'Sem permissão');

  if (visibleLabels.length === 0) {
    return <PermissionReadonlyDash />;
  }

  return (
    <div className="permission-pill-group permission-pill-group--readonly">
      {visibleLabels.map((label) => (
        <span key={label} className="permission-pill permission-pill--matrix permission-pill--readonly">
          {label}
        </span>
      ))}
    </div>
  );
};
