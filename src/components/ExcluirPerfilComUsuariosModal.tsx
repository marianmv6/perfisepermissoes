import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Profile } from '../types/perfisPermissoes.types';
import { FormFieldLabel } from './shared/FormFieldLabel';
import { ModalSelect } from './shared/ModalSelect';

interface ExcluirPerfilComUsuariosModalProps {
  open: boolean;
  currentProfileId: string;
  profiles: Profile[];
  onCancel: () => void;
  onConfirm: (targetProfileId: string) => void;
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

export const ExcluirPerfilComUsuariosModal: React.FC<ExcluirPerfilComUsuariosModalProps> = ({
  open,
  currentProfileId,
  profiles,
  onCancel,
  onConfirm,
}) => {
  const [targetProfileId, setTargetProfileId] = useState('');

  const options = useMemo(
    () =>
      profiles
        .filter((profile) => profile.id !== currentProfileId)
        .map((profile) => ({ value: profile.id, label: profile.name })),
    [profiles, currentProfileId],
  );

  useEffect(() => {
    if (open) {
      setTargetProfileId('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const canConfirm = targetProfileId.length > 0;

  const overlay = (
    <div
      className="modal-overlay confirm-modal-overlay unsaved-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-perfil-usuarios-title"
    >
      <div
        className="unsaved-confirm-modal excluir-perfil-usuarios-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="unsaved-confirm-modal__icon excluir-perfil-usuarios-modal__icon" aria-hidden>
          <WarningIcon />
        </div>
        <h3 id="excluir-perfil-usuarios-title" className="unsaved-confirm-modal__title">
          Atenção
        </h3>
        <p className="unsaved-confirm-modal__message excluir-perfil-usuarios-modal__message">
          Existem usuários ativos com este perfil atribuído. Altere-os antes de excluir.
        </p>

        <div className="excluir-perfil-usuarios-modal__field">
          <FormFieldLabel htmlFor="excluir-perfil-destino" required>
            Escolha um novo perfil para atribuir aos usuários deste perfil
          </FormFieldLabel>
          <ModalSelect
            id="excluir-perfil-destino"
            value={targetProfileId}
            onChange={setTargetProfileId}
            options={options}
            placeholder="Selecione..."
            mutedPlaceholder
            className="modal-select--no-pill excluir-perfil-usuarios-modal__select"
          />
        </div>

        <div className="unsaved-confirm-modal__actions excluir-perfil-usuarios-modal__actions">
          <button type="button" className="btn unsaved-confirm-btn--outline" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn unsaved-confirm-btn--danger"
            disabled={!canConfirm}
            onClick={() => onConfirm(targetProfileId)}
          >
            Alterar e Excluir
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
