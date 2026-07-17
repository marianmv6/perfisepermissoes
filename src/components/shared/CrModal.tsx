import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CrModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  formId?: string;
  primaryLabel?: string;
  cancelLabel?: string;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  onSecondaryClick?: () => void;
  fullScreen?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  footerStart?: React.ReactNode;
  onPrimaryClick?: () => void;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const CrModal: React.FC<CrModalProps> = ({
  open,
  title,
  onClose,
  onCancel,
  children,
  formId,
  primaryLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  fullScreen = false,
  primaryDisabled = false,
  secondaryLabel,
  secondaryDisabled = false,
  onSecondaryClick,
  hideHeader = false,
  hideFooter = false,
  footerStart,
  onPrimaryClick,
}) => {
  const handleCancel = onCancel ?? onClose;

  useEffect(() => {
    if (!open) return;

    if (fullScreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cr-fullscreen-modal-open');
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.classList.remove('cr-fullscreen-modal-open');
      };
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, fullScreen]);

  if (!open) return null;

  const overlay = (
    <div
      className={`cr-modal-overlay ${fullScreen ? 'cr-modal-overlay--fullscreen' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cr-modal-title"
    >
      <div className={`cr-modal ${fullScreen ? 'cr-modal--fullscreen' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!hideHeader && (
          <header className="cr-modal__header">
            <h2 id="cr-modal-title" className={`cr-modal__title ${fullScreen ? 'cr-modal__title--page' : ''}`}>
              {title}
            </h2>
            <button type="button" className="cr-modal__close" onClick={onClose} aria-label="Fechar">
              <CloseIcon />
            </button>
          </header>
        )}
        <div className="cr-modal__body">{children}</div>
        {!hideFooter && (
          <footer className="cr-modal__footer">
            {footerStart ? <div className="cr-modal__footer-start">{footerStart}</div> : null}
            <div className="cr-modal__footer-actions">
              <button type="button" className="cr-btn cr-btn--outline" onClick={handleCancel}>
                {cancelLabel}
              </button>
              {secondaryLabel && onSecondaryClick ? (
                <button
                  type="button"
                  className="cr-btn cr-btn--outline"
                  disabled={secondaryDisabled}
                  onClick={onSecondaryClick}
                >
                  {secondaryLabel}
                </button>
              ) : null}
              {formId ? (
                <button type="submit" form={formId} className="cr-btn cr-btn--primary" disabled={primaryDisabled}>
                  {primaryLabel}
                </button>
              ) : onPrimaryClick ? (
                <button type="button" className="cr-btn cr-btn--primary" disabled={primaryDisabled} onClick={onPrimaryClick}>
                  {primaryLabel}
                </button>
              ) : null}
            </div>
          </footer>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    const portalRoot = document.querySelector('.app-content');
    if (portalRoot) {
      return createPortal(overlay, portalRoot);
    }
  }

  return createPortal(overlay, document.body);
};
