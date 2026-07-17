import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ExcluirPerfilModalProps {
  open: boolean;
  profileName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const WarningIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M26 6L47 42H5L26 6Z"
      stroke="#FF5454"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M26 18v14" stroke="#FF5454" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="26" cy="38" r="1.75" fill="#FF5454" />
  </svg>
);

export const ExcluirPerfilModal: React.FC<ExcluirPerfilModalProps> = ({
  open,
  profileName,
  onCancel,
  onConfirm,
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
    <div
      className="modal-overlay confirm-modal-overlay unsaved-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-perfil-title"
    >
      <div className="unsaved-confirm-modal excluir-perfil-modal" onClick={(event) => event.stopPropagation()}>
        <div className="unsaved-confirm-modal__icon excluir-perfil-modal__icon" aria-hidden>
          <WarningIcon />
        </div>
        <h3 id="excluir-perfil-title" className="unsaved-confirm-modal__title">
          Atenção
        </h3>
        <p className="unsaved-confirm-modal__message">
          {`Tem certeza de que deseja excluir o perfil “${profileName}” e todas as suas permissões?`}
        </p>
        <div className="unsaved-confirm-modal__actions">
          <button type="button" className="btn unsaved-confirm-btn--outline" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn unsaved-confirm-btn--danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
