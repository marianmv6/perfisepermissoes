import type { Profile } from '../types/perfisPermissoes.types';
import { createEmptyPermissionStore } from '../utils/permissionDisplay';
import {
  buildAdministradorPermissions,
  buildAnalistaPermissions,
  buildOperadorPermissions,
} from '../utils/systemProfiles';

export const INITIAL_PROFILES: Profile[] = [
  { id: 'profile-1', name: 'Administrador', isLocked: true },
  { id: 'profile-2', name: 'Analista', isLocked: true },
  { id: 'profile-3', name: 'Operador', isLocked: true },
];

export const INITIAL_PERMISSIONS = {
  ...createEmptyPermissionStore(INITIAL_PROFILES.map((profile) => profile.id)),
  'profile-1': buildAdministradorPermissions(),
  'profile-2': buildAnalistaPermissions(),
  'profile-3': buildOperadorPermissions(),
};
