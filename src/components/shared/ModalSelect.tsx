import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltipBubble } from './AppTooltipBubble';
import { FieldErrorIcon } from './FieldErrorIcon';
import { applyExclusivePermissionToggle, SEM_PERMISSAO_ID } from '../../utils/permissionDisplay';

export interface ModalSelectOption {
  value: string;
  label: string;
  children?: ModalSelectOption[];
  suffixLabel?: string;
  pillClassName?: string;
}

interface ModalSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ModalSelectOption[];
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  hierarchical?: boolean;
  className?: string;
  disabled?: boolean;
  mutedPlaceholder?: boolean;
  exclusiveOptionId?: string;
  error?: boolean;
}

const DROPDOWN_MAX_HEIGHT = 220;
const DROPDOWN_GAP = 4;
const DROPDOWN_Z_CONFIRM = 10100;
const SELECT_ACTIVATE_EVENT = 'modal-select:activate';

function getDropdownPortalRoot(anchor: HTMLElement | null): HTMLElement {
  if (anchor?.closest('.confirm-modal-overlay, .cr-modal-overlay:not(.cr-modal-overlay--fullscreen)')) {
    return document.body;
  }

  return (
    (anchor?.closest('.cr-modal--fullscreen') as HTMLElement | null) ??
    (document.querySelector('.app-content') as HTMLElement | null) ??
    document.body
  );
}

function usesFixedDropdownPosition(root: HTMLElement): boolean {
  return root === document.body;
}

export const ModalSelect: React.FC<ModalSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  multiple = false,
  hierarchical = false,
  className = '',
  disabled = false,
  mutedPlaceholder = false,
  exclusiveOptionId = SEM_PERMISSAO_ID,
  error = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [inputTooltipVisible, setInputTooltipVisible] = useState(false);
  const [inputTooltipPos, setInputTooltipPos] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectId = id ?? React.useId();

  const flatOptions = options.flatMap((o) => (o.children ? [o, ...o.children] : [o]));
  const optionOrder = flatOptions.map((option) => option.value);

  const displayLabel = (() => {
    if (multiple && value) {
      const vals = value.split(',').map((v) => v.trim()).filter(Boolean);
      const labels = flatOptions.filter((option) => vals.includes(option.value)).map((option) => option.label);
      return labels.join(', ') || placeholder;
    }
    const find = (opts: ModalSelectOption[]): string | undefined => {
      for (const o of opts) {
        if (o.value === value) return o.label;
        if (o.children) {
          const found = find(o.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return find(options) ?? placeholder;
  })();

  const filtered = options.filter((o) => {
    const haystack = `${o.label} ${o.suffixLabel ?? ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const updateDropdownPosition = useCallback(() => {
    if (!open || !inputWrapRef.current) return;

    const anchor = inputWrapRef.current;
    const rect = anchor.getBoundingClientRect();
    const root = getDropdownPortalRoot(anchor);
    const fixed = usesFixedDropdownPosition(root);
    const rootRect = root.getBoundingClientRect();

    setPortalRoot(root);
    setDropdownStyle({
      position: fixed ? 'fixed' : 'absolute',
      left: fixed ? rect.left : rect.left - rootRect.left + root.scrollLeft,
      top: fixed ? rect.bottom + DROPDOWN_GAP : rect.bottom - rootRect.top + root.scrollTop + DROPDOWN_GAP,
      width: rect.width,
      minWidth: rect.width,
      maxWidth: rect.width,
      bottom: 'auto',
      maxHeight: DROPDOWN_MAX_HEIGHT,
      zIndex: fixed ? DROPDOWN_Z_CONFIRM : 10050,
    });
  }, [open]);

  const isInputTruncated = () => {
    const el = inputRef.current;
    if (!el) return false;
    return el.scrollWidth > el.clientWidth + 1;
  };

  const updateInputTooltipPosition = () => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setInputTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  };

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    updateDropdownPosition();
    const frame = requestAnimationFrame(updateDropdownPosition);

    return () => cancelAnimationFrame(frame);
  }, [open, filtered.length, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onOtherOpen = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail !== selectId) setOpen(false);
    };

    document.addEventListener(SELECT_ACTIVATE_EVENT, onOtherOpen);
    return () => document.removeEventListener(SELECT_ACTIVATE_EVENT, onOtherOpen);
  }, [open, selectId]);

  useEffect(() => {
    if (!open) return;

    const onReposition = () => updateDropdownPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };

    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const toggleExpand = (val: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  const selectValue = (opt: ModalSelectOption) => {
    if (multiple) {
      onChange(applyExclusivePermissionToggle(value, opt.value, exclusiveOptionId, optionOrder));
    } else {
      onChange(opt.value);
      setOpen(false);
    }
  };

  const isSelected = (v: string) =>
    multiple ? value.split(',').map((x) => x.trim()).includes(v) : value === v;

  const handleOptionPointerDown = (e: React.PointerEvent, opt: ModalSelectOption, hasChildren: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) toggleExpand(opt.value);
    else selectValue(opt);
  };

  const renderOption = (opt: ModalSelectOption, level = 0) => {
    const hasChildren = hierarchical && (opt.children?.length ?? 0) > 0;
    const isExp = expanded.has(opt.value);
    const selected = isSelected(opt.value);
    return (
      <div key={opt.value} className="modal-select__option-wrap">
        <div
          className={`modal-select__option ${selected ? 'modal-select__option--selected' : ''}`}
          style={hierarchical ? { paddingLeft: `${12 + level * 16}px` } : undefined}
          onPointerDown={(e) => handleOptionPointerDown(e, opt, hasChildren)}
        >
          {multiple && (
            <span
              className={`modal-select__checkbox${selected ? ' modal-select__checkbox--selected' : ''}`}
              aria-hidden
            />
          )}
          <span className={`modal-select__option-pill ${opt.pillClassName ?? ''}`.trim()}>
            {opt.label}
            {opt.suffixLabel ? (
              <span className="modal-select__option-suffix" aria-hidden>
                {' '}
                {opt.suffixLabel}
              </span>
            ) : null}
          </span>
          {hasChildren && (
            <span className="modal-select__chevron" aria-hidden>
              {isExp ? '▼' : '▶'}
            </span>
          )}
        </div>
        {hasChildren && isExp && opt.children?.map((c) => renderOption(c, level + 1))}
      </div>
    );
  };

  const hasValue = multiple ? value.trim().length > 0 : Boolean(value);
  const showMutedPlaceholder = mutedPlaceholder && !hasValue;
  const isTyping = open && !multiple;
  const tooltipText = displayLabel;
  const dropdownHost = portalRoot ?? getDropdownPortalRoot(containerRef.current);

  const dropdown =
    open &&
    createPortal(
      <div
        ref={dropdownRef}
        className="modal-select__dropdown modal-select__dropdown--portal"
        style={dropdownStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {filtered.length === 0 ? (
          <div className="modal-select__empty">Nenhuma opção</div>
        ) : (
          filtered.map((o) => renderOption(o))
        )}
      </div>,
      dropdownHost,
    );

  return (
    <div
      className={`modal-select ${className}${showMutedPlaceholder ? ' modal-select--muted-placeholder' : ''}${hasValue ? ' modal-select--has-value' : ''}${isTyping ? ' modal-select--typing' : ''}${open ? ' modal-select--open' : ''}${error ? ' modal-select--error' : ''}`.trim()}
      ref={containerRef}
    >
      {label && (
        <label className="modal-select__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div
        className={`modal-select__input-wrap${error ? ' input-error-wrap' : ''}`}
        ref={inputWrapRef}
        onPointerDown={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOpen((current) => {
            const next = !current;
            if (next) {
              document.dispatchEvent(new CustomEvent(SELECT_ACTIVATE_EVENT, { detail: selectId }));
            }
            return next;
          });
        }}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          className="modal-select__input"
          value={multiple ? displayLabel : open ? search : displayLabel}
          onChange={(e) => (!multiple && open ? setSearch(e.target.value) : null)}
          readOnly={multiple || !open}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          tabIndex={disabled ? -1 : 0}
          aria-invalid={error || undefined}
          onMouseEnter={() => {
            if (isInputTruncated()) {
              updateInputTooltipPosition();
              setInputTooltipVisible(true);
            }
          }}
          onMouseLeave={() => setInputTooltipVisible(false)}
        />
        {error ? (
          <span className="modal-select__field-error-icon" aria-hidden>
            <FieldErrorIcon />
          </span>
        ) : null}
        <span className="modal-select__arrow" aria-hidden>
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L5 6 L10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
          </svg>
        </span>
      </div>
      {inputTooltipVisible &&
        createPortal(
          <span
            style={{
              position: 'fixed',
              left: inputTooltipPos.left,
              top: inputTooltipPos.top,
              transform: 'translate(-50%, -100%) translateY(-8px)',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          >
            <AppTooltipBubble text={tooltipText} className="truncated-text-tooltip-popup" nowrap />
          </span>,
          document.body,
        )}
      {dropdown}
    </div>
  );
};
