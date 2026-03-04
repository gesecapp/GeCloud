import type { LucideIcon } from 'lucide-react';
import { MAIN_ROUTES, ROUTE_ICONS, ROUTE_LABELS, SUB_ROUTE_ICONS } from './routes';

export interface SidebarRoute {
  id: string;
  path: string;
  labelKey: string;
  icon?: LucideIcon;
  children?: SidebarRoute[];
}

// Agrupar rotas por primeiro segmento
function groupRoutesBySection(paths: readonly string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const path of paths) {
    const segments = path.split('/').filter(Boolean);
    const section = segments[0];

    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(path);
  }

  return groups;
}

// Construir estrutura hierárquica para sidebar
export function buildSidebarRoutes(): SidebarRoute[] {
  const grouped = groupRoutesBySection(MAIN_ROUTES);

  const sidebarRoutes: SidebarRoute[] = [];

  for (const [section, paths] of Object.entries(grouped)) {
    // Se só tem uma rota no grupo, adicionar diretamente
    if (paths.length === 1 && paths[0] === `/${section}`) {
      sidebarRoutes.push({
        id: section,
        path: paths[0],
        labelKey: ROUTE_LABELS[section] || section,
        icon: ROUTE_ICONS[section],
      });
      continue;
    }

    // Criar grupo com filhos
    const children: SidebarRoute[] = [];

    for (const path of paths) {
      const segments = path.split('/').filter(Boolean);
      // Pegar o segundo segmento como nome do filho
      const childName = segments[1] || section;

      // Evitar duplicatas
      if (!children.find((c) => c.path === path)) {
        children.push({
          id: `${section}${childName}`,
          path,
          labelKey: ROUTE_LABELS[childName] || childName,
          icon: SUB_ROUTE_ICONS[childName],
        });
      }
    }

    sidebarRoutes.push({
      id: section,
      path: `/${section}`,
      labelKey: ROUTE_LABELS[section] || section,
      icon: ROUTE_ICONS[section],
      children: children.length > 0 ? children : undefined,
    });
  }

  return sidebarRoutes;
}
