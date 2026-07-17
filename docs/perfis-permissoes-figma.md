# Perfis e Permissões — Referência Figma

Documento de especificação visual e funcional para a **área de conteúdo** do módulo.  
O layout base (sidebar, header, roteamento) já está implementado e **não deve ser alterado** — tudo abaixo entra em `src/pages/perfis-permissoes/` e `src/components/`.

Referência de componentes e tokens: `modulo-eventos-novo/docs/platform-design-system.md`.

---

## 1. Visão geral — listagem (matriz de perfis)

**Toolbar**
- Título: `Perfis e permissões` (classe `.body-page-title`)
- Botão primário à direita: **Adicionar perfil** (ícone `+`)

**Tabela / matriz**
- Colunas dinâmicas: uma por perfil cadastrado (`Perfil 1`, `Perfil 2`, …)
- Cabeçalho de coluna: nome do perfil + ícone lápis (editar → abre tela de edição)
- Linhas: módulos de permissão (7 categorias principais)

| Ícone | Módulo |
|-------|--------|
| Cadastros | Cadastros |
| Reconhecimento | Reconhecimento facial |
| Vídeo | Vídeo |
| Operação | Operação |
| Ocorrências | Ocorrências |
| Frota | Gestão de frota |
| Relatórios | Relatórios |

**Células**
- Cada interseção perfil × módulo: select multivalor (`ModalSelect` com `multiple`)
- Exibe resumo truncado das permissões selecionadas (ex.: `Criar, editar, tratar…`, `Visualizar`, `Sem permissão`)
- Chevron à direita de cada linha: expande detalhe do módulo (comportamento na listagem — resumo agregado)

**Fluxos**
- **Adicionar perfil** → modal (seção 2)
- **Lápis no cabeçalho** → tela de edição (seção 3)

---

## 2. Modal — Adicionar perfil

Componente: `CrModal` (padrão do design system).

| Elemento | Detalhe |
|----------|---------|
| Título | `Adicionar perfil` |
| Campo | Label `Nome do perfil` + `RequiredFieldMarker` (bolinha laranja) |
| Input | Texto livre; placeholder/exemplo: `Perfil 4` |
| Rodapé | **Cancelar** (outline) · **Adicionar** (primary) |

**Validação**
- Nome obrigatório
- Ao confirmar: cria perfil e adiciona coluna na matriz

---

## 3. Tela — Editar perfil

Substitui a matriz enquanto ativa (view dedicada, não modal).

**Cabeçalho**
- Input editável com nome do perfil (ex.: `Perfil 4`)
- Botão `×` à direita (fechar / voltar à listagem)

**Seção `Permissões`**
- Faixa divisória com label centralizado
- Lista em **accordion** por módulo (7 categorias)

**Accordion expandido (ex.: Cadastros)**
- Sub-itens com select multivalor por linha:
  - Veículos, Motoristas, Usuários, Crachás, Grupos de organização, Cercas
- Dropdown com checkboxes (`ModalSelect` `multiple`)

**Accordion recolhido**
- Ícone + nome do módulo + resumo das permissões no select (somente leitura visual)

**Rodapé fixo**
| Botão | Estilo | Ação |
|-------|--------|------|
| Excluir perfil | danger / outline vermelho | Abre modal de confirmação (seção 4) |
| Cancelar | outline | Descarta alterações, volta à listagem |
| Salvar | primary | Persiste nome + permissões |

---

## 4. Modal — Excluir perfil

| Elemento | Detalhe |
|----------|---------|
| Ícone | Triângulo de alerta (vermelho) |
| Título | `Atenção` |
| Mensagem | `Tem certeza de que deseja excluir o perfil “{nome}” e todas as suas permissões?` |
| Rodapé | **Cancelar** (outline) · **Excluir** (danger, fundo vermelho) |

---

## 5. Matriz de opções de permissão

Fonte: planilha de referência (5ª imagem).  
Definição tipada em `src/constants/permissionCatalog.ts`.

### Cadastros
Sub-itens: Veículos, Motorista, Usuários, Crachás, Grupos de organização, Cerca.

| Sub-item | Opções |
|----------|--------|
| Veículos | Editar e criar · Visualizar · Sem permissão |
| Demais | Editar e criar · Desativar · Visualizar · Sem permissão |

### Reconhecimento facial
| Sub-item | Opções | Observação |
|----------|--------|------------|
| Cadastro de imagens | Editar e criar · Desativar · Visualizar · Sem permissão | Depende de cadastro de motorista habilitado para editar/visualizar |
| Procura-se | Vincular motoristas · Visualizar · Sem permissão | Criação depende de permissão de cadastro de motorista |

### Vídeo
| Sub-item | Opções |
|----------|--------|
| Streaming | Visualizar · Sem permissão |
| Reprodução de mídias | Baixar mídias · Visualizar · Sem permissão |
| Eventos de vídeos | Visualizar · Sem permissão |

### Operação
| Sub-item | Opções | Observação |
|----------|--------|------------|
| *(categoria)* | Criar chamados, Fazer upload · Visualizar · Sem permissão | Resumo no accordion |
| Reprodução de rota | Visualizar · Sem permissão | |
| AVL | Visualizar · Sem permissão | Atalhos dependem da tela principal |
| Eventos de telemetria | Visualizar · Sem permissão | |
| Chamados | Criar chamados · Visualizar · Sem permissão | |
| Buscar área | Fazer upload e baixar arquivos · Visualizar · Sem permissão | |

### Ocorrências
| Sub-item | Opções |
|----------|--------|
| Central de tratativa | Tratar e validar eventos · Visualizar · Sem permissão |
| Políticas de ocorrência | Editar e criar · Desativar · Visualizar · Sem permissão |
| Regras de tratativas | Editar e criar · Desativar · Visualizar · Sem permissão |
| Contatos | Editar e criar · Desativar · Visualizar · Sem permissão |
| E-mail | Editar e criar · Desativar · Visualizar · Sem permissão |
| Mensagem de voz | Editar e criar · Desativar · Visualizar · Sem permissão |
| Auditoria | Visualizar · Sem permissão |

### Gestão de frota
| Sub-item | Opções | Observação |
|----------|--------|------------|
| Diagnóstico de falhas | Sem permissão (padrão) | Depende da solução Smart diag |

### Relatórios
**Analíticos** — todos: Visualizar · Sem permissão

| Sub-item | Observação |
|----------|------------|
| Relatório de ocorrências | Depende de acesso ao módulo Ocorrências |
| Detalhado de todos os trechos | |
| Relatório de veículos | |
| Parada com motorista ligado | |
| Relatório de GPS | |
| Listagem de motoristas | |
| Cercas | Depende de acesso a Cerca |

**Dashboard** — Visualizar · Sem permissão
- Auditoria de infrações
- Limites de velocidade

---

## 6. Componentes a criar (futuro)

```
src/components/
├── PerfisPermissoesMatrix.tsx      # matriz listagem
├── AdicionarPerfilModal.tsx        # modal criar
├── EditarPerfilView.tsx            # tela edição + accordion
├── ExcluirPerfilModal.tsx          # modal confirmação
└── PermissionModuleAccordion.tsx   # accordion reutilizável
```

**Componentes compartilhados a reutilizar do design system** (copiar de `modulo-eventos-novo`, não recriar):
- `CrModal`
- `ModalSelect` (`multiple`, `modal-select--no-pill`)
- `RequiredFieldMarker`
- `UnsavedConfirmModal` (saída com alterações não salvas na edição)

---

## 7. Estados da página

```
listagem (matriz)
  ├─ modal adicionar perfil
  └─ edição de perfil
       ├─ modal excluir perfil
       └─ modal confirmação saída (alterações não salvas)
```

Implementação sugerida: estado local em `PerfisPermissoesPage` (`view: 'list' | 'edit'`, modais booleanos).
