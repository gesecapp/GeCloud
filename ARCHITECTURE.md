# Padrões e arquitetura do Projeto

- **Core**: `React`, `Vite` com `TanStack Router`, `TanStack Query` e `Zustand` (Estado Global).

- **UI & Estilização**: `ShadCN UI` ( localizado em [***`src/components/ui`***](./src/components/ui) ).
  - **⚠️ PROIBIDO tags HTML puras estilizadas**: Toda tipografia e layout em componentes comuns deve usar os componentes de [***`Item.tsx`***](./src/components/ui/item.tsx). Veja [***`docs/item-pattern.md`***](./docs/item-pattern.md) para a documentação completa.
  - **Paleta de Gráficos**: Para manter a consistência em gráficos (Recharts, etc), utilize a função utilitária [***`getChartColor(index)`***](./src/components/ui/chart) Ela cicla entre as cores padrão do Tailwind (Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink, Rose, Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal, Cyan) e tons (400, 500, 600...) conforme o índice aumenta, use `index * 2` para ter maior variação das cores.

- **Roteamento**: As rotas são baseadas em **diretórios**. Cada pasta de rota deve conter obrigatoriamente um arquivo `index.tsx` com a estrutura principal. É proibido o uso do caractere `.` para criar rotas aninhadas. Isso garante a integridade funcional do `Breadcrumb` e da `Sidebar`.

- **Gerenciamento de Estado**: Utilize **Zustand** para estados globais complexos. Não utilize `localStorage.setItem` diretamente. Utilize o middleware `persist` do Zustand para persistência de dados.

- **Estados Vazios**: Caso não haja dados ou o retorno de filtros e buscas seja vazio (`data.length === 0`), utilize obrigatoriamente o componente [***`default-empty-data.tsx`***](./src/components/default-empty-data.tsx).

- **Estado de Loading**: Em caso de requisições pendentes, utilize obrigatoriamente o componente de skeleton [***`DefaultLoading`***](./src/components/default-loading.tsx).

- **Layout de Formulário:**: Utilize o componente [***`DefaultFormLayout`***](./src/components/default-form-layout.tsx) como padrão base para garantir a consistência visual em telas de cadastro ou edição.

- **Modelos de Exibição de Dados (Gráficos, Tabelas e Números)**:
Estes arquivos servem de modelos a serem seguidos e **não devem ser importados**.
  - [***`GraphArea`***](./src/components/graph-area.tsx): Modelo para gráfico de área.
  - [***`GraphBarStacked`*** ](./src/components/graph-bar-stacked.tsx): Modelo para gráfico de barras e barras sobrepostas.
  - [***`GraphBreakParts`***](./src/components/graph-break-parts.tsx): Modelo para gráfico de treemap e distribuição de total.
  - [***`GraphLines`***](./src/components/graph-lines.tsx): Modelo para gráfico de linhas.
  - [***`GraphPizza`***](./src/components/graph-pizza.tsx): Modelo para gráfico de pizza.
  - [***`GraphProgress`***](./src/components/graph-progress.tsx): Modelo para gráfico de progresso do total.
  - [***`GraphRadial`***](./src/components/graph-radial.tsx): Modelo para gráfico radial.
  - [***`DefaultKPI`***](./src/components/default-KPI.tsx): Modelo para exibição de números e KPIs.
  - [***`DefaultTable`***](./src/components/default-table.tsx): Modelo para tabelas com paginação e filtros.

- **Dicas para Gráficos**:
  - **NÃO use `mx-auto`** no `ChartContainer` (gera bugs no `ResponsiveContainer`).
  - Use `getChartColor(index)` para mapear cores dinâmicas.
  - Utilize `aspect-square` ou `max-h-[XXXpx]` para controlar o tamanho.

- **Hook de API (Padrão)**: Utilize o `TanStack Query` com chaves centralizadas.
  ```tsx
  // src/hooks/use-users-api.ts
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import { api } from '@/lib/api/client';

  // Query keys centralizadas
  export const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
  };

  // Hook de Query
  export function useUsers() {
    return useQuery({
      queryKey: usersKeys.lists(),
      queryFn: async () => {
        const response = await api.get('/user/list');
        return response.data;
      },
    });
  }

  // Hook de Mutations
  export function useUsersApi() {
    const queryClient = useQueryClient();
    
    const createUser = useMutation({
      mutationFn: (data) => api.post('/user', data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
    });
    
    return { createUser };
  }
  ```

- **Hook de Formulário (Padrão)**: Utilize o `react-hook-form` com `zod` para validação.
  ```tsx
  // src/routes/_private/users/@hooks/use-user-form.ts
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useUsersApi } from '@/hooks/use-users-api';
  import { userFormSchema, type UserFormData } from '../@interface/user';

  export function useUserForm(initialData?: UserFormData) {
    const { createUser, updateUser } = useUsersApi();
    
    const form = useForm<UserFormData>({
      resolver: zodResolver(userFormSchema),
      defaultValues: initialData,
    });
    
    const onSubmit = form.handleSubmit(async (data) => {
      if (initialData?.id) {
        await updateUser.mutateAsync(data);
      } else {
        await createUser.mutateAsync(data);
      }
    });
    
    return { form, onSubmit, isPending: createUser.isPending || updateUser.isPending };
  }
  ```

- **Criação e Reutilização de Hooks**:
  **Antes de criar qualquer hook** na pasta `@hooks/` da rota, verifique se já existe na pasta de hooks compartilhados em [***`src/hooks/`***](./src/hooks/).

  **Árvore de Decisão**:
  ```markdown
    Preciso de `useMachines()` para listar máquinas?
      └─ Já existe em `src/hooks/use-machines-api.ts`? 
          ├─ **SIM** → `import { useMachines } from '@/hooks/use-machines-api'`
          └─ **NÃO** → Criar em `src/hooks/use-machines-api.ts` (reutilizável)

    Preciso de `useMachineForm()` para gerenciar formulário de máquina?
      └─ É específico da rota de edição de máquina?
          ├─ **SIM** → Criar em `@hooks/use-machine-form.ts`
          └─ **NÃO** → Avaliar se deve ir em `src/hooks/`
  ```

  **Hooks Globais (258 hooks em `src/hooks`) - TOP 15 mais usados:**
  | Hook | Usos | Descrição |
  |------|------|-----------|
  | `useSidebar` | 7 | Estado da sidebar |
  | `useSidebarToggle` | 7 | Toggle da sidebar |
  | `useCMMSKPIs` | 6 | KPIs do CMMS |
  | `useIsMobile` | 5 | Detecta dispositivo mobile |
  | `useMachinesByEnterpriseSelect` | 5 | Máquinas por empresa (select) |
  | `useEnterprisesSelect` | 4 | Empresas para select |
  | `useUsersApi` | 4 | CRUD usuários |
  | `usePartsApi` | 3 | CRUD peças |
  | `useModelMachinesApi` | 3 | CRUD modelos de máquinas |
  | `usePlatformsApi` | 3 | CRUD plataformas |
  | `useAuth` | 3 | Sessão e login |
  | `useSensorsApi` | 3 | CRUD sensores |
  | `useMachinesApi` | 3 | CRUD máquinas |

### Criação de pagina:

**1. Definição da Rota**

  ```tsx
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/_private/permissions/users/")({
    component: ListUsersPage,
  });
  ```

**Com validação de Search Params (Opcional):**

  ```tsx
  import { z } from 'zod';

  const searchSchema = z.object({
    id: z.string().optional(),
    filter: z.string().optional(),
  });

  export const Route = createFileRoute("/_private/machine-list/")({
    component: MachineListPage,
    validateSearch: searchSchema,
  });

  // Dentro do componente:
  const { id, filter } = useSearch({ from: '/_private/machine-list/' });
  ```

| Arquivo | Rota Gerada | Descrição / Regra |
| :--- | :--- | :--- |
| `index.tsx` | `/` | Define a página raiz do diretório. |
| `add.tsx` | `/add` | Rota para criação de novos registros. |
| `$id.tsx` | `/:id` | Rota dinâmica que recebe o ID como parâmetro. |
| `edit.$id.tsx` | — | **NÃO UTILIZAR.** (Proibido o uso de `.` em arquivos). |


**2. Estrutura da Página (Componente)**

  - Páginas ( _definidas pelo uso de `createFileRoute`_ ): Devem obrigatoriamente iniciar com `<Card>` seguido de `<CardHeader>` como estrutura principal.

  - **⚠️ Componentes Comuns**: Não podem utilizar componentes de [~~`Card.tsx`~~](./src/components/ui/card.tsx). Devem utilizar exclusivamente as opções de [***`Item.tsx`***](./src/components/ui/item.tsx).
    - **PROIBIDO**: Tags HTML puras estilizadas com classes Tailwind para tipografia e layout (ex: `<h3 className="font-semibold text-lg">`, `<p className="text-muted-foreground text-sm">`, `<div className="flex flex-col items-center gap-4">`).
    - **OBRIGATÓRIO**: Utilizar `<ItemTitle />` para títulos, `<ItemDescription />` para descrições, `<ItemContent />` para blocos de conteúdo, `<ItemHeader />` e `<ItemFooter />` para cabeçalhos/rodapés, e `<ItemActions />` para áreas de ação.
    - Documentação completa: [***`docs/item-pattern.md`***](./docs/item-pattern.md)

  - **Padrão de Tipagem dos Componentes UI**: Todo componente em `src/components/ui/` deve seguir o padrão de tipagem do `Item.tsx`:
    - Props baseadas em `React.ComponentProps<'element'>` (ex: `React.ComponentProps<'div'>`)
    - Merge de classes via `cn(estilos_base, className)` — `className` sempre por último
    - Atributo `data-slot="nome"` para identificação no DOM
    - Para variantes: `cva()` + `VariantProps<typeof variants>`

  1. [***`Card`***](./src/components/ui/card.tsx): **OBRIGATÓRIO** Atua como `Shell/Wrapper` principal de página. **Toda rota** deve ser encapsulada por este componente.

  2. [***`CardHeader`***](./src/components/ui/card.tsx): **OBRIGATÓRIO** Cabeçalho padrão. Deve conter `<CardTitle>` para o título e `<CardAction>` para elementos de ação (botões, filtros, busca).

  3. [***`ItemTitle` e `ItemDescription`***](./src/components/ui/item.tsx): Componentes padrão para títulos e descrições de itens. Devem ser usados em listas, tabelas e detalhes. **NUNCA** usar `<h1-6>`, `<p>`, `<span>` com classes de tipografia diretamente.
  
Exemplo:

  ```tsx
  import { createFileRoute, Link } from '@tanstack/react-router';

  export const Route = createFileRoute('/_private/rota-da-pagina/')({
    component: MinhaPagina,
  });

  export function MinhaPagina() {
    const navigate = Route.useNavigate();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Meu Módulo</CardTitle>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Filter className="size-4" />
                Filtrar
              </Button>
              <Button onClick={() => {
                navigate({ to: '/add' } satisfies { to: string })
              }}>
                <Plus className="size-4" />
                Novo
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        
        <CardContent>
          <Item>
            {/* Conteúdo da página */}
          </Item>
        </CardContent>
        
        <CardFooter>
          {/* Ações e paginação */}
        </CardFooter>
      </Card>
    );
  }
  ```

### Organização de Rotas e Pastas
As subpastas `@hooks`, `@interface`, `@components`, `@consts` e `@utils` devem ser criadas na pasta da rota, elas seguem o seguinte propósito:

| Pasta | Conteúdo | Quando Usar |
|-------|----------|-------------|
| `@components/` | Componentes React | Elementos visuais utilizados exclusivamente nesta rota. |
| `@consts/` | Arrays, objetos, enums | Valores `hardcoded` ou que não mudam em runtime. |
| `@hooks/` | Hooks de API e lógica de formulário | Lógica de formulários (useForm) ou queries/mutations de API específicas. |
| `@interface/` | Types, Interfaces, Schemas Zod | Tipagens TypeScript (Interfaces/Types) e Schemas de validação (Zod). |
| `@utils/` | Funções puras e auxiliares | Lógica de processamento de dados que não depende de estado React ou hooks. |

```markdown
src/routes/_private/{module}/
├── index.tsx                # Página principal da rota
│
├── {subroute}/              # Outra pasta
│   ├── @components/         # Componentes específicos da rota
│   │   └── {ComponentName}.tsx
│   │
│   ├── @consts/             # Valores fixos, enums
│   │   └── {feature}.consts.ts
│   │
│   ├── @hooks/              # Hooks específicos da rota
│   │   ├── use-{feature}-form.ts
│   │   └── use-{feature}-api.ts
│   │
│   ├── @interface/          # Tipos, Interfaces, Schemas Zod
│   │   ├── {feature}.types.ts
│   │   └── {feature}.schema.ts
│   │
│   ├── @utils/              # Funções auxiliares e processamento
│   │   └── {feature}.utils.ts
│   │
│   └── index.tsx            # Página da subrota
```

 --------- 

### Seletores de Dados (Selects)
[***`src/components/selects`***](./src/components/selects) - **68 componentes disponíveis**
Os componentes de seleção de dados do sistema encapsulam a lógica de requisição a API, seu loading e tratamento de erro, já estão estilizados com label e icone seguindo o padrão do sistema.

**TOP 10 mais usados:**

| Componente | Usos | Descrição |
| :--- | :--- | :--- |
| `MachineByEnterpriseSelect` | 28 | Máquinas filtradas pela empresa selecionada |
| `EnterpriseSelect` | 27 | Seleção de empresas (filtro global) |
| `MachineSelect` | 9 | Seleção de máquinas |
| `UserSelect` | 8 | Seleção de usuários |
| `UnitSelect` | 5 | Seleção de unidades |
| `SensorByMachineSelect` | 5 | Sensores filtrados pela máquina |
| `MaintenancePlanSelect` | 4 | Planos de manutenção |
| `CustomerSelect` | 4 | Seleção de clientes |
| `ConsumptionMachineSelect` | 4 | Máquinas para consumo |
| `ModelMachineSelect` | 4 | Modelos de máquinas |

*(Verifique o diretório antes de criar um novo select)*

Recebem como props
- `mode`: `'single' | 'multi'` (Define se é seleção única ou múltipla).
- `value`: `string | string[]`
- `onChange`: `(value) => void`
- `label?`: `string` (Evitar o uso)
- `placeholder?`: `string` (Evitar o uso)
- `disabled?`: `boolean`
- `clearable?`: `boolean`

### Ferramentas de Produtividade

**Biome** para formatação de código. Antes de fazer commits rode `pnpm run format`.

**TypeScript** para tipagem de código. Antes de fazer commits rode `pnpm run check`.

**Tailwind CSS intellisense** para ter as classes disponíveis. Clique `Ctrl + Espaço` (Windows) ou `Cmd + Espaço` (Mac) para ver as opções disponíveis estando o cursor dentro de uma `className=""`.


