---
trigger: always_on
---

# Project Expert Agent

Expert na arquitetura do projeto FrontEnd-Architecture. Guia implementacao de paginas, hooks, formularios e integracao com TanStack/Zustand seguindo os padroes reais do codebase.

## Regras Sempre Ativas

- Use ShadCN UI (`src/components/ui`) - NUNCA tags HTML puras estilizadas
- **PROIBIDO**: `<h1-6>`, `<p>`, `<span>` com classes de tipografia em componentes comuns — usar `<ItemTitle>`, `<ItemDescription>`
- **PROIBIDO**: `<div className="flex flex-col gap-*">` para layout — usar `<ItemGroup>`, `<ItemContent>`, `<ItemHeader>`, `<ItemFooter>`, `<ItemActions>`
- Tipagem de componentes UI: `React.ComponentProps<'element'>`, `cn()`, `data-slot`, `cva` + `VariantProps`
- Usar Zustand com `persist` - NUNCA `localStorage.setItem` direto
- PROIBIDO usar `.` para criar rotas aninhadas (ex: `edit.$id.tsx`)
- NUNCA usar Card em componentes comuns - usar `Item`, `ItemTitle`, `ItemDescription`
- NUNCA `mx-auto` no ChartContainer
- Cores de graficos: `getChartColor(index)` de `src/components/ui/chart`
- ANTES de criar hooks, verificar se ja existe em `src/hooks/`
- Antes de commitar: `pnpm run format` e `pnpm run check`

## Documentacao sob Demanda

Consulte os documentos abaixo conforme o cenario da tarefa:

### Quando iniciar uma nova feature ou criar pastas
Leia `docs/route-structure.md` para a estrutura de pastas obrigatoria e regras de roteamento.
Leia `docs/checklist.md` para o checklist completo de nova feature.

### Quando criar uma pagina de listagem ou formulario
Leia `docs/page-patterns.md` para exemplos completos de paginas de listagem e formulario com todos os componentes.

### Quando criar ou modificar hooks de API (TanStack Query)
Leia `docs/api-hooks.md` para o padrao de query keys, useQuery, useMutation e invalidation.

### Quando criar formularios (react-hook-form + zod)
Leia `docs/form-hooks.md` para o padrao de hook de formulario e componente de form com DefaultFormLayout.

### Quando criar interfaces, schemas Zod ou constantes
Leia `docs/schemas-types.md` para o padrao de schema, type inferido e consts.

### Quando lidar com estado global ou persistencia
Leia `docs/state-management.md` para padroes de Zustand, persist e quando usar cada tipo de estado.

### Quando implementar componentes React ou refatorar
Leia `docs/react-patterns.md` para padroes de componentes, estrutura interna, early returns e anti-patterns.

### Quando criar ou usar graficos (Recharts)
Leia `docs/charts.md` para padroes de graficos, cores com `getChartColor`, tipos de grafico e modelos de referencia.

### Quando precisar usar selects, hooks ou componentes existentes
Leia `docs/available-resources.md` para a lista de selects, hooks globais e componentes obrigatorios disponiveis.

### Quando precisar usar máscaras (CPF, Telefone, Data)
Leia `docs/masks.md` para as funções de máscara padronizadas.

### Quando quiser consultar o stack do projeto
Leia `docs/stack.md` para a tabela completa de tecnologias e versoes.

### Quando usar componentes Item ou criar componentes UI
Leia `docs/item-pattern.md` para o padrao Item, tabela de substituicao de tags HTML, padrao de tipagem e exemplos.