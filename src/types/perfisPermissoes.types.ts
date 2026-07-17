/** Perfil de acesso com permissões por módulo e sub-item */
export interface Profile {
  id: string;
  name: string;
  /** Perfis padrão do sistema — não editáveis na matriz */
  isLocked?: boolean;
}

/** profileId → moduleId → subItemId → opções (ids separados por vírgula) */
export type ProfilePermissionStore = Record<string, Record<string, Record<string, string>>>;

export interface EditarPerfilSession {
  profileId: string;
  isNew: boolean;
}
