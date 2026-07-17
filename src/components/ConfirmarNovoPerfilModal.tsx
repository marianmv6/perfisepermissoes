import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { buildProfilePermissionsSummary } from '../utils/permissionDisplay';

interface ConfirmarNovoPerfilModalProps {
  open: boolean;
  profileName: string;
  permissions: Record<string, Record<string, string>>;
  onConfirm: () => void;
  onReturn: () => void;
}

export const ConfirmarNovoPerfilModal: React.FC<ConfirmarNovoPerfilModalProps> = ({
  open,
  profileName,
  permissions,
  onConfirm,
  onReturn,
}) => {
  const summary = useMemo(() => buildProfilePermissionsSummary(permissions), [permissions]);

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
      className="modal-overlay confirm-modal-overlay confirmar-novo-perfil-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmar-novo-perfil-title"
    >
      <div className="confirmar-novo-perfil-modal" onClick={(event) => event.stopPropagation()}>
        <h3 id="confirmar-novo-perfil-title" className="confirmar-novo-perfil-modal__title">
          Confirmar perfil
        </h3>

        <div className="confirmar-novo-perfil-modal__body">
          <div className="confirmar-novo-perfil-modal__field">
            <span className="confirmar-novo-perfil-modal__label">Nome do perfil</span>
            <span className="confirmar-novo-perfil-modal__value">{profileName}</span>
          </div>

          <div className="confirmar-novo-perfil-modal__permissions">
            <span className="confirmar-novo-perfil-modal__label">Permissões</span>
            <div className="confirmar-novo-perfil-modal__permissions-scroll">
              {summary.length === 0 ? (
                <p className="confirmar-novo-perfil-modal__empty">Nenhuma permissão selecionada.</p>
              ) : (
                summary.map((module) => (
                  <div key={module.moduleLabel} className="confirmar-novo-perfil-modal__module">
                    <h4 className="confirmar-novo-perfil-modal__module-title">{module.moduleLabel}</h4>
                    <ul className="confirmar-novo-perfil-modal__list">
                      {module.entries.map((entry) => {
                        if (entry.kind === 'section') {
                          return (
                            <li
                              key={`${module.moduleLabel}-${entry.label}`}
                              className="confirmar-novo-perfil-modal__section"
                            >
                              {entry.label}
                            </li>
                          );
                        }

                        return (
                          <li
                            key={`${module.moduleLabel}-${entry.label}`}
                            className={`confirmar-novo-perfil-modal__item${entry.isNested ? ' confirmar-novo-perfil-modal__item--nested' : ''}`}
                          >
                            <span className="confirmar-novo-perfil-modal__item-label">{entry.label}</span>
                            <span className="confirmar-novo-perfil-modal__item-perms">{entry.permissionLabels}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="confirmar-novo-perfil-modal__actions">
          <button type="button" className="btn confirmar-novo-perfil-btn--outline" onClick={onReturn}>
            Cancelar
          </button>
          <button type="button" className="btn confirmar-novo-perfil-btn--primary" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
