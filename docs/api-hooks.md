# Padrao de Hook de API (TanStack Query)

Arquivo: `src/hooks/use-{feature}-api.ts`

## Estrutura Completa

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Geofence, GeofenceFormData } from '@/routes/_private/register/geofences/@interface/geofence.interface';

// 1. Query Keys centralizadas
export const geofencesKeys = {
  all: ['geofences'] as const,
  lists: () => [...geofencesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...geofencesKeys.lists(), filters] as const,
  details: () => [...geofencesKeys.all, 'detail'] as const,
  detail: (id: string) => [...geofencesKeys.details(), id] as const,
};

// 2. Funcoes de API (privadas)
async function fetchGeofences(params?: Record<string, unknown>): Promise<{ data: Geofence[]; totalCount: number }> {
  const response = await api.get<{ data: Geofence[]; pageInfo: [{ count: number }] }>('/geofence/list', { params });
  return {
    data: response.data.data,
    totalCount: response.data.pageInfo?.[0]?.count || 0,
  };
}

async function fetchGeofence(id: string): Promise<Geofence> {
  const response = await api.get<Geofence>(`/geofence/find?id=${id}`);
  return response.data;
}

async function createGeofence(data: GeofenceFormData): Promise<Geofence> {
  const response = await api.post<Geofence>('/geofence', data);
  return response.data;
}

async function updateGeofence(data: GeofenceFormData & { id: string }): Promise<Geofence> {
  const response = await api.post<Geofence>('/geofence', data);
  return response.data;
}

async function deleteGeofence(id: string): Promise<void> {
  await api.delete(`/geofence?id=${id}`);
}

// 3. Hook de Query - Listagem
export function useGeofences(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: geofencesKeys.list(params),
    queryFn: () => fetchGeofences(params),
  });
}

// 4. Hook de Query - Detalhe
export function useGeofence(id?: string) {
  return useQuery({
    queryKey: geofencesKeys.detail(id ?? ''),
    queryFn: () => fetchGeofence(id ?? ''),
    enabled: !!id,
  });
}

// 5. Hook de Mutations
export function useGeofencesApi() {
  const queryClient = useQueryClient();

  const createGeofenceMutation = useMutation({
    mutationFn: createGeofence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geofencesKeys.lists() });
    },
  });

  const updateGeofenceMutation = useMutation({
    mutationFn: updateGeofence,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: geofencesKeys.lists() });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: geofencesKeys.detail(data.id) });
      }
    },
  });

  const deleteGeofenceMutation = useMutation({
    mutationFn: deleteGeofence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geofencesKeys.lists() });
    },
  });

  return {
    createGeofence: createGeofenceMutation,
    updateGeofence: updateGeofenceMutation,
    deleteGeofence: deleteGeofenceMutation,
  };
}
```

## Resumo do Padrao

1. **Query Keys**: Objeto centralizado com hierarquia (`all > lists > list > details > detail`)
2. **Funcoes de API**: Funcoes privadas async que usam `api` client
3. **useQuery**: Hooks separados para listagem e detalhe, com `enabled` para queries condicionais
4. **useMutation**: Hook agrupado retornando todas as mutations com `invalidateQueries` no `onSuccess`

---

## Padroes Avancados

### Lista Paginada com `placeholderData`

Use quando a pagina anterior deve permanecer visivel enquanto a nova carrega:

```tsx
import { keepPreviousData } from '@tanstack/react-query';

export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  paginated: (params: SearchParams) => [...featureKeys.lists(), 'paginated', params] as const,
};

export function useFeaturePaginated(params: SearchParams) {
  return useQuery({
    queryKey: featureKeys.paginated(params),
    queryFn: () => fetchFeatures(params),
    placeholderData: keepPreviousData,
  });
}
```

### Select Hook (para combobox/select em formularios)

Todo hook que alimenta selects deve exportar uma versao `Select` e um mapper:

```tsx
// Hook otimizado para select
export function useFeatureSelect(idEnterprise?: string) {
  return useQuery({
    queryKey: [...featureKeys.all, 'select', idEnterprise],
    queryFn: async () => {
      const response = await api.get<Feature[]>('/feature', {
        params: { idEnterprise },
      });
      return response.data;
    },
    enabled: !!idEnterprise,
  });
}

// Mapper: transforma dados para o formato { value, label, data }
export function mapFeaturesToOptions(items: Feature[]) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      value: item.id,
      label: item.name,
      data: item,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
```

### Enterprise Filtering

A maioria dos hooks precisa do `idEnterprise` do store global:

```tsx
import { useEnterpriseFilter } from '@/hooks/use-enterprise-filter';

async function fetchUsers(params?: Record<string, unknown>) {
  const idEnterprise =
    (params?.idEnterprise as string) ||
    useEnterpriseFilter.getState().idEnterprise ||
    '';
  const queryParams = { ...params, idEnterprise };
  const response = await api.get('/user/list', { params: queryParams });
  return response.data;
}
```

### Upload de Arquivo (FormData)

```tsx
const uploadImage = useMutation({
  mutationFn: ({ id, file }: { id: string; file: File }) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/upload/feature?id=${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: featureKeys.all });
  },
});
```

### Download de Arquivo (Blob / CSV / Excel)

```tsx
const exportFeature = useMutation({
  mutationFn: async (params: ExportParams) => {
    const response = await api.get('/feature/export', {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  onSuccess: (data) => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
});
```

### Ativacao / Desativacao (toggle de status)

```tsx
const activateFeature = useMutation({
  mutationFn: (id: string) => api.patch(`/feature/active?id=${id}`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: featureKeys.all });
  },
});

const deactivateFeature = useMutation({
  mutationFn: (id: string) => api.patch(`/feature/deactive?id=${id}`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: featureKeys.all });
  },
});
```

### URLSearchParams para arrays

Quando o backend espera parametros repetidos (ex: `ids[]=1&ids[]=2`):

```tsx
async function fetchByIds(ids: string[], idEnterprise: string) {
  const params = new URLSearchParams();
  params.append('idEnterprise', idEnterprise);
  ids.forEach((id) => params.append('ids[]', id));
  const response = await api.get(`/feature/list?${params.toString()}`);
  return response.data;
}
```

---

## Estruturas de Resposta Comuns

### Lista Paginada

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pageInfo: Array<{
    count: number;
    page?: number;
    size?: number;
  }>;
}

// Extrair na funcao de fetch:
return {
  data: response.data.data,
  totalCount: response.data.pageInfo?.[0]?.count || 0,
};
```

### Select Option

```typescript
interface SelectOption<T = unknown> {
  value: string;
  label: string;
  data?: T;
}
```

### Search Params padrao

```typescript
interface SearchParams {
  page?: number;
  size?: number;
  search?: string;
  idEnterprise?: string;
}
```

---

## Hooks de Estado Global (Zustand)

Para estado global persistido, use Zustand com middleware `persist`. Nao use `localStorage.setItem` diretamente.

Consulte `docs/state-management.md` para o padrao completo.

```tsx
// Exemplo: acessar store fora de componente (em funcoes de API)
import { useEnterpriseFilter } from '@/hooks/use-enterprise-filter';
const idEnterprise = useEnterpriseFilter.getState().idEnterprise;

// Exemplo: usar store em componente
const { idEnterprise, setIdEnterprise } = useEnterpriseFilter();

// Exemplo: usar store de auth em componente
const { isAuthenticated, user } = useAuth();
```

**Stores globais disponíveis:**

| Hook | Proposito |
|------|-----------|
| `useAuth` | Token JWT, usuario, tipo de login, estado de bloqueio |
| `useEnterpriseFilter` | Empresa selecionada globalmente (`idEnterprise`) |
| `usePermissions` | Cache de permissoes do usuario |
| `useFavorites` | Links favoritos do usuario |
| `useSidebar` | Estado expandido/colapsado do sidebar |
