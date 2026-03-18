'use client';

// extraido de https://rosencharts.com/

import { useMemo } from 'react';
import { getChartColor } from '@/components/ui/chart';
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const data = [
  {
    key: 'Utils',
    value: 17.1,
  },
  {
    key: 'Tech',
    value: 14.3,
  },
  {
    key: 'Energy',
    value: 27.1,
  },
  {
    key: 'Cyclicals',
    value: 42.5,
  },
  {
    key: 'Fuel',
    value: 12.7,
  },
];

const chartData = data.map((item, index) => ({
  ...item,
  color: getChartColor(index * 3),
}));

export function GraphBreakParts() {
  const barHeight = 60;
  const cornerRadius = 8;

  const { processedData } = useMemo(() => {
    const total = chartData.reduce((acc, d) => acc + d.value, 0);
    let cumulativeWidth = 0;

    const data = chartData.map((d, index) => {
      const barWidth = (d.value / total) * 100;
      const xPosition = cumulativeWidth;
      cumulativeWidth += barWidth;

      // Lógica de arredondamento de bordas
      let borderRadius = '0';
      if (index === 0) {
        borderRadius = `${cornerRadius}px 0 0 ${cornerRadius}px`;
      } else if (index === chartData.length - 1) {
        borderRadius = `0 ${cornerRadius}px ${cornerRadius}px 0`;
      }

      return {
        ...d,
        width: barWidth,
        left: xPosition,
        borderRadius,
      };
    });

    return { processedData: data };
  }, []);

  return (
    <Item variant="outline">
      <ItemHeader className="flex-col items-center">
        <ItemTitle>Gráfico de Composição</ItemTitle>
        <ItemDescription>Análise da distribuição em partes</ItemDescription>
      </ItemHeader>
      <ItemContent>
        <div className="relative w-full" style={{ height: `${barHeight}px` }}>
          <TooltipProvider>
            {processedData.map((d) => (
              <Tooltip key={d.key}>
                <TooltipTrigger asChild>
                  <div
                    className="group absolute cursor-help transition-all duration-300 hover:z-10 hover:brightness-110"
                    style={{
                      width: `${d.width}%`,
                      height: `${barHeight}px`,
                      left: `${d.left}%`,
                    }}
                  >
                    <div
                      className="h-full w-full border-white/5 border-y first:border-l last:border-r"
                      style={{
                        backgroundColor: d.color,
                        borderRadius: d.borderRadius,
                      }}
                    />

                    {d.width > 10 && (
                      <>
                        <div
                          className="pointer-events-none absolute w-full text-center font-semibold text-white"
                          style={{
                            top: `${barHeight / 5}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <ItemDescription className="font-semibold text-white">{d.key}</ItemDescription>
                        </div>
                        <div
                          className="pointer-events-none absolute w-full text-center text-white"
                          style={{
                            top: `${barHeight * 0.45}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <p className="font-bold font-mono text-lg text-white tabular-nums">{d.value}</p>
                        </div>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex min-w-32 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="size-3" style={{ backgroundColor: d.color }} />
                    <ItemTitle className="font-bold text-xs uppercase tracking-tight">{d.key}</ItemTitle>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <ItemTitle className="font-black text-lg tabular-nums">{d.value.toLocaleString()}</ItemTitle>
                    <ItemDescription className="font-normal text-xs uppercase">unidades</ItemDescription>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Legend Pattern consistent with Pizza Chart */}
        <ItemFooter className="flex-wrap items-center justify-center gap-4">
          {processedData.map((item) => (
            <div key={item.key} className="flex flex-col items-center">
              <div className="flex items-baseline gap-2">
                <div className="size-2" style={{ backgroundColor: item.color }} />
                <ItemTitle className="text-muted-foreground text-xs uppercase">{item.key}</ItemTitle>
              </div>
              <ItemTitle className="text-lg tabular-nums">{item.value}</ItemTitle>
            </div>
          ))}
        </ItemFooter>
      </ItemContent>
    </Item>
  );
}
