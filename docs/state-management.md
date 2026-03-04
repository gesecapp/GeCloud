# State Management

## Quando Usar Cada Tipo

| Tipo | Ferramenta | Exemplo |
|------|------------|---------|
| Server State | TanStack Query | Lista de usuarios, detalhes |
| Form State | react-hook-form | Campos de formulario |
| UI Local | useState | Modal aberto, tab ativa |
| UI Global | Zustand | Sidebar, tema, filtro global |
| Persistente | Zustand + persist | Token, preferencias |

## Zustand com Persist

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EnterpriseFilterStore {
  idEnterprise: string;
  setIdEnterprise: (id: string) => void;
}

export const useEnterpriseFilter = create<EnterpriseFilterStore>()(
  persist(
    (set) => ({
      idEnterprise: '',
      setIdEnterprise: (id) => set({ idEnterprise: id }),
    }),
    {
      name: 'idEnterprise', // chave no localStorage
    },
  ),
);
```

**IMPORTANTE**: NUNCA use `localStorage.setItem` diretamente. Sempre use Zustand com `persist`.

## Derivar Estado (Nao Duplicar)

```tsx
// ERRADO - Estado duplicado
const [users, setUsers] = useState<User[]>([]);
const [activeUsers, setActiveUsers] = useState<User[]>([]);

useEffect(() => {
  setActiveUsers(users.filter(u => u.active));
}, [users]);

// CORRETO - Estado derivado
const [users, setUsers] = useState<User[]>([]);
const activeUsers = useMemo(() => users.filter(u => u.active), [users]);
```

## Anti-Patterns

- NUNCA `localStorage.setItem` direto
- NUNCA `useEffect` para sincronizar estado derivado
- NUNCA `fetch` em `useEffect` (usar TanStack Query)
- NUNCA estado desnecessario (derivar inline ou com useMemo)
