import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltipBubble } from './AppTooltipBubble';

interface TruncatedTextTooltipProps {
  text: string;
  className?: string;
}

const TOOLTIP_OFFSET_Y = -8;

function isTextTruncated(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth + 1;
}

export const TruncatedTextTooltip: React.FC<TruncatedTextTooltipProps> = ({ text, className = '' }) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  const checkTruncation = useCallback(() => {
    const el = labelRef.current;
    if (!el) return false;
    return isTextTruncated(el);
  }, []);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      if (!visible) return;
      if (!checkTruncation()) setVisible(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible, checkTruncation]);

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const tip = tooltipRef.current;
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top}px`;
    tip.style.transform = `translate(-50%, -100%) translateY(${TOOLTIP_OFFSET_Y}px)`;
  }, [visible, text]);

  const handleMouseEnter = () => {
    if (checkTruncation()) setVisible(true);
  };

  const handleMouseLeave = () => setVisible(false);

  return (
    <span
      ref={wrapRef}
      className="truncated-text-tooltip-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={labelRef} className={`truncated-text-tooltip__label ${className}`.trim()}>
        {text}
      </span>
      {visible &&
        createPortal(
          <span ref={tooltipRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <AppTooltipBubble text={text} className="truncated-text-tooltip-popup" nowrap />
          </span>,
          document.body,
        )}
    </span>
  );
};
