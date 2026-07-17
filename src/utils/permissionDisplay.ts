import type { PermissionModule, PermissionOption, PermissionSubItem } from '../constants/permissionCatalog';
import { PERMISSION_MODULES, isPermissionSectionHeader, moduleHasSectionHeaders } from '../constants/permissionCatalog';
import { hasSubItemPermission, parsePermissionIds, subItemRequiresPermission } from './permissionPills';

export interface SelectOption {
  value: string;
  label: string;
}

/** Expansões customizadas quando a opção de resumo não corresponde 1:1 ao id do sub-item */
const MODULE_SUMMARY_EXPANSIONS: Record<string, Record<string, Record<string, string>>> = {
  'reconhecimento-facial': {
    'editar-criar': {
      'cadastro-imagens': 'editar-criar',
      'procura-se': 'vincular-motoristas',
    },
  },
  video: {
    'baixar-midias': {
      streaming: 'visualizar',
      'reproducao-midias': 'baixar-midias',
      'eventos-videos': 'visualizar',
    },
  },
  operacao: {
    'criar-chamados-upload': {
      'reproducao-rota': 'visualizar',
      avl: 'visualizar',
      'eventos-telemetria': 'visualizar',
      chamados: 'criar-chamados',
      'buscar-area': 'upload-baixar',
    },
  },
  ocorrencias: {
    'criar-editar-tratar': {
      'central-tratativa': 'editar-criar',
      'politicas-ocorrencia': 'editar-criar',
      'regras-tratativas': 'editar-criar',
      contatos: 'editar-criar',
      email: 'editar-criar',
      'mensagem-voz': 'editar-criar',
      auditoria: 'visualizar',
    },
  },
};

export function sortValuesByOptionOrder(value: string, optionIds: string[]): string {
  const selected = new Set(
    value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );

  return optionIds.filter((id) => selected.has(id)).join(', ');
}

export function subItemToSelectOptions(subItem: PermissionSubItem): SelectOption[] {
  return subItem.options.map((option) => ({
    value: option.id,
    label: option.label,
  }));
}

export function moduleToSelectOptions(module: PermissionModule): SelectOption[] {
  return (module.summaryOptions ?? []).map((option) => ({
    value: option.id,
    label: option.label,
  }));
}

export function expandSummaryOption(
  module: PermissionModule,
  summaryId: string,
): Record<string, string> {
  const custom = MODULE_SUMMARY_EXPANSIONS[module.id]?.[summaryId];
  if (custom) {
    return { ...custom };
  }

  const result: Record<string, string> = {};
  for (const subItem of module.subItems) {
    if (isPermissionSectionHeader(subItem)) {
      continue;
    }
    if (subItem.options.some((option) => option.id === summaryId)) {
      result[subItem.id] = summaryId;
    }
  }
  return result;
}

export function expandSummarySelection(
  module: PermissionModule,
  summaryValue: string,
): Record<string, string> {
  const summaryIds = summaryValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (summaryIds.length === 0) {
    return module.subItems.reduce<Record<string, string>>((acc, subItem) => {
      if (!isPermissionSectionHeader(subItem)) {
        acc[subItem.id] = '';
      }
      return acc;
    }, {});
  }

  const merged: Record<string, string> = {};
  for (const summaryId of summaryIds) {
    const expansion = expandSummaryOption(module, summaryId);
    for (const [subItemId, permissionId] of Object.entries(expansion)) {
      merged[subItemId] = permissionId;
    }
  }
  return merged;
}

function subPermissionsMatchSummary(
  module: PermissionModule,
  subPermissions: Record<string, string>,
  summaryId: string,
): boolean {
  const expected = expandSummaryOption(module, summaryId);
  const expectedEntries = Object.entries(expected);
  if (expectedEntries.length === 0) {
    return false;
  }

  return expectedEntries.every(([subItemId, permissionId]) =>
    parsePermissionIds(subPermissions[subItemId] ?? '').includes(permissionId),
  );
}

export function collapseSubPermissionsToSummary(
  module: PermissionModule,
  subPermissions: Record<string, string> | undefined,
): string {
  if (!subPermissions || !module.summaryOptions?.length) {
    return '';
  }

  const matched = module.summaryOptions
    .filter((option) => subPermissionsMatchSummary(module, subPermissions, option.id))
    .map((option) => option.id);

  return matched.join(', ');
}

export function createEmptyProfilePermissions(): Record<string, Record<string, string>> {
  return PERMISSION_MODULES.reduce<Record<string, Record<string, string>>>((modules, module) => {
    modules[module.id] = module.subItems.reduce<Record<string, string>>((subItems, subItem) => {
      if (!isPermissionSectionHeader(subItem)) {
        subItems[subItem.id] = '';
      }
      return subItems;
    }, {});
    return modules;
  }, {});
}

export function createEmptyPermissionStore(profileIds: string[]): Record<string, Record<string, Record<string, string>>> {
  const store: Record<string, Record<string, Record<string, string>>> = {};
  for (const profileId of profileIds) {
    store[profileId] = createEmptyProfilePermissions();
  }
  return store;
}

export function valueToDisplayLabels(value: string, options: PermissionOption[]): string {
  const ids = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return 'Sem permissão';
  }

  return options
    .filter((option) => ids.includes(option.id))
    .map((option) => option.label)
    .join(', ');
}

export function formatPermissionSummaryText(text: string): string {
  if (!text.trim()) {
    return text;
  }

  return text
    .split(',')
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) {
        return trimmed;
      }

      return trimmed.charAt(0).toLocaleUpperCase('pt-BR') + trimmed.slice(1);
    })
    .join(', ');
}

export function getSubItemPermissionDisplayText(subItem: PermissionSubItem, value: string): string {
  const selectedIds = parsePermissionIds(value);
  return formatPermissionSummaryText(
    subItem.options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.label)
      .join(', '),
  );
}

export function getModuleSummaryLabels(
  module: PermissionModule,
  subPermissions: Record<string, string> | undefined,
): string[] {
  if (!subPermissions) {
    return [];
  }

  const summaryValue = collapseSubPermissionsToSummary(module, subPermissions);
  if (summaryValue && module.summaryOptions?.length) {
    const labels = module.summaryOptions
      .filter((option) =>
        summaryValue
          .split(',')
          .map((part) => part.trim())
          .includes(option.id),
      )
      .map((option) => option.label);

    if (labels.length > 0) {
      return labels;
    }
  }

  const labels = new Set<string>();
  let hasAny = false;

  for (const subItem of module.subItems) {
    if (isPermissionSectionHeader(subItem)) {
      continue;
    }

    const raw = subPermissions[subItem.id] ?? '';
    if (!raw.trim()) {
      labels.add('Sem permissão');
      continue;
    }

    hasAny = true;
    subItem.options
      .filter((option) =>
        raw
          .split(',')
          .map((part) => part.trim())
          .includes(option.id),
      )
      .forEach((option) => labels.add(option.label));
  }

  if (!hasAny) {
    return [];
  }

  if (labels.size === 1 && labels.has('Sem permissão')) {
    return [];
  }

  const orderedLabels: string[] = [];
  for (const subItem of module.subItems) {
    if (isPermissionSectionHeader(subItem)) {
      continue;
    }
    for (const option of subItem.options) {
      if (labels.has(option.label) && !orderedLabels.includes(option.label)) {
        orderedLabels.push(option.label);
      }
    }
  }

  return orderedLabels.filter((label) => label !== 'Sem permissão');
}

export function getModuleSummaryText(
  module: PermissionModule,
  subPermissions: Record<string, string> | undefined,
): string {
  return formatPermissionSummaryText(getModuleSummaryLabels(module, subPermissions).join(', '));
}

export function getModuleSummaryDisplay(
  module: PermissionModule,
  subPermissions: Record<string, string> | undefined,
): string {
  const labels = getModuleSummaryLabels(module, subPermissions);
  return labels.length > 0 ? labels.join(', ') : 'Sem permissão';
}

export function nextProfileName(profiles: { name: string }[]): string {
  const numbers = profiles
    .map((profile) => {
      const match = /^Perfil\s+(\d+)$/i.exec(profile.name.trim());
      return match ? Number(match[1]) : 0;
    })
    .filter((number) => number > 0);

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `Perfil ${next}`;
}

export function getModuleSelectValue(
  module: PermissionModule,
  subPermissions: Record<string, string> | undefined,
): string {
  return collapseSubPermissionsToSummary(module, subPermissions);
}

export const SEM_PERMISSAO_ID = 'sem-permissao';
export const VISUALIZAR_ID = 'visualizar';

/** Alterna opção multivalor com regras de exclusão (Sem permissão, Visualizar). */
export function applyExclusivePermissionToggle(
  currentValue: string,
  toggledId: string,
  exclusiveId = SEM_PERMISSAO_ID,
  optionOrder: string[] = [],
): string {
  const vals = currentValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const isAlreadySelected = vals.includes(toggledId);

  let next: string[];

  if (toggledId === exclusiveId) {
    next = isAlreadySelected ? [] : [exclusiveId];
  } else if (toggledId === VISUALIZAR_ID) {
    next = isAlreadySelected ? [] : [VISUALIZAR_ID];
  } else if (isAlreadySelected) {
    next = vals.filter((id) => id !== toggledId);
  } else {
    next = [...vals.filter((id) => id !== exclusiveId && id !== VISUALIZAR_ID), toggledId];
  }

  const joined = next.join(', ');
  return optionOrder.length > 0 ? sortValuesByOptionOrder(joined, optionOrder) : joined;
}

export const PERMISSIONS_REQUIRED_MESSAGE = 'Selecione todas as permissões antes de salvar.';

export function areAllPermissionsComplete(
  permissions: Record<string, Record<string, Record<string, string>>> | Record<string, Record<string, string>>,
): boolean {
  return getEmptyPermissionFieldKeys(permissions as Record<string, Record<string, string>>).fieldKeys.length === 0;
}

export function getEmptyPermissionFieldKeys(permissions: Record<string, Record<string, string>>): {
  fieldKeys: string[];
  moduleIdsWithErrors: string[];
} {
  const fieldKeys: string[] = [];
  const moduleIdsWithErrors: string[] = [];

  for (const module of PERMISSION_MODULES) {
    let moduleHasEmpty = false;

    for (const subItem of module.subItems) {
      if (!subItemRequiresPermission(subItem)) {
        continue;
      }

      const value = permissions[module.id]?.[subItem.id] ?? '';
      if (!value.trim() || !hasSubItemPermission(value)) {
        fieldKeys.push(`subitem:${module.id}:${subItem.id}`);
        moduleHasEmpty = true;
      }
    }

    if (moduleHasEmpty) {
      moduleIdsWithErrors.push(module.id);
    }
  }

  return { fieldKeys, moduleIdsWithErrors };
}

export function isModulePermissionFieldInvalid(
  invalidFieldKeys: Set<string>,
  moduleId: string,
): boolean {
  return invalidFieldKeys.has(`module:${moduleId}`);
}

export function isSubItemPermissionFieldInvalid(
  invalidFieldKeys: Set<string>,
  moduleId: string,
  subItemId: string,
): boolean {
  return invalidFieldKeys.has(`subitem:${moduleId}:${subItemId}`);
}

export function clearPermissionFieldErrors(
  invalidFieldKeys: Set<string>,
  moduleId: string,
  modulePermissions: Record<string, string>,
  subItemId?: string,
): Set<string> {
  if (invalidFieldKeys.size === 0) {
    return invalidFieldKeys;
  }

  const next = new Set(invalidFieldKeys);

  if (subItemId) {
    next.delete(`subitem:${moduleId}:${subItemId}`);
  }

  const module = PERMISSION_MODULES.find((item) => item.id === moduleId);
  if (!module) {
    return next;
  }

  const moduleComplete = module.subItems
    .filter((subItem) => subItemRequiresPermission(subItem))
    .every((subItem) => hasSubItemPermission(modulePermissions[subItem.id] ?? ''));

  if (moduleComplete) {
    for (const subItem of module.subItems) {
      next.delete(`subitem:${moduleId}:${subItem.id}`);
    }
  }

  return next;
}

export type ProfilePermissionSummaryEntry =
  | { kind: 'section'; label: string }
  | { kind: 'item'; label: string; permissionLabels: string; isNested: boolean };

export interface ProfilePermissionSummaryModule {
  moduleLabel: string;
  entries: ProfilePermissionSummaryEntry[];
}

function getSubItemPermissionLabelSummary(subItem: PermissionSubItem, value: string): string {
  return getSubItemPermissionDisplayText(subItem, value);
}

function buildModuleSummaryEntries(
  module: PermissionModule,
  modulePermissions: Record<string, string>,
): ProfilePermissionSummaryEntry[] {
  const entries: ProfilePermissionSummaryEntry[] = [];
  const hasSections = moduleHasSectionHeaders(module);

  for (let index = 0; index < module.subItems.length; index += 1) {
    const subItem = module.subItems[index];
    if (isPermissionSectionHeader(subItem)) {
      continue;
    }

    const value = modulePermissions[subItem.id] ?? '';
    if (!hasSubItemPermission(value)) {
      continue;
    }

    if (hasSections) {
      let sectionLabel: string | null = null;
      for (let sectionIndex = index - 1; sectionIndex >= 0; sectionIndex -= 1) {
        const candidate = module.subItems[sectionIndex];
        if (isPermissionSectionHeader(candidate)) {
          sectionLabel = candidate.label;
          break;
        }
      }

      if (
        sectionLabel &&
        !entries.some((entry) => entry.kind === 'section' && entry.label === sectionLabel)
      ) {
        entries.push({ kind: 'section', label: sectionLabel });
      }
    }

    entries.push({
      kind: 'item',
      label: subItem.label,
      permissionLabels: getSubItemPermissionLabelSummary(subItem, value),
      isNested: hasSections,
    });
  }

  return entries;
}

/** Resumo legível das permissões selecionadas — usado na confirmação de novo perfil. */
export function buildProfilePermissionsSummary(
  permissions: Record<string, Record<string, string>>,
): ProfilePermissionSummaryModule[] {
  return PERMISSION_MODULES.map((module) => ({
    moduleLabel: module.label,
    entries: buildModuleSummaryEntries(module, permissions[module.id] ?? {}),
  })).filter((module) => module.entries.some((entry) => entry.kind === 'item'));
}
