# Padrao Item — Eliminação de Tags HTML Puras Estilizadas

> **REGRA FUNDAMENTAL**: Toda estrutura de layout e tipografia em componentes comuns **deve** utilizar os componentes do `Item` (`src/components/ui/item.tsx`). Tags HTML puras com classes Tailwind (como `<div className="flex flex-col items-center gap-4">`, `<h3 className="font-semibold text-lg">`, `<p className="text-muted-foreground text-sm">`) são **PROIBIDAS** em componentes comuns.

---

## Por que esse padrao existe?

1. **Consistencia Visual**: Todos os textos, titulos e descricoes seguem a mesma tipografia (font-mono, line-height, espaçamento).
2. **Manutenibilidade**: Alterações de design propagam-se automaticamente por todo o projeto ao mudar a definição em `item.tsx`.
3. **Legibilidade do Codigo**: `<ItemTitle>` é autoexplicativo; `<h3 className="font-semibold text-lg">` não.
4. **Evita Drift Visual**: Diferentes devs criam variações ligeiramente diferentes de estilos — o componente padroniza.

---

## Componentes Disponíveis

```tsx
import {
  Item,           // Container principal (substitui <li> ou <div> com flex + gap + padding)
  ItemGroup,      // Lista de Items (substitui <ul> / <div className="flex flex-col gap-2">)
  ItemContent,    // Bloco de conteudo (substitui <div className="flex flex-1 flex-col gap-1">)
  ItemTitle,      // Titulo padrao (substitui <h1-6 className="font-...">)
  ItemDescription,// Descricao padrao (substitui <p className="text-muted-foreground text-sm">)
  ItemHeader,     // Cabecalho (substitui <div className="flex justify-between items-center">)
  ItemFooter,     // Rodape (substitui <div className="flex justify-between items-center">)
  ItemActions,    // Area de acoes (substitui <div className="flex items-center gap-2">)
  ItemMedia,      // Area de icone ou imagem
  ItemSeparator,  // Separador horizontal
} from '@/components/ui/item';
```

---

## Tabela de Substituicao: HTML Puro → Item

| ❌ EVITE (Tags HTML com Tailwind)                                           | ✅ USE (Componente Item)                        | Motivo                                                                 |
|----------------------------------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------|
| `<div className="flex flex-col gap-4">`                                    | `<ItemGroup>`                                  | Layout de lista vertical                                               |
| `<div className="flex flex-col gap-1">`                                    | `<ItemContent>`                                | Bloco de conteudo de um item                                           |
| `<h1-6 className="font-semibold text-lg">`                                | `<ItemTitle>`                                  | Tipografia de titulo padronizada (font-mono, text-sm, font-medium)     |
| `<p className="text-muted-foreground text-sm">`                            | `<ItemDescription>`                            | Tipografia de descricao padronizada (font-mono, text-muted-foreground) |
| `<div className="flex items-center justify-between">`                      | `<ItemHeader>` ou `<ItemFooter>`               | Cabecalho/rodape com justify-between                                   |
| `<div className="flex items-center gap-2">` (botoes/acoes)                 | `<ItemActions>`                                | Area de acoes                                                          |
| `<div className="flex flex-wrap items-end gap-4 p-4">` (container)        | `<Item>`                                       | Container principal com variantes e tamanhos                           |
| `<span className="text-xs text-muted-foreground">`                        | `<ItemDescription className="text-xs">`        | Extensao do componente via className                                   |

---

## Tipagem Padrao (Padrao de Props do Item)

Todo subcomponente do Item segue o **mesmo padrao de tipagem**, baseado em `React.ComponentProps`:

```tsx
// Padrao: extends React.ComponentProps do elemento base
function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="item-title" className={cn('...estilos-base...', className)} {...props} />;
}
```

**Regras de tipagem:**
1. **Sempre** use `React.ComponentProps<'elemento'>` como base da tipagem.
2. **Sempre** destrutere `className` e propague `...props` para manter extensibilidade.
3. **Sempre** use `cn()` para merge de classes, com estilos-base primeiro e `className` por ultimo.
4. **Sempre** inclua `data-slot="nome-do-slot"` para identificacao no DOM.
5. Para variantes, use `cva` + `VariantProps<typeof variants>` (como `Item` e `ItemMedia`).

### Exemplo de tipo com variantes

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const myVariants = cva('base-classes', {
  variants: {
    variant: { default: '...', outline: '...' },
    size: { default: '...', sm: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

function MyComponent({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof myVariants>) {
  return <div className={cn(myVariants({ variant, size, className }))} {...props} />;
}
```

---

## Exemplos Praticos

### ❌ ERRADO: Tags HTML puras estilizadas

```tsx
function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <Button size="sm">Editar</Button>
      </div>
      <p className="text-muted-foreground text-sm">{user.email}</p>
    </div>
  );
}
```

### ✅ CORRETO: Usando componentes Item

```tsx
function UserProfile({ user }: UserProfileProps) {
  return (
    <Item>
      <ItemHeader>
        <ItemTitle>{user.name}</ItemTitle>
        <ItemActions>
          <Button size="sm">Editar</Button>
        </ItemActions>
      </ItemHeader>
      <ItemContent>
        <ItemDescription>{user.email}</ItemDescription>
      </ItemContent>
    </Item>
  );
}
```

### ❌ ERRADO: Lista com divs e h3/p

```tsx
function SectionHeader({ title, description }: SectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
```

### ✅ CORRETO: Usando ItemContent

```tsx
function SectionHeader({ title, description }: SectionProps) {
  return (
    <ItemContent>
      <ItemTitle className="text-base">{title}</ItemTitle>
      <ItemDescription>{description}</ItemDescription>
    </ItemContent>
  );
}
```

### ❌ ERRADO: Tipografia com span/p inline

```tsx
{items.map((item) => (
  <div key={item.id} className="flex items-center justify-between border-b py-3">
    <div>
      <span className="font-medium text-sm">{item.name}</span>
      <p className="text-muted-foreground text-xs">{item.description}</p>
    </div>
    <div className="flex items-center gap-2">
      <Badge>{item.status}</Badge>
      <Button variant="ghost" size="icon"><Trash2 /></Button>
    </div>
  </div>
))}
```

### ✅ CORRETO: Usando composição de Item

```tsx
<ItemGroup>
  {items.map((item) => (
    <Item key={item.id} variant="outline">
      <ItemContent>
        <ItemTitle>{item.name}</ItemTitle>
        <ItemDescription>{item.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge>{item.status}</Badge>
        <Button variant="ghost" size="icon"><Trash2 /></Button>
      </ItemActions>
    </Item>
  ))}
</ItemGroup>
```

---

## Quando PODE usar tags HTML puras?

Tags HTML puras estilizadas são aceitáveis **apenas** nos seguintes cenários:

1. **Dentro de `src/components/ui/`**: São os próprios componentes utilitários do design system.
2. **Layouts de pagina raiz**: Containers de posicionamento de pagina (ex: centralização fullscreen).
3. **Grid layouts**: `<div className="grid grid-cols-2 gap-4">` para grids de formulários.
4. **Wrappers de formulário**: `<form>`, `<label>`, `<input type="file" hidden>`.
5. **Imagens**: `<img>`, `<video>`, `<svg>` — elementos que não têm equivalente no design system.

**Regra de ouro**: Se o elemento carrega **texto visível** (`font-`, `text-`) ou **layout composicional** (`flex-col`, `flex items-center gap-*`), use o componente Item correspondente.

---

## Variantes do Item

```tsx
// Sem borda (padrao)
<Item variant="default">...</Item>

// Com borda
<Item variant="outline">...</Item>

// Fundo acentuado
<Item variant="muted">...</Item>

// Tamanho compacto
<Item size="sm">...</Item>

// Polimorfismo com asChild
<Item asChild>
  <Link to="/somewhere">...</Link>
</Item>
```

---

## Resumo

| Regra | Descricao |
|-------|-----------|
| **NUNCA** | Tags HTML puras com classes de tipografia (`font-*`, `text-*`) em componentes comuns |
| **NUNCA** | `<div className="flex flex-col gap-*">` quando `<ItemGroup>` ou `<ItemContent>` cobrem o caso |
| **NUNCA** | `<h1-6>` com classes — usar `<ItemTitle>` |
| **NUNCA** | `<p>` / `<span>` com `text-muted-foreground` — usar `<ItemDescription>` |
| **SEMPRE** | Tipagem com `React.ComponentProps<'element'>` |
| **SEMPRE** | `cn()` para merge de classes |
| **SEMPRE** | `data-slot` para identificação no DOM |
| **SEMPRE** | `cva` + `VariantProps` para variantes |
