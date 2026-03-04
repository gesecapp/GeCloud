# FrontEnd Architecture

Modern frontend application built with Vite, React 19, TanStack Router, TanStack Query, Zustand, and ShadCN UI.

## Stack Overview

| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| TanStack Router | File-based routing |
| TanStack Query | Server state management |
| Zustand | Client state management |
| ShadCN UI | Component library |
| Tailwind CSS 4 | Styling |
| Zod | Schema validation |
| React Hook Form | Form management |
| Biome | Linting & Formatting |
| Vite | Build tool |

## Project Structure

```
src/
├── components/
│   ├── ui/              # ShadCN components
│   ├── selects/         # Specialized Select components
│   └── *.tsx            # Pattern components (stats, forms, etc.)
├── hooks/               # Global reusable hooks
├── lib/
│   └── api/client.ts    # API client
├── config/
└── routes/
    ├── _public/         # Public routes (auth)
    └── _private/        # Authenticated routes
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm check

# Format code
pnpm format

# Lint code
pnpm lint

# Build for production
pnpm build
```

## Development Workflow

### Creating a New Route

1. Create a folder in `src/routes/_private/`
2. Add `index.tsx` for the main page
3. Add subfolders: `@components/`, `@hooks/`, `@interface/`
4. Use the Shell Pattern: `<Card>` → `<CardHeader>` → `<CardContent>`

### API Integration

1. Check if hook exists in `src/hooks/`
2. If not, create a new hook using TanStack Query
3. Use `api` from `@/lib/api/client`

### Forms

1. Define Zod schema in `@interface/`
2. Create form hook in `@hooks/` using React Hook Form
3. Use ShadCN form components

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Format code with Biome |
| `pnpm lint` | Lint and fix with Biome |

## VSCode Extensions

- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Biome** - Code formatting

## Component Patterns

| Pattern | Reference File |
|---------|---------------|
| Statistics Cards | `src/components/stats-03.tsx` |
| Resource Usage | `src/components/stats-09.tsx` |
| Forms | `src/components/form-advanced-7.tsx` |
| Empty State | `src/components/empty-standard-5.tsx` |
