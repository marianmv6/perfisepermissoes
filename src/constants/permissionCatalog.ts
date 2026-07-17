/**
 * Catálogo de módulos e opções de permissão — referência Figma (planilha).
 * Usado pela matriz de listagem e pelo accordion de edição de perfil.
 */

export interface PermissionOption {
  id: string;
  label: string;
}

export interface PermissionSubItem {
  id: string;
  label: string;
  options: PermissionOption[];
  /** Linha de segmentação (ex.: Analíticos, Dashboards) — sem permissões */
  isSectionHeader?: boolean;
  /** Descrição da funcionalidade exibida abaixo do título */
  description?: string;
  /** Regra condicional documentada no Figma/planilha */
  note?: string;
}

export function isPermissionSectionHeader(subItem: PermissionSubItem): boolean {
  return subItem.isSectionHeader === true;
}

export function countModulePermissionOptions(module: PermissionModule): number {
  return module.subItems.filter((item) => !isPermissionSectionHeader(item)).length;
}

export function moduleHasSectionHeaders(module: PermissionModule): boolean {
  return module.subItems.some(isPermissionSectionHeader);
}

export function isNestedPermissionSubItem(
  module: PermissionModule,
  subItem: PermissionSubItem,
): boolean {
  return moduleHasSectionHeaders(module) && !isPermissionSectionHeader(subItem);
}

export interface PermissionModule {
  id: string;
  label: string;
  subItems: PermissionSubItem[];
  /** Opções agregadas no nível do módulo (listagem / accordion recolhido) */
  summaryOptions?: PermissionOption[];
}

const opt = (id: string, label: string): PermissionOption => ({ id, label });

const cadastroCrud = [
  opt('editar-criar', 'Editar e criar'),
  opt('desativar', 'Desativar'),
  opt('visualizar', 'Visualizar'),
  opt('sem-permissao', 'Sem permissão'),
];

const viewOnly = [opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')];

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'cadastros',
    label: 'Cadastros',
    summaryOptions: [opt('editar-criar', 'Editar e criar'), opt('desativar', 'Desativar'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
    subItems: [
      {
        id: 'veiculos',
        label: 'Veículos',
        description: 'Cadastro e gestão dos veículos monitorados na plataforma.',
        options: [opt('editar-criar', 'Editar e criar'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
      },
      {
        id: 'motorista',
        label: 'Motorista',
        description: 'Cadastro e gestão dos condutores vinculados aos veículos.',
        options: cadastroCrud,
      },
      {
        id: 'usuarios',
        label: 'Usuários',
        description: 'Gestão de acessos e dados dos usuários da plataforma.',
        options: cadastroCrud,
      },
      {
        id: 'crachas',
        label: 'Crachás',
        description: 'Cadastro e controle de identificação dos motoristas.',
        options: cadastroCrud,
      },
      {
        id: 'grupos-organizacao',
        label: 'Grupos de organização',
        description: 'Estruturação e agrupamento de entidades para organização e controle.',
        options: cadastroCrud,
      },
      {
        id: 'cerca',
        label: 'Cerca',
        description: 'Criação e gerenciamento de áreas geográficas monitoradas.',
        options: cadastroCrud,
      },
    ],
  },
  {
    id: 'reconhecimento-facial',
    label: 'Reconhecimento facial',
    summaryOptions: [opt('editar-criar', 'Editar e criar, Vincular motoristas'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
    subItems: [
      {
        id: 'cadastro-imagens',
        label: 'Cadastro de imagens',
        description: 'Gerenciamento das imagens utilizadas para reconhecimento facial.',
        options: cadastroCrud,
        note: 'Disponível se cadastro de motorista estiver habilitado para editar ou visualizar',
      },
      {
        id: 'procura-se',
        label: 'Procura-se',
        description: 'Exibe pessoas não identificadas pela IA, permitindo análise, correção ou vinculação a um motorista.',
        options: [opt('vincular-motoristas', 'Vincular motoristas'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
        note: 'Criação depende de permissão de cadastro de motorista',
      },
    ],
  },
  {
    id: 'video',
    label: 'Vídeo',
    summaryOptions: [opt('baixar-midias', 'Baixar mídias'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
    subItems: [
      {
        id: 'streaming',
        label: 'Streaming',
        description: 'Visualização ao vivo das câmeras do veículo diretamente na tela de monitoramento.',
        options: viewOnly,
      },
      {
        id: 'reproducao-midias',
        label: 'Reprodução de mídias',
        description: 'Acesso ao histórico de rotas com vídeos disponíveis e solicitação de novas mídias.',
        options: [opt('baixar-midias', 'Baixar mídias'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
      },
      {
        id: 'eventos-videos',
        label: 'Eventos de vídeos',
        description: 'Listagem de eventos capturados com registros em vídeo para análise.',
        options: viewOnly,
      },
    ],
  },
  {
    id: 'operacao',
    label: 'Operação',
    summaryOptions: [
      opt('criar-chamados-upload', 'Criar chamados, Fazer upload'),
      opt('visualizar', 'Visualizar'),
      opt('sem-permissao', 'Sem permissão'),
    ],
    subItems: [
      {
        id: 'reproducao-rota',
        label: 'Reprodução de rota',
        description: 'Visualização de rotas com mapa e dados de telemetria do veículo.',
        options: viewOnly,
      },
      {
        id: 'avl',
        label: 'Tempo real',
        description: 'Monitoramento em tempo real com mapa, status do veículo e informações do condutor.',
        options: viewOnly,
        note: 'Atalhos dependem da tela principal',
      },
      {
        id: 'eventos-telemetria',
        label: 'Eventos de telemetria',
        description: 'Listagem de eventos gerados a partir dos dados de telemetria.',
        options: viewOnly,
      },
      {
        id: 'chamados',
        label: 'Chamados',
        description: 'Visualização e gestão de chamados integrados ao sistema CORA.',
        options: [opt('criar-chamados', 'Criar chamados'), opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
      },
      {
        id: 'buscar-area',
        label: 'Buscar área',
        description: 'Localização de veículos por região, data e hora.',
        options: [
          opt('upload-baixar', 'Fazer upload e baixar arquivos'),
          opt('visualizar', 'Visualizar'),
          opt('sem-permissao', 'Sem permissão'),
        ],
      },
    ],
  },
  {
    id: 'ocorrencias',
    label: 'Ocorrências',
    summaryOptions: [
      opt('criar-editar-tratar', 'Editar e criar'),
      opt('visualizar', 'Visualizar'),
      opt('sem-permissao', 'Sem permissão'),
    ],
    subItems: [
      {
        id: 'central-tratativa',
        label: 'Central de tratativa',
        description: 'Monitoramento e tratamento de ocorrências em tempo real conforme políticas definidas.',
        options: [
          opt('editar-criar', 'Editar e criar'),
          opt('visualizar', 'Visualizar'),
          opt('sem-permissao', 'Sem permissão'),
        ],
      },
      {
        id: 'politicas-ocorrencia',
        label: 'Políticas de ocorrência',
        description: 'Configuração de regras que definem pontuação e ações para cada evento.',
        options: cadastroCrud,
      },
      {
        id: 'regras-tratativas',
        label: 'Regras de tratativas',
        description: 'Cadastro de ações e procedimentos vinculados às políticas de ocorrência.',
        options: cadastroCrud,
      },
      {
        id: 'contatos',
        label: 'Contatos',
        description: 'Gestão de contatos utilizados nas ações de tratativa.',
        options: cadastroCrud,
      },
      {
        id: 'email',
        label: 'Templates de e-mail',
        description: 'Configuração de templates de e-mail para envio nas tratativas.',
        options: cadastroCrud,
      },
      {
        id: 'mensagem-voz',
        label: 'Mensagem de voz',
        description: 'Cadastro de mensagens convertidas em áudio para comunicação com o motorista.',
        options: cadastroCrud,
      },
      {
        id: 'auditoria',
        label: 'Auditoria',
        description: 'Visualização do histórico de ocorrências tratadas para análise e controle.',
        options: viewOnly,
      },
    ],
  },
  {
    id: 'gestao-frota',
    label: 'Gestão de frota',
    summaryOptions: [opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
    subItems: [
      {
        id: 'diagnostico-falhas',
        label: 'Diagnóstico de falhas',
        description: 'Interpretação de códigos CAN com identificação de falhas, possíveis causas e estimativa de custos.',
        options: viewOnly,
        note: 'Depende da solução Smart diag',
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    summaryOptions: [opt('visualizar', 'Visualizar'), opt('sem-permissao', 'Sem permissão')],
    subItems: [
      { id: 'section-analiticos', label: 'Analíticos', isSectionHeader: true, options: [] },
      {
        id: 'relatorio-ocorrencias',
        label: 'Relatório de ocorrências',
        description: 'Listagem de eventos com informações operacionais, localização e contexto.',
        options: viewOnly,
        note: 'Depende de acesso ao módulo Ocorrências',
      },
      {
        id: 'detalhado-trechos',
        label: 'Detalhado de todos os trechos',
        description: 'Dados de trajetos com informações de deslocamento e telemetria.',
        options: viewOnly,
      },
      {
        id: 'relatorio-veiculos',
        label: 'Relatório de veículos',
        description: 'Listagem com informações cadastrais e status operacional.',
        options: viewOnly,
      },
      {
        id: 'parada-motorista-ligado',
        label: 'Parada com motorista ligado',
        description: 'Registro de paradas com dados de tempo, veículo e condutor.',
        options: viewOnly,
      },
      {
        id: 'relatorio-gps',
        label: 'Relatório de GPS',
        description: 'Histórico de posições com informações de telemetria e localização.',
        options: viewOnly,
      },
      {
        id: 'listagem-motoristas',
        label: 'Listagem de motoristas',
        description: 'Relação cadastral com informações gerais dos motoristas.',
        options: viewOnly,
      },
      {
        id: 'cercas',
        label: 'Cercas',
        description: 'Eventos relacionados a áreas monitoradas e suas ocorrências.',
        options: viewOnly,
        note: 'Depende de acesso a Cerca',
      },
      { id: 'section-dashboards', label: 'Dashboards', isSectionHeader: true, options: [] },
      {
        id: 'auditoria-infracoes',
        label: 'Auditoria de infrações',
        description: 'Análise de infrações registradas para acompanhamento e tratativa (legado).',
        options: viewOnly,
      },
      {
        id: 'limites-velocidade',
        label: 'Limites de velocidade',
        description: 'Monitoramento de ocorrências de excesso de velocidade (legado).',
        options: viewOnly,
      },
    ],
  },
];
