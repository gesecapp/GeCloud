/**
 * Script para extrair rotas do routeTree.gen.ts
 *
 * Uso: npx tsx src/config/extractRoutes.ts
 *
 * Este script lê o arquivo routeTree.gen.ts e extrai as rotas privadas
 * para atualizar o MAIN_ROUTES em route.ts
 *
 * Estratégia: Extrai apenas a rota base de cada grupo e o primeiro nível de sub-rotas.
 * Exemplo: /permissions, /permissions/users, /permissions/roles
 * Ignora: /permissions/users/edit, /permissions/roles/$id
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTE_TREE_PATH = path.resolve(__dirname, '../routeTree.gen.ts');
const ROUTE_CONFIG_PATH = path.resolve(__dirname, './routes.ts');

/**
 * Extrai rotas do routeTree.gen.ts filtrando apenas rotas privadas:
 * - Apenas rotas com prefixo /_private/ na seção FileRoutesById
 * - Rota base do grupo (ex: /permissions)
 * - Primeiro nível de sub-rotas (ex: /permissions/users, /permissions/roles)
 * - Ignora segundo nível e rotas com parâmetros
 */
function extractRoutes(): string[] {
  const content = fs.readFileSync(ROUTE_TREE_PATH, 'utf-8');

  // Extrair rotas da seção FileRoutesById (contém o prefixo /_private/)
  const sectionMatch = content.match(/export interface FileRoutesById \{([\s\S]*?)\}/);
  if (!sectionMatch) {
    return [];
  }

  const section = sectionMatch[1];
  const regex = /'([^']+)':\s*typeof\s+\w+;/g;
  const allRoutes: string[] = [];

  for (const match of section.matchAll(regex)) {
    const routeId = match[1];

    // Apenas rotas privadas
    if (!routeId.startsWith('/_private/')) continue;

    // Extrair o path público (sem o prefixo /_private)
    const route = routeId.replace('/_private', '');

    // Ignorar rotas com parâmetros ($id, $slug, etc)
    if (/\$\w+/.test(route)) continue;

    allRoutes.push(route);
  }

  // Agrupar rotas por segmento base
  const routeGroups = new Map<string, string[]>();

  for (const route of allRoutes) {
    const segments = route.split('/').filter(Boolean);
    if (segments.length === 0) continue;

    const baseSegment = segments[0];

    if (!routeGroups.has(baseSegment)) {
      routeGroups.set(baseSegment, []);
    }
    routeGroups.get(baseSegment)?.push(route);
  }

  // Extrair rotas válidas para a sidebar
  // Usar Set para evitar duplicatas e normalizar removendo a barra final
  const uniqueRoutes = new Set<string>();

  for (const [baseSegment, routes] of routeGroups) {
    for (const route of routes) {
      const segments = route.split('/').filter(Boolean);

      // Incluir se for a rota base (index) do grupo - ex: /financial/ ou /schedule/
      // A rota base de um grupo sempre terá 1 segmento (o baseSegment)
      if (segments.length === 1 && segments[0] === baseSegment) {
        uniqueRoutes.add(route.replace(/\/$/, '') || '/');
        continue;
      }

      // Incluir se for primeiro nível de sub-rotas - ex: /permissions/users
      if (segments.length === 2) {
        uniqueRoutes.add(route.replace(/\/$/, ''));
      }
    }
  }

  return Array.from(uniqueRoutes).sort();
}

function updateRoutes(routes: string[]): void {
  let content = fs.readFileSync(ROUTE_CONFIG_PATH, 'utf-8');

  // Gerar o novo array de rotas
  const routesArray = routes.map((r) => `  '${r}'`).join(',\n');
  const newMainRoutes = `export const MAIN_ROUTES = [\n${routesArray},\n] as const;`;

  // Substituir o MAIN_ROUTES existente
  const regex = /export const MAIN_ROUTES = \[[\s\S]*?\] as const;/;

  if (regex.test(content)) {
    content = content.replace(regex, newMainRoutes);
  } else {
    content += `\n\n${newMainRoutes}\n`;
  }

  fs.writeFileSync(ROUTE_CONFIG_PATH, content);
}

const routes = extractRoutes();

if (routes.length > 0) {
  updateRoutes(routes);
  // biome-ignore lint: CLI script output
  console.log('✓ MAIN_ROUTES atualizado com', routes.length, 'rotas:');
  for (const r of routes) {
    // biome-ignore lint: CLI script output
    console.log('  -', r);
  }
} else {
  // biome-ignore lint: CLI script output
  console.log('✗ Nenhuma rota encontrada');
}
