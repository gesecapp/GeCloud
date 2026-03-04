'use client';

import { useMemo } from 'react';
import { FooterNavigation } from '@/components/sidebar/nav-footer';
import AppNavigation, { type Route } from '@/components/sidebar/nav-main';
import { EnterpriseSwitcher } from '@/components/sidebar/switch-enterprise';
import { SidebarSwitcher } from '@/components/sidebar/switch-sidebar';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
import { buildSidebarRoutes, type SidebarRoute } from '@/config/sidebarRoutes';
import { cn } from '@/lib/utils';

const convertToNavRoutes = (routes: SidebarRoute[]): Route[] => {
  return routes.map((route) => {
    const title = route.labelKey;

    return {
      id: route.id,
      title,
      icon: route.icon ? <route.icon className="size-4" /> : undefined,
      link: route.path,
      subs: route.children?.map((child) => ({
        title: child.labelKey,
        link: child.path,
        icon: child.icon ? <child.icon className="size-4" /> : undefined,
      })),
    };
  });
};

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navRoutes = useMemo(() => {
    const sidebarRoutes = buildSidebarRoutes();
    return convertToNavRoutes(sidebarRoutes);
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon" className="transition-all duration-300 ease-in-out">
      <SidebarHeader className="items-center px-2 pt-3">
        <div className={cn('flex items-center')}>
          <div className={cn('flex items-center', isCollapsed && 'flex-col')}>
            <SidebarSwitcher />
          </div>
          {!isCollapsed && (
            <div className="flex items-center">
              <ThemeSwitcher />
              <EnterpriseSwitcher />
            </div>
          )}
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent className="px-2 py-1 text-muted-foreground">
        <AppNavigation routes={navRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3">
        <FooterNavigation routes={[]} />
      </SidebarFooter>
    </Sidebar>
  );
}
