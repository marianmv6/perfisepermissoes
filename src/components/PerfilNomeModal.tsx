import React, { useEffect, useState } from 'react';
import { CrModal } from './shared/CrModal';
import { FormFieldLabel } from './shared/FormFieldLabel';
import { sanitizeProfileNameInput, isProfileNameValid, MAX_PROFILE_NAME_LENGTH } from '../utils/profileUtils';

interface PerfilNomeModalProps {
  open: boolean;
  title: string;
  mode?: 'create' | 'edit';
  primaryLabel: string;
  initialName: string;
  formId: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
  onSaveAndExit?: (name: string) => void;
}

export const PerfilNomeModal: React.FC<PerfilNomeModalProps> = ({
  open,
  title,
  mode = 'create',
  primaryLabel,
  initialName,
  formId,
  onClose,
  onSubmit,
  onSaveAndExit,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  const sanitizedName = sanitizeProfileNameInput(name);
  const isValid = isProfileNameValid(name);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit(sanitizedName);
  };

  const handleSaveAndExit = () => {
    if (!isValid || !onSaveAndExit) return;
    onSaveAndExit(sanitizedName);
  };

  return (
    <CrModal
      open={open}
      title={title}
      onClose={onClose}
      formId={formId}
      primaryLabel={primaryLabel}
      primaryDisabled={!isValid}
      secondaryLabel={mode === 'edit' ? 'Salvar e sair' : undefined}
      secondaryDisabled={!isValid}
      onSecondaryClick={mode === 'edit' ? handleSaveAndExit : undefined}
    >
      <form id={formId} onSubmit={handleSubmit}>
        <div className="form-group">
          <FormFieldLabel htmlFor={`${formId}-nome`} required>
            Nome do perfil
          </FormFieldLabel>
          <input
            id={`${formId}-nome`}
            type="text"
            className="cr-modal__input"
            value={name}
            placeholder="Nome"
            maxLength={MAX_PROFILE_NAME_LENGTH}
            onChange={(event) => setName(sanitizeProfileNameInput(event.target.value))}
            autoComplete="off"
          />
        </div>
      </form>
    </CrModal>
  );
};
