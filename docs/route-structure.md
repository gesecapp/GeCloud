# Estrutura de Pastas e Roteamento

## Estrutura de Rota

Toda rota segue esta estrutura dentro de `src/routes/_private/{module}/`:

```
src/routes/_private/{feature}/
├── index.tsx           # Pagina principal (listagem)
├── add.tsx             # Pagina de criacao/edicao
├── $id.tsx             # Pagina de detalhe (opcional)
├── @components/        # Componentes especificos da rota
│   └── {feature}-form.tsx
├── @consts/            # Valores fixos, enums, configs
│   └── {feature}.consts.ts
├── @hooks/             # Hooks especificos da rota
│   ├── use-{feature}-form.ts
│   └── use-{feature}-api.ts  # (se nao for global)
├── @interface/         # Types, Interfaces, Schemas Zod
│   ├── {feature}.interface.ts
│   └── {feature}.schema.ts
└── @utils/             # Funcoes auxiliares (opcional)
```

## Regras de Roteamento

- PROIBIDO usar `.` para criar rotas (ex: `edit.$id.tsx`)
- Toda pasta de rota DEVE ter `index.tsx`
- Estrutura valida: `index.tsx`, `add.tsx`, `$id.tsx`
- Rotas baseadas em diretorios com `index.tsx` obrigatorio

## Hooks: Global vs Local

- Hooks globais ficam em `src/hooks/`
- Hooks especificos da rota ficam em `@hooks/`
- **ANTES de criar um hook**, verificar se ja existe em `src/hooks/`

## Definicao de Rota

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  page: z.number().optional().default(1),
  size: z.number().optional().default(20),
  search: z.string().optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/_private/register/geofences/')({
  component: GeofenceListPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => searchSchema.parse(search),
});
```
