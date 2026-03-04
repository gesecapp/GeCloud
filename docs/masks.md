# Mascaras e Funcoes de Utilidade

As mascaras de entrada de dados devem ser padronizadas em todo o projeto para garantir consistencia na UI e nos dados enviados para a API.

## Localizacao
Todas as mascaras globais estao localizadas em: `src/lib/masks.ts`

## Mascaras Disponiveis

### 1. CPF (`applyCpfMask`)
Formata uma string numerica no padrao `000.000.000-00`.

```tsx
import { applyCpfMask } from '@/lib/masks';

// No componente
<Input 
  value={value} 
  onChange={(e) => setValue(applyCpfMask(e.target.value))} 
  maxLength={14} 
/>
```

### 2. Telefone (`applyPhoneMask`)
Formata telefones com 10 ou 11 digitos nos padroes `(00) 0000-0000` ou `(00) 00000-0000`.

```tsx
import { applyPhoneMask } from '@/lib/masks';

// No componente
<Input 
  value={value} 
  onChange={(e) => setValue(applyPhoneMask(e.target.value))} 
  maxLength={15} 
/>
```

### 3. Data (`applyDateMask`)
Formata uma string no padrao `DD/MM/AAAA`.

```tsx
import { applyDateMask } from '@/lib/masks';

// No componente
<Input 
  value={value} 
  onChange={(e) => setValue(applyDateMask(e.target.value))} 
  maxLength={10} 
/>
```

## Regras de Uso
1. **NUNCA** crie implementacoes locais de mascaras de CPF, Telefone ou Data dentro de componentes ou pastas `@utils` de rotas.
2. **SEMPRE** importe de `@/lib/masks`.
3. Se precisar de uma nova mascara global, adicione-a em `src/lib/masks.ts` seguindo o padrao de exportacao.
4. Para tratar os dados ANTES de enviar para a API (remover a mascara), utilize `.replace(/\D/g, '')`.

## Relacionados
- [Form Hooks](form-hooks.md) - Uso de mascaras em formularios com `react-hook-form`.
- [Schemas e Types](schemas-types.md) - Validacao de campos mascarados com Zod.
