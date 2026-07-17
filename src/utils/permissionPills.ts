import type { PermissionOption, PermissionSubItem } from '../constants/permissionCatalog';
import { isPermissionSectionHeader } from '../constants/permissionCatalog';

const SEM_PERMISSAO_ID = 'sem-permissao';
const VISUALIZAR_ID = 'visualizar';
const EDITAR_CRIAR_ID = 'editar-criar';
const DESATIVAR_ID = 'desativar';

function sortValuesByOptionOrder(value: string, optionIds: string[]): string {
  const selected = new Set(
    value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );

  return optionIds.filter((id) => selected.has(id)).join(', ');
}

export function parsePermissionIds(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((id) => id !== SEM_PERMISSAO_ID);
}

export function getSelectablePillOptions(subItem: PermissionSubItem): PermissionOption[] {
  return subItem.options.filter((option) => option.id !== SEM_PERMISSAO_ID);
}

export function hasSubItemPermission(value: string): boolean {
  return parsePermissionIds(value).length > 0;
}

export function togglePermissionPill(
  currentValue: string,
  toggledId: string,
  availableOptionIds: string[],
): string {
  const selected = parsePermissionIds(currentValue);
  const isSelected = selected.includes(toggledId);

  let next: string[];

  if (isSelected) {
    if (toggledId === VISUALIZAR_ID) {
      next = [];
    } else {
      next = selected.filter((id) => id !== toggledId);
    }
  } else {
    next = [...selected, toggledId];
    if (toggledId !== VISUALIZAR_ID && availableOptionIds.includes(VISUALIZAR_ID)) {
      if (!next.includes(VISUALIZAR_ID)) {
        next.push(VISUALIZAR_ID);
      }
    }
    if (toggledId === DESATIVAR_ID && availableOptionIds.includes(EDITAR_CRIAR_ID)) {
      if (!next.includes(EDITAR_CRIAR_ID)) {
        next.push(EDITAR_CRIAR_ID);
      }
    }
  }

  return sortValuesByOptionOrder(next.join(', '), availableOptionIds);
}

export function selectAllSubItemPills(subItem: PermissionSubItem): string {
  const optionIds = getSelectablePillOptions(subItem).map((option) => option.id);
  return sortValuesByOptionOrder(optionIds.join(', '), optionIds);
}

export function clearSubItemPills(): string {
  return '';
}

export function isSubItemAllPillsSelected(subItem: PermissionSubItem, value: string): boolean {
  const selectable = getSelectablePillOptions(subItem);
  if (selectable.length === 0) {
    return true;
  }

  const selected = parsePermissionIds(value);
  return selectable.every((option) => selected.includes(option.id));
}

export function isModuleAllPillsSelected(
  subItems: PermissionSubItem[],
  modulePermissions: Record<string, string>,
): boolean {
  return subItems
    .filter((subItem) => !isPermissionSectionHeader(subItem))
    .every((subItem) => isSubItemAllPillsSelected(subItem, modulePermissions[subItem.id] ?? ''));
}

export function isModuleAnyPillsSelected(
  subItems: PermissionSubItem[],
  modulePermissions: Record<string, string>,
): boolean {
  return subItems
    .filter((subItem) => !isPermissionSectionHeader(subItem))
    .some((subItem) => hasSubItemPermission(modulePermissions[subItem.id] ?? ''));
}

export function subItemRequiresPermission(subItem: PermissionSubItem): boolean {
  return !isPermissionSectionHeader(subItem) && getSelectablePillOptions(subItem).length > 0;
}
