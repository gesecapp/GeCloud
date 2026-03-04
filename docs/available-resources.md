# Recursos Disponiveis no Projeto

## Componentes de Select (68 em `src/components/selects/`)

Usar os componentes prontos ao inves de criar Select do zero. Ja encapsulam API, loading e erro.

```tsx
import { EnterpriseSelect, MachineByEnterpriseSelect, UserSelect } from '@/components/selects';

// Single select
<EnterpriseSelect mode="single" value={idEnterprise} onChange={setIdEnterprise} />

// Multi select
<MachineByEnterpriseSelect
  mode="multi"
  idEnterprise={idEnterprise}
  value={selectedMachines}
  onChange={setSelectedMachines}
/>
```

**Props padrao:** `mode`, `value`, `onChange`, `disabled?`, `clearable?`, `label?`, `placeholder?`

**TOP 10 mais usados:**

| Componente | Usos |
|------------|------|
| `MachineByEnterpriseSelect` | 28 |
| `EnterpriseSelect` | 27 |
| `MachineSelect` | 9 |
| `UserSelect` | 8 |
| `UnitSelect` | 5 |
| `SensorByMachineSelect` | 5 |
| `MaintenancePlanSelect` | 4 |
| `CustomerSelect` | 4 |
| `ConsumptionMachineSelect` | 4 |
| `ModelMachineSelect` | 4 |

## Hooks Globais (258 em `src/hooks/`)

**TOP 15 mais usados:**

| Hook | Usos | Descricao |
|------|------|-----------|
| `useEnterpriseFilter` | 90 | idEnterprise do filtro global |
| `useHasPermission` | 35 | Verifica permissoes do usuario |
| `useSidebar` | 7 | Estado da sidebar |
| `useSidebarToggle` | 7 | Toggle da sidebar |
| `useCMMSKPIs` | 6 | KPIs do CMMS |
| `useIsMobile` | 5 | Detecta dispositivo mobile |
| `useMachinesByEnterpriseSelect` | 5 | Maquinas por empresa |
| `useEnterprisesSelect` | 4 | Empresas para select |
| `useUsersApi` | 4 | CRUD usuarios |
| `usePartsApi` | 3 | CRUD pecas |
| `useModelMachinesApi` | 3 | CRUD modelos |
| `usePlatformsApi` | 3 | CRUD plataformas |
| `useAuth` | 3 | Sessao e login |
| `useSensorsApi` | 3 | CRUD sensores |
| `useMachinesApi` | 3 | CRUD maquinas |

**ANTES de criar um hook**, verifique se ja existe em `src/hooks/`!

## Componentes Obrigatorios

| Componente | Import | Uso |
|------------|--------|-----|
| `DefaultEmptyData` | `@/components/default-empty-data` | Dados vazios |
| `DefaultLoading` | `@/components/default-loading` | Loading |
| `DefaultFormLayout` | `@/components/default-form-layout` | Layout de formularios |

## Componentes de UI

- **Paginas**: Usar `Card`, `CardHeader`, `CardContent`, `CardFooter`
- **Componentes comuns**: NUNCA Card. Usar componentes `Item` de `@/components/ui/item`
- **Charts**: `getChartColor(index)` de `src/components/ui/chart`. NUNCA `mx-auto` no ChartContainer

### Componentes Item Disponiveis (OBRIGATORIO em componentes comuns)

Documentacao completa: [`docs/item-pattern.md`](./item-pattern.md)

| Componente | Substitui | Descricao |
|------------|-----------|----------|
| `Item` | `<div className="flex gap-4 p-4">` | Container principal com variantes (default, outline, muted) |
| `ItemGroup` | `<ul>` / `<div className="flex flex-col gap-2">` | Lista vertical de Items |
| `ItemContent` | `<div className="flex flex-col gap-1">` | Bloco de conteudo |
| `ItemTitle` | `<h1-6 className="font-...">` | Titulo padrao (font-mono, text-sm, font-medium) |
| `ItemDescription` | `<p className="text-muted-foreground text-sm">` | Descricao padrao (font-mono, text-muted-foreground) |
| `ItemHeader` | `<div className="flex justify-between">` | Cabecalho com justify-between |
| `ItemFooter` | `<div className="flex justify-between">` | Rodape com justify-between |
| `ItemActions` | `<div className="flex items-center gap-2">` | Area de acoes (botoes, badges) |
| `ItemMedia` | N/A | Area de icone/imagem com variantes |
| `ItemSeparator` | `<hr>` | Separador horizontal |

### Padrao de Tipagem (Referencia: `Item.tsx`)

```tsx
// Todos os componentes UI seguem este padrao:
function MyComponent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="my-component" className={cn('estilos-base', className)} {...props} />;
}
```

**Regras**: `React.ComponentProps<'element'>` para props, `cn()` para merge, `data-slot` para DOM, `cva` + `VariantProps` para variantes.
