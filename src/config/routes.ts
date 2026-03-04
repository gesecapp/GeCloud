import type { LucideIcon } from 'lucide-react';

// Mapeamento de icones por segmento de rota
export const ROUTE_ICONS: Record<string, LucideIcon> = {};

// Icones para sub-rotas especificas
export const SUB_ROUTE_ICONS: Record<string, LucideIcon> = {};

// Chaves para traducao de rotas
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'dashboard',
};

/**
 * Lista de rotas principais da aplicacao.
 */
export const MAIN_ROUTES = ['/access-user'] as const;

export type MainRoute = (typeof MAIN_ROUTES)[number];
