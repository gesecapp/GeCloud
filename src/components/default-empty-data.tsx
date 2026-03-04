'use client';

import { Bird, CloudOff, Database, FileSearch, Ghost, Inbox, PackageOpen, Search, Telescope } from 'lucide-react';
import * as React from 'react';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

const ICONS = [FileSearch, Search, Database, Inbox, CloudOff, Ghost, Telescope, Bird, PackageOpen];

const EmptyData = () => {
  const Icon = React.useMemo(() => {
    return ICONS[Math.floor(Math.random() * ICONS.length)];
  }, []);

  return (
    <Empty className="border-2 bg-accent/30">
      <EmptyHeader>
        <Icon className="zoom-in-50 size-6 animate-in text-muted-foreground duration-500" />
        <EmptyTitle>{'not.found'}</EmptyTitle>
        <EmptyDescription className="font-mono leading-tight">{'not.found.description'}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default EmptyData;
