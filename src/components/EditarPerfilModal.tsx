import React, { useEffect, useMemo, useState } from 'react';
import { PERMISSION_MODULES, countModulePermissionOptions, isNestedPermissionSubItem, isPermissionSectionHeader } from '../constants/permissionCatalog';
import { CrModal } from './shared/CrModal';
import { AppToast } from './shared/AppToast';
import { PermissionPillGroup } from './shared/PermissionPillGroup';
import { ExcluirPerfilModal } from './ExcluirPerfilModal';
import { ExcluirPerfilComUsuariosModal } from './ExcluirPerfilComUsuariosModal';
import type { Profile } from '../types/perfisPermissoes.types';
import { profileHasActiveUsers, sanitizeProfileNameInput, isProfileNameValid, MAX_PROFILE_NAME_LENGTH } from '../utils/profileUtils';
import {
  areAllPermissionsComplete,
  clearPermissionFieldErrors,
  getEmptyPermissionFieldKeys,
  isSubItemPermissionFieldInvalid,
  PERMISSIONS_REQUIRED_MESSAGE,
} from '../utils/permissionDisplay';
import {
  clearSubItemPills,
  getSelectablePillOptions,
  hasSubItemPermission,
  isModuleAnyPillsSelected,
  selectAllSubItemPills,
} from '../utils/permissionPills';
import { applyPermissionDependencies } from '../utils/permissionDependencies';
import { UnsavedConfirmModal } from './shared/UnsavedConfirmModal';
import { ConfirmarNovoPerfilModal } from './ConfirmarNovoPerfilModal';
import { getModuleIcon, IconChevronDown } from './ModuleIcons';

function permissionsEqual(
  left: Record<string, Record<string, string>>,
  right: Record<string, Record<string, string>>,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

interface EditarPerfilModalProps {
  open: boolean;
  profileId: string;
  profileName: string;
  profiles: Profile[];
  permissions: Record<string, Record<string, string>>;
  isNew: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSave: (name: string, permissions: Record<string, Record<string, string>>) => void;
  onDelete: () => void;
  onMoveUsersAndDelete: (targetProfileId: string) => void;
}

export const EditarPerfilModal: React.FC<EditarPerfilModalProps> = ({
  open,
  profileId,
  profileName,
  profiles,
  permissions,
  isNew,
  onClose,
  onSave,
  onDelete,
  onMoveUsersAndDelete,
}) => {
  const [draftName, setDraftName] = useState(profileName);
  const [draftPermissions, setDraftPermissions] = useState(permissions);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['cadastros', 'reconhecimento-facial']));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [unsavedConfirmOpen, setUnsavedConfirmOpen] = useState(false);
  const [confirmNewProfileOpen, setConfirmNewProfileOpen] = useState(false);
  const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());
  const [errorToastVisible, setErrorToastVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setDraftName(profileName);
      setDraftPermissions(applyPermissionDependencies(permissions));
      setExpandedModules(new Set(['cadastros', 'reconhecimento-facial']));
      setDeleteOpen(false);
      setUnsavedConfirmOpen(false);
      setConfirmNewProfileOpen(false);
      setInvalidFieldKeys(new Set());
      setErrorToastVisible(false);
    }
  }, [open, profileName, permissions]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const updateSubItem = (moduleId: string, subItemId: string, value: string) => {
    setDraftPermissions((current) => {
      const withChange = {
        ...current,
        [moduleId]: {
          ...current[moduleId],
          [subItemId]: value,
        },
      };
      const nextPermissions = applyPermissionDependencies(withChange);

      setInvalidFieldKeys((invalidKeys) => {
        let nextInvalid = invalidKeys;
        for (const module of PERMISSION_MODULES) {
          nextInvalid = clearPermissionFieldErrors(
            nextInvalid,
            module.id,
            nextPermissions[module.id] ?? {},
          );
        }
        return nextInvalid;
      });

      return nextPermissions;
    });
  };

  const toggleModuleAll = (moduleId: string) => {
    const module = PERMISSION_MODULES.find((item) => item.id === moduleId);
    if (!module) return;

    const modulePermissions = draftPermissions[moduleId] ?? {};
    const anySelected = isModuleAnyPillsSelected(module.subItems, modulePermissions);

    setDraftPermissions((current) => {
      const nextModulePermissions = module.subItems.reduce<Record<string, string>>((acc, subItem) => {
        if (isPermissionSectionHeader(subItem)) {
          return acc;
        }
        acc[subItem.id] = anySelected ? clearSubItemPills() : selectAllSubItemPills(subItem);
        return acc;
      }, {});

      const withChange = {
        ...current,
        [moduleId]: nextModulePermissions,
      };
      const nextPermissions = applyPermissionDependencies(withChange);

      setInvalidFieldKeys((invalidKeys) => {
        let nextInvalid = invalidKeys;
        for (const permModule of PERMISSION_MODULES) {
          nextInvalid = clearPermissionFieldErrors(
            nextInvalid,
            permModule.id,
            nextPermissions[permModule.id] ?? {},
          );
        }
        return nextInvalid;
      });

      return nextPermissions;
    });
  };

  const handleSave = () => {
    const sanitizedName = sanitizeProfileNameInput(draftName);
    if (!isProfileNameValid(sanitizedName)) return;

    if (isNew) {
      setConfirmNewProfileOpen(true);
      return;
    }

    const { fieldKeys, moduleIdsWithErrors } = getEmptyPermissionFieldKeys(draftPermissions);

    if (fieldKeys.length > 0) {
      setInvalidFieldKeys(new Set(fieldKeys));
      setExpandedModules((current) => new Set([...current, ...moduleIdsWithErrors]));
      setErrorToastVisible(true);
      return;
    }

    setInvalidFieldKeys(new Set());
    onSave(sanitizedName, draftPermissions);
  };

  const handleConfirmNewProfile = () => {
    const sanitizedName = sanitizeProfileNameInput(draftName);
    if (!isProfileNameValid(sanitizedName)) return;

    setConfirmNewProfileOpen(false);
    setInvalidFieldKeys(new Set());
    onSave(sanitizedName, draftPermissions);
  };

  const isNameValid = isProfileNameValid(draftName);
  const allPermissionsComplete = useMemo(
    () => areAllPermissionsComplete(draftPermissions),
    [draftPermissions],
  );
  const canSave = isNameValid && (isNew || allPermissionsComplete);
  const showActiveUsersDeleteFlow = !isNew && profileHasActiveUsers({ name: draftName });
  const hasUnsavedPermissionChanges = useMemo(
    () => !isNew && !permissionsEqual(draftPermissions, permissions),
    [isNew, draftPermissions, permissions],
  );

  const requestClose = () => {
    if (hasUnsavedPermissionChanges) {
      setUnsavedConfirmOpen(true);
      return;
    }
    onClose();
  };

  const handleDiscardChanges = () => {
    setUnsavedConfirmOpen(false);
    onClose();
  };

  const handleSaveFromConfirm = () => {
    setUnsavedConfirmOpen(false);
    handleSave();
  };

  return (
    <>
      <CrModal
        open={open}
        title=""
        hideHeader
        fullScreen
        onClose={requestClose}
        onCancel={requestClose}
        cancelLabel="Cancelar"
        primaryLabel="Salvar"
        primaryDisabled={!canSave}
        onPrimaryClick={handleSave}
        footerStart={
          !isNew ? (
            <button type="button" className="cr-btn cr-btn--danger-outline" onClick={() => setDeleteOpen(true)}>
              Excluir perfil
            </button>
          ) : null
        }
      >
        <div className="editar-perfil-modal">
          <div className="editar-perfil-modal__name-row">
            <input
              type="text"
              className="editar-perfil-modal__name-input"
              value={draftName}
              placeholder="Nome"
              maxLength={MAX_PROFILE_NAME_LENGTH}
              onChange={(event) => setDraftName(sanitizeProfileNameInput(event.target.value))}
              aria-label="Nome do perfil"
            />
            <button type="button" className="editar-perfil-modal__close" onClick={requestClose} aria-label="Fechar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="permissoes-editor">
            <div className="permissoes-editor__header">
              <div className="permissoes-editor__header-col permissoes-editor__header-col--modules">
                Módulos
              </div>
              <div className="permissoes-editor__header-col permissoes-editor__header-col--permissions">
                Permissões disponíveis
              </div>
            </div>

            <div className="permissoes-editor__scroll">
              <div className="permissoes-editor__modules">
                {PERMISSION_MODULES.map((module) => {
                  const ModuleIcon = getModuleIcon(module.id);
                  const isExpanded = expandedModules.has(module.id);
                  const modulePermissions = draftPermissions[module.id] ?? {};
                  const moduleHasAnySelected = isModuleAnyPillsSelected(module.subItems, modulePermissions);
                  const optionCount = countModulePermissionOptions(module);

                  return (
                    <div
                      key={module.id}
                      className={`permissoes-editor__module${isExpanded ? ' permissoes-editor__module--expanded' : ''}`}
                    >
                      <div className="permissoes-editor__module-header">
                        <div className="permissoes-editor__module-header-left">
                          <button
                            type="button"
                            className={`permissoes-editor__expand-btn${isExpanded ? ' permissoes-editor__expand-btn--open' : ''}`}
                            aria-label={isExpanded ? `Recolher ${module.label}` : `Expandir ${module.label}`}
                            aria-expanded={isExpanded}
                            onClick={() => toggleModule(module.id)}
                          >
                            <IconChevronDown />
                          </button>
                          <span className="permissoes-editor__module-icon" aria-hidden>
                            <ModuleIcon />
                          </span>
                          <div className="permissoes-editor__module-title-wrap">
                            <span className="permissoes-editor__module-title">{module.label}</span>
                            <span className="permissoes-editor__module-count">
                              {optionCount} {optionCount === 1 ? 'opção' : 'opções'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`permission-pill permissoes-editor__module-toggle-all${moduleHasAnySelected ? ' permission-pill--outline' : ' permission-pill--selected'}`}
                          onClick={() => toggleModuleAll(module.id)}
                        >
                          {moduleHasAnySelected ? 'Desmarcar tudo' : 'Permitir tudo'}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="permissoes-editor__screens">
                          {module.subItems.map((subItem) => {
                            if (isPermissionSectionHeader(subItem)) {
                              return (
                                <div
                                  key={subItem.id}
                                  className="permissoes-editor__screen-row permissoes-editor__screen-row--section"
                                >
                                  <div className="permissoes-editor__screen-label-col">
                                    <span className="permissoes-editor__screen-section-label">{subItem.label}</span>
                                  </div>
                                  <div
                                    className="permissoes-editor__screen-pills-col permissoes-editor__screen-pills-col--section"
                                    aria-hidden
                                  />
                                </div>
                              );
                            }

                            const subItemValue = modulePermissions[subItem.id] ?? '';
                            const pillOptions = getSelectablePillOptions(subItem);
                            const hasPermission = hasSubItemPermission(subItemValue);
                            const isInvalid = isSubItemPermissionFieldInvalid(
                              invalidFieldKeys,
                              module.id,
                              subItem.id,
                            );

                            return (
                              <div
                                key={subItem.id}
                                className={`permissoes-editor__screen-row${isInvalid ? ' permissoes-editor__screen-row--invalid' : ''}${isNestedPermissionSubItem(module, subItem) ? ' permissoes-editor__screen-row--nested' : ''}`}
                              >
                                <div className="permissoes-editor__screen-label-col">
                                  <span className="permissoes-editor__screen-label">{subItem.label}</span>
                                  {subItem.description && (
                                    <span className="permissoes-editor__screen-description">{subItem.description}</span>
                                  )}
                                  {pillOptions.length > 0 && (
                                    <span
                                      className={`permissoes-editor__screen-warning${hasPermission ? ' permissoes-editor__screen-warning--hidden' : ''}`}
                                      aria-hidden={hasPermission}
                                    >
                                      <svg viewBox="0 0 16 16" aria-hidden>
                                        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="8" y1="4.5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                                      </svg>
                                      Sem permissão
                                    </span>
                                  )}
                                </div>
                                <div className="permissoes-editor__screen-pills-col">
                                  {pillOptions.length > 0 ? (
                                    <PermissionPillGroup
                                      options={pillOptions}
                                      value={subItemValue}
                                      onChange={(value) => updateSubItem(module.id, subItem.id, value)}
                                    />
                                  ) : (
                                    <span className="permissoes-editor__screen-warning permissoes-editor__screen-warning--inline">
                                      Sem permissão disponível
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CrModal>

      <UnsavedConfirmModal
        open={unsavedConfirmOpen}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveFromConfirm}
      />

      <ConfirmarNovoPerfilModal
        open={confirmNewProfileOpen}
        profileName={sanitizeProfileNameInput(draftName)}
        permissions={draftPermissions}
        onConfirm={handleConfirmNewProfile}
        onReturn={() => setConfirmNewProfileOpen(false)}
      />

      {showActiveUsersDeleteFlow ? (
        <ExcluirPerfilComUsuariosModal
          open={deleteOpen}
          currentProfileId={profileId}
          profiles={profiles}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={(targetProfileId) => {
            setDeleteOpen(false);
            onMoveUsersAndDelete(targetProfileId);
          }}
        />
      ) : (
        <ExcluirPerfilModal
          open={deleteOpen}
          profileName={draftName}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => {
            setDeleteOpen(false);
            onDelete();
          }}
        />
      )}

      <AppToast
        message={PERMISSIONS_REQUIRED_MESSAGE}
        visible={errorToastVisible}
        onClose={() => setErrorToastVisible(false)}
        variant="warning"
      />
    </>
  );
};
