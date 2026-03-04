'use client';

import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { cn } from '@/lib/utils';
import type { Route } from './nav-main';
import { FavoritesSwitcher } from './switch-favorites';

export function FooterNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const { setMenuOpen } = useSidebarToggle();
  const isCollapsed = state === 'collapsed';
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const hasSubRoutes = !!route.subs?.length;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <DropdownMenu
                onOpenChange={(open) => {
                  setOpenDropdown(open ? route.id : null);
                  setMenuOpen(open);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="default"
                    className={cn(
                      'transition-all',
                      openDropdown === route.id ? 'bg-sidebar-muted text-foreground' : 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground',
                      isCollapsed ? 'justify-center' : 'justify-start',
                    )}
                  >
                    {route.icon}
                    {!isCollapsed && <span className="ml-2 flex-1 truncate text-left">{route.title}</span>}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="min-w-48">
                  {route.subs?.map((sub) => (
                    <DropdownMenuItem key={sub.link} asChild>
                      <Link to={sub.link} className="flex items-center gap-2">
                        {sub.icon}
                        <span>{sub.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton
                size="default"
                className={cn('text-muted-foreground transition-all hover:bg-sidebar-muted hover:text-foreground', isCollapsed ? 'justify-center' : 'justify-start')}
                asChild
              >
                <Link to={route.link}>
                  {route.icon}
                  {!isCollapsed && <span className="ml-2 flex-1 truncate text-left">{route.title}</span>}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
      <FavoritesSwitcher />
    </SidebarMenu>
  );
}
