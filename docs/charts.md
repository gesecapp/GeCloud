# Graficos (Recharts)

## Stack

O projeto usa **Recharts** como biblioteca de graficos, encapsulado pelo componente `ChartContainer` do ShadCN UI em `src/components/ui/chart.tsx`.

## Regras Criticas

- **NUNCA** use `mx-auto` no `ChartContainer` — quebra o `ResponsiveContainer` interno
- **SEMPRE** use `getChartColor(index)` de `@/components/ui/chart` para cores
- Os arquivos de exemplo em `src/components/graph-*.tsx` sao **modelos de referencia** — NAO devem ser importados diretamente
- Graficos ficam dentro de componentes comuns, portanto use `Item`, `ItemTitle`, `ItemDescription` — NUNCA `Card`

## Cores — `getChartColor(index)`

```tsx
import { getChartColor } from '@/components/ui/chart';

// Retorna uma CSS variable no formato: var(--color-{cor}-{tom})
getChartColor(0);  // var(--color-sky-400)
getChartColor(1);  // var(--color-blue-400)
getChartColor(3);  // var(--color-violet-400)
```

### Como funciona

A funcao cicla sobre 17 cores do Tailwind e incrementa o tom a cada ciclo completo:

```
Cores: sky, blue, indigo, violet, purple, fuchsia, pink, rose, red, orange, amber, yellow, lime, green, emerald, teal, cyan
Tons:  400 → 500 → 600 → ...
```

- `index 0-16` → tom 400 (sky-400, blue-400, ..., cyan-400)
- `index 17-33` → tom 500 (sky-500, blue-500, ...)
- E assim por diante

### Dica: Maior diferenciacao de cores

Para ter mais contraste visual entre as cores, **multiplique o index**:

```tsx
// Cores proximas (pouca diferenca)
getChartColor(0); // sky-400
getChartColor(1); // blue-400

// Cores mais distantes (mais contraste) — multiplique por 2 ou 3
getChartColor(0 * 3); // sky-400
getChartColor(1 * 3); // violet-400
getChartColor(2 * 3); // pink-400
```

## Componentes do ShadCN Chart

Todos exportados de `@/components/ui/chart`:

| Componente | Uso |
|---|---|
| `ChartContainer` | Wrapper obrigatorio. Recebe `config` (ChartConfig) e encapsula o `ResponsiveContainer` |
| `ChartConfig` | Type para o objeto de configuracao (label, color, theme) |
| `ChartTooltip` | Re-export do `Tooltip` do Recharts |
| `ChartTooltipContent` | Conteudo estilizado para tooltip |
| `ChartLegend` | Re-export do `Legend` do Recharts |
| `ChartLegendContent` | Conteudo estilizado para legenda |

## Estrutura Padrao de um Grafico

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  getChartColor,
} from '@/components/ui/chart';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: getChartColor(0),
  },
  mobile: {
    label: 'Mobile',
    color: getChartColor(3),
  },
} satisfies ChartConfig;

function MyChart() {
  return (
    <Item variant="outline">
      <ItemHeader className="flex-col items-center justify-center">
        <ItemTitle>Titulo do Grafico</ItemTitle>
        <ItemDescription>Descricao</ItemDescription>
      </ItemHeader>
      <ItemContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill={getChartColor(0)} radius={4} />
            <Bar dataKey="mobile" fill={getChartColor(3)} radius={4} />
          </BarChart>
        </ChartContainer>
      </ItemContent>
    </Item>
  );
}
```

## Tipos de Grafico Disponiveis (Modelos de Referencia)

Os modelos abaixo ficam em `src/components/` e servem como **referencia de implementacao**:

### Barras — `graph-bar-stacked.tsx`

Barras verticais com stacking e legenda. Usa `BarChart`, `Bar` com `stackId`.

```tsx
<Bar dataKey="desktop" stackId="a" fill={getChartColor(0)} radius={[0, 0, 4, 4]} />
<Bar dataKey="mobile" stackId="a" fill={getChartColor(1)} radius={[4, 4, 0, 0]} />
```

### Barras Horizontais — `graph-bar-horizontal.tsx`

Barras horizontais com cores individuais por item. Usa `layout="vertical"` no `BarChart`.

```tsx
// Cores individuais via fill nos dados
const chartData = [
  { browser: 'chrome', visitors: 275, fill: getChartColor(3) },
  { browser: 'safari', visitors: 200, fill: getChartColor(6) },
];
```

### Linhas — `graph-lines.tsx`

Multiplas linhas com grid e tooltip. Usa `LineChart`, `Line`.

```tsx
<Line dataKey="desktop" type="monotone" stroke={getChartColor(0)} strokeWidth={2} dot={false} />
<Line dataKey="mobile" type="monotone" stroke={getChartColor(1)} strokeWidth={2} dot={false} />
```

### Area — `graph-area.tsx`

Grafico de area com gradiente. Usa `AreaChart`, `Area` com `linearGradient` no `defs`.

```tsx
<defs>
  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
    <stop offset="95%" stopColor={color} stopOpacity={0} />
  </linearGradient>
</defs>
<Area dataKey={name} stroke={color} fill={`url(#${gradientId})`} fillOpacity={0.4} type="monotone" />
```

### Pizza (Donut) — `graph-pizza.tsx`

Grafico de pizza/donut com label central e legenda. Usa `PieChart`, `Pie` com `innerRadius`.

```tsx
// Cores via fill nos dados
const chartData = data.map((item, index) => ({
  ...item,
  fill: getChartColor(index),
}));

<Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
  <Label content={({ viewBox }) => { /* label central */ }} />
</Pie>
```

### Radial — `graph-radial.tsx`

Grafico radial com label central. Usa `RadialBarChart`, `RadialBar`.

```tsx
<RadialBarChart data={chartData} endAngle={100} innerRadius={80} outerRadius={140}>
  <PolarGrid gridType="circle" radialLines={false} stroke="none" />
  <RadialBar dataKey="visitors" background />
</RadialBarChart>
```

### Breakdown (Partes) — `graph-break-parts.tsx`

Barra horizontal segmentada mostrando distribuicao do total. Implementacao customizada sem Recharts, usando divs posicionadas.

```tsx
// Cores com multiplicador para mais contraste
const chartData = data.map((item, index) => ({
  ...item,
  color: getChartColor(index * 3),
}));
```

### Progresso — `graph-progress.tsx`

Barras de progresso simples mostrando uso vs limite. Usa o componente `Progress` do ShadCN.

```tsx
<Progress value={item.percentage} className="h-6" />
```

## Dicas de Tamanho e Layout

```tsx
// Para pizza/radial — usar aspect-square com max-height
<ChartContainer config={config} className="aspect-square max-h-80">

// Para area/linhas/barras — usar altura fixa ou aspect-video (padrao)
<ChartContainer config={config} className="h-full w-full">

// Altura fixa em container pai
<div className="h-16">
  <ChartContainer config={config} className="h-full w-full">
```

## ChartConfig — Padrao de Configuracao

O `chartConfig` mapeia as chaves dos dados para labels e cores:

```tsx
const chartConfig = {
  // Chave generica (sem cor, apenas label para tooltip)
  visitors: {
    label: 'Visitors',
  },
  // Chave com cor fixa
  chrome: {
    label: 'Chrome',
    color: getChartColor(0),
  },
  // Chave com tema (dark/light)
  safari: {
    label: 'Safari',
    theme: {
      light: getChartColor(3),
      dark: getChartColor(6),
    },
  },
} satisfies ChartConfig;
```
