import { PERMISSION_MODULES, isPermissionSectionHeader } from '../constants/permissionCatalog';
import type { PermissionSubItem } from '../constants/permissionCatalog';
import { parsePermissionIds } from './permissionPills';

export type PermissionStore = Record<string, Record<string, string>>;

const VISUALIZAR_ID = 'visualizar';
const EDITAR_CRIAR_ID = 'editar-criar';
const DESATIVAR_ID = 'desativar';
const VINCULAR_MOTORISTAS_ID = 'vincular-motoristas';
const CRIAR_CHAMADOS_ID = 'criar-chamados';

function clonePermissionStore(permissions: PermissionStore): PermissionStore {
  const clone: PermissionStore = {};
  for (const module of PERMISSION_MODULES) {
    clone[module.id] = { ...(permissions[module.id] ?? {}) };
  }
  return clone;
}

function getSubItemValue(permissions: PermissionStore, moduleId: string, subItemId: string): string {
  return permissions[moduleId]?.[subItemId] ?? '';
}

function hasAnyPermission(value: string, permissionIds: string[]): boolean {
  const selected = parsePermissionIds(value);
  return permissionIds.some((id) => selected.includes(id));
}

function findSubItem(moduleId: string, subItemId: string): PermissionSubItem | undefined {
  const module = PERMISSION_MODULES.find((item) => item.id === moduleId);
  return module?.subItems.find((item) => item.id === subItemId);
}

function mergeSubItemPermissions(
  currentValue: string,
  subItem: PermissionSubItem,
  requiredPermissionIds: string[],
): string {
  const selected = new Set(parsePermissionIds(currentValue));
  const availableIds = subItem.options
    .map((option) => option.id)
    .filter((id) => id !== 'sem-permissao');

  for (const permissionId of requiredPermissionIds) {
    if (availableIds.includes(permissionId)) {
      selected.add(permissionId);
    }
  }

  const hasActionPermission = [...selected].some((id) => id !== VISUALIZAR_ID);
  if (hasActionPermission && availableIds.includes(VISUALIZAR_ID)) {
    selected.add(VISUALIZAR_ID);
  }

  return availableIds.filter((id) => selected.has(id)).join(', ');
}

function ensureSubItemPermissions(
  permissions: PermissionStore,
  moduleId: string,
  subItemId: string,
  requiredPermissionIds: string[],
): PermissionStore {
  const subItem = findSubItem(moduleId, subItemId);
  if (!subItem || requiredPermissionIds.length === 0) {
    return permissions;
  }

  const currentValue = getSubItemValue(permissions, moduleId, subItemId);
  const mergedValue = mergeSubItemPermissions(currentValue, subItem, requiredPermissionIds);

  if (mergedValue === currentValue) {
    return permissions;
  }

  return {
    ...permissions,
    [moduleId]: {
      ...permissions[moduleId],
      [subItemId]: mergedValue,
    },
  };
}

/** Aplica regras de dependência entre permissões de módulos/sub-itens. */
export function applyPermissionDependencies(permissions: PermissionStore): PermissionStore {
  let next = clonePermissionStore(permissions);

  const cadastroImagens = getSubItemValue(next, 'reconhecimento-facial', 'cadastro-imagens');
  if (hasAnyPermission(cadastroImagens, [EDITAR_CRIAR_ID, DESATIVAR_ID, VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'cadastros', 'motorista', [VISUALIZAR_ID]);
  }

  const procuraSe = getSubItemValue(next, 'reconhecimento-facial', 'procura-se');
  if (hasAnyPermission(procuraSe, [VINCULAR_MOTORISTAS_ID])) {
    next = ensureSubItemPermissions(next, 'cadastros', 'motorista', [EDITAR_CRIAR_ID]);
  } else if (hasAnyPermission(procuraSe, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'cadastros', 'motorista', [VISUALIZAR_ID]);
  }

  const avl = getSubItemValue(next, 'operacao', 'avl');
  if (hasAnyPermission(avl, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'cadastros', 'veiculos', [VISUALIZAR_ID]);
    next = ensureSubItemPermissions(next, 'cadastros', 'motorista', [VISUALIZAR_ID]);
    next = ensureSubItemPermissions(next, 'cadastros', 'grupos-organizacao', [VISUALIZAR_ID]);
  }

  const relatorioOcorrencias = getSubItemValue(next, 'relatorios', 'relatorio-ocorrencias');
  if (hasAnyPermission(relatorioOcorrencias, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'video', 'eventos-videos', [VISUALIZAR_ID]);
    next = ensureSubItemPermissions(next, 'operacao', 'eventos-telemetria', [VISUALIZAR_ID]);
  }

  const relatorioCercas = getSubItemValue(next, 'relatorios', 'cercas');
  if (hasAnyPermission(relatorioCercas, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'cadastros', 'cerca', [VISUALIZAR_ID]);
  }

  const chamados = getSubItemValue(next, 'operacao', 'chamados');
  if (hasAnyPermission(chamados, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'operacao', 'chamados', [CRIAR_CHAMADOS_ID]);
  }

  const centralTratativa = getSubItemValue(next, 'ocorrencias', 'central-tratativa');
  if (hasAnyPermission(centralTratativa, [VISUALIZAR_ID])) {
    next = ensureSubItemPermissions(next, 'ocorrencias', 'central-tratativa', [EDITAR_CRIAR_ID]);
  }

  for (const module of PERMISSION_MODULES) {
    for (const subItem of module.subItems) {
      if (isPermissionSectionHeader(subItem)) {
        continue;
      }
      const value = getSubItemValue(next, module.id, subItem.id);
      if (hasAnyPermission(value, [DESATIVAR_ID])) {
        next = ensureSubItemPermissions(next, module.id, subItem.id, [EDITAR_CRIAR_ID]);
      }
    }
  }

  return next;
}
