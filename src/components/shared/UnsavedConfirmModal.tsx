import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface UnsavedConfirmModalProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
}

export const UnsavedConfirmModal: React.FC<UnsavedConfirmModalProps> = ({
  open,
  onSave,
  onDiscard,
  title = 'Confirme',
  message = 'Você possui alterações não salvas. Gostaria de salvar antes de sair?',
  saveLabel = 'Salvar',
  discardLabel = 'Sair sem salvar',
}) => {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div className="modal-overlay confirm-modal-overlay unsaved-confirm-overlay" role="dialog" aria-modal="true">
      <div className="unsaved-confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="unsaved-confirm-modal__icon" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="22" stroke="#E29C2C" strokeWidth="2.5" fill="none" />
            <text x="26" y="34" textAnchor="middle" fill="#E29C2C" fontSize="28" fontWeight="bold" fontFamily="sans-serif">
              ?
            </text>
          </svg>
        </div>
        <h3 className="unsaved-confirm-modal__title">{title}</h3>
        <p className="unsaved-confirm-modal__message">{message}</p>
        <div className="unsaved-confirm-modal__actions">
          <button type="button" className="btn unsaved-confirm-btn--outline" onClick={onDiscard}>
            {discardLabel}
          </button>
          <button type="button" className="btn unsaved-confirm-btn--primary" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
