'use client';

// extraido de https://rosencharts.com/

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, getChartColor } from '@/components/ui/chart';
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item';

export const description = 'A donut chart with text and legend';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 287 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 190 },
];

const chartData = data.map((item, index) => ({
  ...item,
  fill: getChartColor(index),
}));

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: getChartColor(0),
  },
  safari: {
    label: 'Safari',
    color: getChartColor(3),
  },
  firefox: {
    label: 'Firefox',
    color: getChartColor(6),
  },
  edge: {
    label: 'Edge',
    color: getChartColor(9),
  },
  other: {
    label: 'Other',
    color: getChartColor(12),
  },
} satisfies ChartConfig;

export function GraphPizza() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Item variant="outline">
      <ItemHeader className="flex-col items-center justify-center">
        <ItemTitle>Pie Chart - Donut with Text</ItemTitle>
        <ItemDescription>Description</ItemDescription>
      </ItemHeader>
      <ItemContent>
        {/* IMPORTANT: Do not use 'mx-auto' in ChartContainer className as it breaks the ResponsiveContainer layout */}
        <ChartContainer config={chartConfig} className="aspect-square max-h-80">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-bold text-3xl">
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="browser" />} className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" />
          </PieChart>
        </ChartContainer>
      </ItemContent>
    </Item>
  );
}
