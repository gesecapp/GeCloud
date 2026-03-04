# Padroes de Pagina

> **⚠️ IMPORTANTE**: Em **componentes comuns** (nao paginas), NUNCA use tags HTML puras estilizadas. Use os componentes de [`Item.tsx`](../src/components/ui/item.tsx). Veja [`docs/item-pattern.md`](./item-pattern.md) para a documentacao completa.

## Estrutura Obrigatoria

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardAction>
      {/* Acoes: botoes, filtros */}
    </CardAction>
  </CardHeader>
  <CardContent>
    {/* Conteudo */}
  </CardContent>
  <CardFooter>
    {/* Paginacao */}
  </CardFooter>
</Card>
```

## Pagina de Listagem (Exemplo Completo)

Exemplo real de `src/routes/_private/register/geofences/index.tsx`:

```tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import DefaultEmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useEnterpriseFilter } from '@/hooks/use-enterprise-filter';
import { useGeofences, useGeofencesApi } from '@/hooks/use-geofences-api';
import { GEOFENCE_TYPES_CONFIG } from './@consts/geofence-types';

// 1. Schema de validacao dos search params
const searchSchema = z.object({
  page: z.number().optional().default(1),
  size: z.number().optional().default(20),
  search: z.string().optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

// 2. Definicao da rota
export const Route = createFileRoute('/_private/register/geofences/')({
  component: GeofenceListPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => searchSchema.parse(search),
});

// 3. Componente da pagina
function GeofenceListPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page, size, search } = useSearch({ from: '/_private/register/geofences/' });
  const { idEnterprise } = useEnterpriseFilter();

  // 4. Fetch de dados
  const { data, isLoading } = useGeofences({
    idEnterprise,
    page: page - 1,
    size,
    search,
  });
  const { deleteGeofence } = useGeofencesApi();

  const items = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / size);

  // 5. Handlers
  const handleDelete = async (id: string) => {
    try {
      await deleteGeofence.mutateAsync(id);
      toast.success('Excluído com sucesso');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  // 6. Render com estrutura obrigatoria
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geocercas</CardTitle>
        <CardAction>
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:max-w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar"
                className="pl-9"
                defaultValue={search || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        search: e.currentTarget.value || undefined,
                        page: 1,
                      }),
                    });
                  }
                }}
              />
            </div>
            <Button onClick={() => navigate({ to: '/register/geofences/add' })}>
              <Plus className="mr-2 size-4" />
              Adicionar
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : items.length === 0 ? (
          <DefaultEmptyData />
        ) : (
          <ItemGroup>
            {items.map((item) => (
              <Item
                key={item.id}
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate({ to: '/register/geofences/add', search: { id: item.id } })}
              >
                <div className="flex flex-1 items-center gap-4">
                  <ItemMedia variant="image">
                    <Flag className="size-5" />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="text-base">{item.description}</ItemTitle>
                    <ItemDescription>{item.code}</ItemDescription>
                  </ItemContent>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate({ to: '/register/geofences/add', search: { id: item.id } })}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>

      {totalCount > 0 && (
      <CardFooter>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Exibir</span>
            <Select value={String(size)} onValueChange={(val) => navigate({ search: (prev: SearchParams) => ({ ...prev, size: Number(val), page: 1 }) })}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>por página</span>
            <span className="ml-4 tabular-nums">Total: {totalCount}</span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && navigate({ search: (prev: SearchParams) => ({ ...prev, page: page - 1 }) })}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && navigate({ search: (prev: SearchParams) => ({ ...prev, page: page + 1 }) })}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
```

## Pagina de Formulario (Exemplo Completo)

Exemplo real de `src/routes/_private/register/geofences/add.tsx`:

```tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import DefaultLoading from '@/components/default-loading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';

import { useGeofence, useGeofencesApi } from '@/hooks/use-geofences-api';
import { GeofenceForm } from './@components/geofence-form';
import { useGeofenceForm } from './@hooks/use-geofence-form';

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute('/_private/register/geofences/add')({
  component: GeofenceAddPage,
  validateSearch: searchSchema,
});

function GeofenceAddPage() {
  const { id } = useSearch({ from: '/_private/register/geofences/add' });
  const { data: geofence, isLoading } = useGeofence(id);

  if (id && isLoading) {
    return (
      <Card>
        <CardHeader />
        <CardContent className="p-12">
          <DefaultLoading />
        </CardContent>
      </Card>
    );
  }

  return <GeofenceAddFormContent initialData={geofence} />;
}

function GeofenceAddFormContent({ initialData }: { initialData?: any }) {
  const navigate = useNavigate();
  const { deleteGeofence } = useGeofencesApi();

  const formData = useMemo(() => {
    if (!initialData) return undefined;
    return {
      id: initialData.id,
      idEnterprise: initialData.idEnterprise,
    };
  }, [initialData]);

  const { form, onSubmit, isPending } = useGeofenceForm(formData);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await deleteGeofence.mutateAsync(initialData.id);
      toast.success('Excluído com sucesso');
      navigate({ to: '/register/geofences' });
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <Card>
      <CardHeader />
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent>
            <GeofenceForm />
          </CardContent>
          <CardFooter>
            {initialData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={deleteGeofence.isPending || isPending}>
                    {deleteGeofence.isPending ? <Spinner className="mr-2 size-4" /> : <Trash2 className="mr-2 size-4" />}
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                      <Trash2 className="size-4" />
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" disabled={isPending} className="ml-auto min-w-[120px]">
              {isPending && <Spinner className="mr-2 size-4" />}
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
```
