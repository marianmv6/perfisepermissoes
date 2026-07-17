import React from 'react';
import { PerfilNomeModal } from './PerfilNomeModal';

interface AdicionarPerfilModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const AdicionarPerfilModal: React.FC<AdicionarPerfilModalProps> = ({
  open,
  onClose,
  onAdd,
}) => (
  <PerfilNomeModal
    open={open}
    title="Adicionar perfil"
    primaryLabel="Adicionar"
    initialName=""
    formId="adicionar-perfil-form"
    onClose={onClose}
    onSubmit={onAdd}
  />
);
