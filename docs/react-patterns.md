# Padroes React

## Declaracao de Componentes

**SEMPRE** use `function` declarations:

```tsx
// CORRETO
function UserCard({ user }: UserCardProps) {
  return (
    <Item>
      <ItemTitle>{user.name}</ItemTitle>
      <ItemDescription>{user.email}</ItemDescription>
    </Item>
  );
}

// EVITAR
const UserCard = ({ user }: UserCardProps) => { ... };
const UserCard: React.FC<UserCardProps> = ({ user }) => { ... };
```

## Estrutura Interna do Componente

Ordem recomendada:

```tsx
function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. Hooks de contexto/router
  const navigate = Route.useNavigate();

  // 2. Hooks de estado global (Zustand)
  const { idEnterprise } = useEnterpriseFilter();

  // 3. Hooks de dados (TanStack Query)
  const { data, isLoading } = useUsers();

  // 4. Hooks de estado local
  const [isOpen, setIsOpen] = useState(false);

  // 5. Valores derivados / useMemo
  const filteredUsers = useMemo(() => data?.filter(u => u.active), [data]);

  // 6. Callbacks / useCallback
  const handleSelect = useCallback((user: User) => {
    onSelect?.(user);
    setIsOpen(false);
  }, [onSelect]);

  // 7. Effects (usar com moderacao)
  useEffect(() => { ... }, []);

  // 8. Early returns
  if (isLoading) return <DefaultLoading />;
  if (!data?.length) return <DefaultEmptyData />;

  // 9. Render
  return ( ... );
}
```

## Early Returns

Ordem: loading -> error -> empty -> success

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <DefaultLoading />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <DefaultEmptyData />;

  return (
    <Card>
      <CardContent>{user.name}</CardContent>
    </Card>
  );
}
```

## Conditional Rendering

```tsx
// Simples - &&
{hasPermission && <AdminPanel />}

// If-else - ternario
{isLoading ? <Spinner /> : <Content />}

// Multiplas condicoes - config object
function StatusBadge({ status }: { status: Status }) {
  const config = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'secondary' },
    pending: { label: 'Pendente', variant: 'warning' },
  }[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

## Conditional Classes

```tsx
import { cn } from '@/lib/utils';

className={cn(
  'rounded-md font-medium',
  variant === 'primary' && 'bg-primary text-white',
  variant === 'outline' && 'border border-input bg-transparent',
  className
)}
```

## Padrao Item — PROIBIDO Tags HTML Puras Estilizadas

Veja documentacao completa em [`docs/item-pattern.md`](../docs/item-pattern.md).

**Regra**: Toda tipografia e layout composicional em componentes comuns deve usar os componentes do `Item`.

```tsx
// ❌ EVITAR: Tags HTML puras com classes Tailwind
<div className="flex flex-col gap-4">
  <h3 className="font-semibold text-lg">{title}</h3>
  <p className="text-muted-foreground text-sm">{description}</p>
</div>

// ✅ CORRETO: Componentes Item
<ItemContent>
  <ItemTitle className="text-base">{title}</ItemTitle>
  <ItemDescription>{description}</ItemDescription>
</ItemContent>
```

| EVITE | USE |
|-------|-----|
| `<h1-6 className="font-...">` | `<ItemTitle>` |
| `<p className="text-muted-foreground">` | `<ItemDescription>` |
| `<div className="flex flex-col gap-*">` (lista) | `<ItemGroup>` ou `<ItemContent>` |
| `<div className="flex items-center justify-between">` | `<ItemHeader>` ou `<ItemFooter>` |
| `<div className="flex items-center gap-2">` (acoes) | `<ItemActions>` |

## Padrao de Tipagem de Componentes UI

Todo componente em `src/components/ui/` segue o padrao do `Item.tsx`:

```tsx
// 1. Props baseadas em React.ComponentProps
function MyComponent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="my-component"     // 2. data-slot para identificacao
      className={cn('estilos-base', className)}  // 3. cn() com className no final
      {...props}                    // 4. Spread de props
    />
  );
}

// Com variantes
function MyVariantComponent({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof myVariants>) {
  return <div className={cn(myVariants({ variant, className }))} {...props} />;
}
```

## Anti-Patterns

### Tags HTML puras estilizadas -> usar componentes Item
```tsx
// EVITAR: <h3 className="font-semibold text-lg">{title}</h3>
// CORRETO: <ItemTitle className="text-base">{title}</ItemTitle>

// EVITAR: <p className="text-muted-foreground text-sm">{desc}</p>
// CORRETO: <ItemDescription>{desc}</ItemDescription>

// EVITAR: <div className="flex items-center gap-2">...botoes...</div>
// CORRETO: <ItemActions>...botoes...</ItemActions>
```

### Props Drilling -> usar Zustand ou Context
```tsx
// EVITAR: passar user por 4 niveis
// CORRETO: const { user } = useAuth();
```

### useEffect para estado derivado -> usar useMemo
```tsx
// EVITAR: useEffect(() => setTotal(...), [items])
// CORRETO: const total = useMemo(() => ..., [items])
```

### Fetch em useEffect -> usar TanStack Query
```tsx
// EVITAR: useEffect(() => fetch(...), [])
// CORRETO: const { data } = useUsers()
```
