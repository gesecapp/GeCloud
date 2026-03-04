'use client';

// extraido de https://www.shadcnblocks.com/block/product-specs1

import { Battery, Box, ChevronDown, Cpu, HardDrive, Monitor, Wifi } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Item, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Spec {
  label: string;
  value: string;
}

interface SpecCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  specs: Spec[];
}

const DEFAULT_CATEGORIES: SpecCategory[] = [
  {
    id: 'display',
    name: 'Display',
    icon: <Monitor className="size-4" />,
    specs: [
      { label: 'Screen Size', value: '6.7" Super Retina XDR' },
      { label: 'Resolution', value: '2796 x 1290 pixels' },
      { label: 'Pixel Density', value: '460 ppi' },
      { label: 'Refresh Rate', value: '1-120Hz ProMotion' },
      { label: 'Display Type', value: 'OLED, HDR' },
      { label: 'Peak Brightness', value: '2000 nits (outdoor)' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: <Cpu className="size-4" />,
    specs: [
      { label: 'Processor', value: 'A17 Pro chip' },
      { label: 'CPU Cores', value: '6-core (2 performance + 4 efficiency)' },
      { label: 'GPU', value: '6-core GPU' },
      { label: 'Neural Engine', value: '16-core' },
      { label: 'RAM', value: '8GB' },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: <HardDrive className="size-4" />,
    specs: [
      { label: 'Internal Storage', value: '256GB / 512GB / 1TB' },
      { label: 'Expandable', value: 'No' },
      { label: 'Cloud Storage', value: 'iCloud (5GB free)' },
    ],
  },
  {
    id: 'battery',
    name: 'Battery & Charging',
    icon: <Battery className="size-4" />,
    specs: [
      { label: 'Battery Capacity', value: '4422 mAh' },
      { label: 'Video Playback', value: 'Up to 29 hours' },
      { label: 'Streaming', value: 'Up to 25 hours' },
      { label: 'Wired Charging', value: '27W fast charging' },
      { label: 'Wireless Charging', value: '15W MagSafe, 7.5W Qi' },
      { label: 'Reverse Charging', value: 'No' },
    ],
  },
  {
    id: 'connectivity',
    name: 'Connectivity',
    icon: <Wifi className="size-4" />,
    specs: [
      { label: '5G', value: 'Yes (sub-6 GHz, mmWave)' },
      { label: 'Wi-Fi', value: 'Wi-Fi 6E (802.11ax)' },
      { label: 'Bluetooth', value: '5.3' },
      { label: 'NFC', value: 'Yes' },
      { label: 'USB', value: 'USB-C 3.0 (10Gb/s)' },
      { label: 'Satellite', value: 'Emergency SOS' },
    ],
  },
  {
    id: 'physical',
    name: 'Physical Specifications',
    icon: <Box className="size-4" />,
    specs: [
      { label: 'Height', value: '159.9 mm' },
      { label: 'Width', value: '76.7 mm' },
      { label: 'Depth', value: '8.25 mm' },
      { label: 'Weight', value: '221 g' },
      { label: 'Build', value: 'Titanium frame, ceramic shield' },
      { label: 'Water Resistance', value: 'IP68 (6m for 30 min)' },
    ],
  },
];

interface ProductSpecs1Props {
  categories?: SpecCategory[];
  title?: string;
  className?: string;
}

const ProductSpecs1 = ({ categories = DEFAULT_CATEGORIES, title = 'Technical Specifications', className }: ProductSpecs1Props) => {
  const [openCategories, setOpenCategories] = useState<string[]>(categories.map((c) => c.id));

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const expandAll = () => setOpenCategories(categories.map((c) => c.id));
  const collapseAll = () => setOpenCategories([]);

  return (
    <section className={cn('container max-w-4xl py-8', className)}>
      <ItemHeader className="mb-6">
        <ItemTitle className="text-xl md:text-2xl">{title}</ItemTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={expandAll} className="text-muted-foreground text-xs hover:text-foreground">
            {'expand.all'}
          </Button>
          <Separator orientation="vertical" className="h-4 self-center" />
          <Button variant="ghost" size="sm" onClick={collapseAll} className="text-muted-foreground text-xs hover:text-foreground">
            {'collapse.all'}
          </Button>
        </div>
      </ItemHeader>

      <div className="space-y-4">
        {categories.map((category) => (
          <Collapsible key={category.id} open={openCategories.includes(category.id)} onOpenChange={() => toggleCategory(category.id)}>
            <div className="rounded-lg border bg-card">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full items-center justify-between outline-none hover:bg-secondary focus-visible:ring-2">
                  <div className="flex items-center gap-3">
                    <ItemMedia variant="icon" className="rounded-lg bg-muted text-foreground">
                      {category.icon}
                    </ItemMedia>
                    <ItemTitle className="text-base">{category.name}</ItemTitle>
                  </div>
                  <ChevronDown className={cn('size-5 text-muted-foreground transition-transform duration-200', openCategories.includes(category.id) && 'rotate-180')} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ItemGroup>
                  {category.specs.map((spec, index) => (
                    <div key={`${spec.label}${category.id}`}>
                      <Item variant="default" size="sm" className="justify-between hover:bg-secondary">
                        <ItemDescription className="font-sans">{spec.label}</ItemDescription>
                        <ItemTitle className="font-mono">{spec.value}</ItemTitle>
                      </Item>
                      {index < category.specs.length - 1 && <ItemSeparator />}
                    </div>
                  ))}
                </ItemGroup>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </section>
  );
};

export { ProductSpecs1 };
