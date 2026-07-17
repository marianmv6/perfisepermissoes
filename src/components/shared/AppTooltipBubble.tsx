import React from 'react';

export interface AppTooltipBubbleProps {
  text: string;
  className?: string;
  nowrap?: boolean;
  arrow?: 'down' | 'up' | 'left';
}

export const AppTooltipBubble: React.FC<AppTooltipBubbleProps> = ({
  text,
  className = '',
  nowrap = false,
  arrow = 'down',
}) => (
  <span
    className={`app-tooltip-bubble app-tooltip-bubble--arrow-${arrow}${nowrap ? ' app-tooltip-bubble--nowrap' : ''}${className ? ` ${className}` : ''}`}
    role="tooltip"
  >
    {text}
  </span>
);
