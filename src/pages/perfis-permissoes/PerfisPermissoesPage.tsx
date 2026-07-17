import React, { useState } from 'react';

import { PerfisPermissoesMatrix } from '../../components/PerfisPermissoesMatrix';
import { AdicionarPerfilModal } from '../../components/AdicionarPerfilModal';
import { PerfilNomeModal } from '../../components/PerfilNomeModal';
import { EditarPerfilModal } from '../../components/EditarPerfilModal';
import { AppToast } from '../../components/shared/AppToast';
import { INITIAL_PERMISSIONS, INITIAL_PROFILES } from '../../mocks/profiles.mock';
import { createEmptyProfilePermissions } from '../../utils/permissionDisplay';
import { isProfileEditable } from '../../utils/profileUtils';
import type { EditarPerfilSession, Profile } from '../../types/perfisPermissoes.types';

const DELETE_SUCCESS_MESSAGE = 'Perfil excluído com sucesso.';

export const PerfisPermissoesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editNameProfileId, setEditNameProfileId] = useState<string | null>(null);
  const [editSession, setEditSession] = useState<EditarPerfilSession | null>(null);
  const [deleteSuccessToastVisible, setDeleteSuccessToastVisible] = useState(false);

  const activeProfile = editSession
    ? profiles.find((profile) => profile.id === editSession.profileId) ?? null
    : null;

  const editNameProfile = editNameProfileId
    ? profiles.find((profile) => profile.id === editNameProfileId) ?? null
    : null;

  const openEditSession = (profileId: string, isNew: boolean) => {
    setEditSession({ profileId, isNew });
  };

  const closeEditSession = () => {
    setEditSession(null);
  };

  const removeProfile = (profileId: string) => {
    setProfiles((current) => current.filter((profile) => profile.id !== profileId));
    setPermissions((current) => {
      const next = { ...current };
      delete next[profileId];
      return next;
    });
  };

  const handleAddProfileName = (name: string) => {
    const id = `profile-${Date.now()}`;
    setProfiles((current) => [...current, { id, name }]);
    setPermissions((current) => ({
      ...current,
      [id]: createEmptyProfilePermissions(),
    }));
    setAddModalOpen(false);
    openEditSession(id, true);
  };

  const handleEditProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile || !isProfileEditable(profile)) {
      return;
    }
    setEditNameProfileId(profileId);
  };

  const handleEditProfileNameSaveAndExit = (name: string) => {
    if (!editNameProfileId) return;

    setProfiles((current) =>
      current.map((profile) => (profile.id === editNameProfileId ? { ...profile, name } : profile)),
    );
    setEditNameProfileId(null);
  };

  const handleEditProfileNameSaveAndEdit = (name: string) => {
    if (!editNameProfileId) return;

    const profileId = editNameProfileId;
    setProfiles((current) =>
      current.map((profile) => (profile.id === profileId ? { ...profile, name } : profile)),
    );
    setEditNameProfileId(null);
    openEditSession(profileId, false);
  };

  const handleCancelEdit = () => {
    if (editSession?.isNew && editSession.profileId) {
      removeProfile(editSession.profileId);
    }
    closeEditSession();
  };

  const handleSaveEdit = (name: string, profilePermissions: Record<string, Record<string, string>>) => {
    if (!editSession) return;

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === editSession.profileId ? { ...profile, name } : profile,
      ),
    );
    setPermissions((current) => ({
      ...current,
      [editSession.profileId]: profilePermissions,
    }));
    closeEditSession();
  };

  const handleDeleteProfile = () => {
    if (!editSession) return;
    removeProfile(editSession.profileId);
    closeEditSession();
    setDeleteSuccessToastVisible(true);
  };

  const handleMoveUsersAndDelete = (_targetProfileId: string) => {
    if (!editSession) return;
    removeProfile(editSession.profileId);
    closeEditSession();
    setDeleteSuccessToastVisible(true);
  };

  return (
    <div className="perfis-permissoes-page page-layout content-body">
      <div className="content-toolbar top-bar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Perfis e permissões</h1>
        </div>
        <div className="content-toolbar-right">
          <button type="button" className="cr-btn cr-btn--primary" onClick={() => setAddModalOpen(true)}>
            Adicionar perfil
          </button>
        </div>
      </div>

      <div className="perfis-permissoes-page__content">
        <PerfisPermissoesMatrix
          profiles={profiles}
          permissions={permissions}
          onEditProfile={handleEditProfile}
        />
      </div>

      <AdicionarPerfilModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProfileName}
      />

      {editNameProfile && (
        <PerfilNomeModal
          open
          mode="edit"
          title="Editar perfil"
          primaryLabel="Salvar e editar permissões"
          initialName={editNameProfile.name}
          formId="editar-perfil-nome-form"
          onClose={() => setEditNameProfileId(null)}
          onSubmit={handleEditProfileNameSaveAndEdit}
          onSaveAndExit={handleEditProfileNameSaveAndExit}
        />
      )}

      {activeProfile && editSession && (
        <EditarPerfilModal
          open
          profileId={editSession.profileId}
          profileName={activeProfile.name}
          profiles={profiles}
          permissions={permissions[editSession.profileId] ?? createEmptyProfilePermissions()}
          isNew={editSession.isNew}
          onClose={handleCancelEdit}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
          onDelete={handleDeleteProfile}
          onMoveUsersAndDelete={handleMoveUsersAndDelete}
        />
      )}

      <AppToast
        message={DELETE_SUCCESS_MESSAGE}
        visible={deleteSuccessToastVisible}
        onClose={() => setDeleteSuccessToastVisible(false)}
        variant="success"
      />
    </div>
  );
};
