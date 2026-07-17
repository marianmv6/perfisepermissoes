import { PERMISSION_MODULES, isPermissionSectionHeader } from '../constants/permissionCatalog';
import { applyPermissionDependencies } from './permissionDependencies';
import { selectAllSubItemPills } from './permissionPills';

export const SYSTEM_PROFILE_IDS = ['profile-1', 'profile-2', 'profile-3'] as const;

export type SystemProfileId = (typeof SYSTEM_PROFILE_IDS)[number];

export function isSystemProfile(profileId: string): boolean {
  return (SYSTEM_PROFILE_IDS as readonly string[]).includes(profileId);
}

const DASHBOARD_REPORT_IDS = ['auditoria-infracoes', 'limites-velocidade'] as const;

const OPERADOR_VIEW_ONLY_CADASTRO_IDS = ['veiculos', 'motorista', 'usuarios', 'crachas'] as const;

function buildFullProfilePermissions(): Record<string, Record<string, string>> {
  return PERMISSION_MODULES.reduce<Record<string, Record<string, string>>>((modules, module) => {
    modules[module.id] = module.subItems.reduce<Record<string, string>>((subItems, subItem) => {
      if (!isPermissionSectionHeader(subItem)) {
        subItems[subItem.id] = selectAllSubItemPills(subItem);
      }
      return subItems;
    }, {});
    return modules;
  }, {});
}

function clonePermissions(
  permissions: Record<string, Record<string, string>>,
): Record<string, Record<string, string>> {
  const clone: Record<string, Record<string, string>> = {};
  for (const module of PERMISSION_MODULES) {
    clone[module.id] = { ...(permissions[module.id] ?? {}) };
  }
  return clone;
}

export function buildAdministradorPermissions(): Record<string, Record<string, string>> {
  return applyPermissionDependencies(buildFullProfilePermissions());
}

export function buildAnalistaPermissions(): Record<string, Record<string, string>> {
  const permissions = clonePermissions(buildFullProfilePermissions());
  permissions.video['reproducao-midias'] = 'visualizar';
  return applyPermissionDependencies(permissions);
}

export function buildOperadorPermissions(): Record<string, Record<string, string>> {
  const permissions = clonePermissions(buildFullProfilePermissions());

  permissions.video['reproducao-midias'] = 'visualizar';

  for (const subItemId of OPERADOR_VIEW_ONLY_CADASTRO_IDS) {
    permissions.cadastros[subItemId] = 'visualizar';
  }

  const ocorrenciasModule = PERMISSION_MODULES.find((module) => module.id === 'ocorrencias');
  if (ocorrenciasModule) {
    for (const subItem of ocorrenciasModule.subItems) {
      if (!isPermissionSectionHeader(subItem)) {
        permissions.ocorrencias[subItem.id] = 'visualizar';
      }
    }
  }

  for (const reportId of DASHBOARD_REPORT_IDS) {
    permissions.relatorios[reportId] = '';
  }

  return applyPermissionDependencies(permissions);
}
