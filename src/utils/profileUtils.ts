import type { Profile } from '../types/perfisPermissoes.types';
import { isSystemProfile } from './systemProfiles';

export const MAX_PROFILE_NAME_LENGTH = 30;

const PROFILE_NAME_ALNUM_PATTERN = /[^a-zA-Z0-9]/g;

export function clampProfileName(value: string): string {
  return value.slice(0, MAX_PROFILE_NAME_LENGTH);
}

export function sanitizeProfileNameInput(value: string): string {
  return clampProfileName(value.replace(PROFILE_NAME_ALNUM_PATTERN, ''));
}

export function isProfileNameValid(value: string): boolean {
  return sanitizeProfileNameInput(value).length > 0;
}

/** Perfil 4 possui usuários ativos vinculados (fluxo de mover antes de excluir). */
export function profileHasActiveUsers(profile: Pick<Profile, 'name'>): boolean {
  return sanitizeProfileNameInput(profile.name) === 'Perfil4';
}

export function isProfileEditable(profile: Pick<Profile, 'id' | 'isLocked'>): boolean {
  return !profile.isLocked && !isSystemProfile(profile.id);
}