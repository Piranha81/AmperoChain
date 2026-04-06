# AGENTS.md — audio-chain-editor

## Project Overview

React + TypeScript frontend app built with Vite. An audio effects chain editor that renders two rows of 6 slots each (12 total) for arranging audio effect blocks as hexagonal nodes connected by SVG paths. State persists in `localStorage`.

**Stack:** React 18, TypeScript 5.2 (strict), Vite 5, `@xyflow/react` 12, plain CSS with custom properties.

## Directory Structure

```
src/
  App.tsx                # Main app: state management, export/import, localStorage
  main.tsx               # Entry point (ReactDOM.createRoot)
  index.css              # All global styles (dark neon theme, CSS custom properties)
  vite-env.d.ts          # Vite type reference
  components/
    ChainDisplay.tsx     # Two-row chain rendering with SVG connectors
    BlockPicker.tsx      # Modal for selecting effects (category/subcategory tree)
  data/
    blocks.ts            # Block library (~100+ audio effects as AudioBlock[])
  types/
    audio.ts             # AudioBlock interface, TOTAL_SLOTS, SLOTS_PER_ROW constants
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc`) then production build (`vite build`) |
| `npm run lint` | ESLint on all `.ts`/`.tsx` files, zero warnings allowed |
| `npm run preview` | Preview production build locally |

**No test framework is installed.** There are no test files or test scripts.

## TypeScript Configuration

- **Strict mode** enabled (`"strict": true`)
- Target: `ES2020`, Module: `ESNext`, ModuleResolution: `bundler`
- JSX: `react-jsx`
- Disallowed: unused locals, unused parameters, fallthrough in switch
- `noEmit: true` — Vite handles compilation
- `allowImportingTsExtensions: true` — imports include `.ts`/`.tsx` extensions
- `isolatedModules: true` — each file must be independently transpilable

## Code Style Guidelines

### Imports
- Use relative imports with file extensions: `import { Foo } from './types/audio'`
- Group imports: React/hooks first, then local modules, then data/types
- Default exports for React components (`export default function App()`)
- Named exports for types, constants, and utility functions

### Naming Conventions
- **Components:** PascalCase (`ChainDisplay`, `BlockPicker`)
- **Interfaces/types:** PascalCase (`AudioBlock`)
- **Constants:** UPPER_SNAKE_CASE (`STORAGE_KEY`, `TOTAL_SLOTS`)
- **Variables/functions:** camelCase (`handleSlotClick`, `totalComputeWeight`)
- **Event handlers:** prefix with `handle` (`handleSelectBlock`, `handleRemoveBlock`)
- **File names:** PascalCase for components, camelCase for data/utils

### React Patterns
- Functional components only — no class components
- Use `useCallback` for stable handler references passed as props
- Use `useState` with initializer function for expensive/async initialization
- State updates use immutable patterns (spread operator, not mutation)
- Props are typed inline or via `interface` (no `React.FC`)

### Types
- Strict mode is on — no `any` unless absolutely necessary
- Nullable slot values typed as `(string | null)[]`
- Use optional chaining (`?.`) and nullish coalescing (`||`) for safe access
- Type assertions with `as` only when DOM APIs require it (e.g., `e.target as HTMLInputElement`)

### Error Handling
- `try/catch` for JSON parsing (localStorage, file import) with silent fallbacks
- `alert()` for user-facing errors on import (minimal UX, acceptable for this project size)
- Empty catch blocks (`catch (e) {}`) are acceptable for non-critical recovery paths

### CSS
- All styles in `src/index.css` — no CSS modules, no CSS-in-JS, no Tailwind
- Uses CSS custom properties (variables) for theming (dark neon theme)
- BEM-like class names: `.app`, `.header`, `.btn`, `.chain-row`, etc.

### Formatting
- 2-space indentation
- Semicolons required (enforced by TypeScript strict mode)
- Single quotes for strings (follow existing codebase convention)
- Trailing commas in multi-line objects/arrays

## ESLint

Dependencies installed: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.

**Note:** No ESLint config file exists in the repo. The `npm run lint` command runs with default/implicit config. If adding an ESLint config, follow the existing dependency set and enforce:
- `@typescript-eslint/strict` or equivalent
- `react-hooks/rules-of-hooks`
- `react-hooks/exhaustive-deps`
- `@typescript-eslint/no-unused-vars`
- `no-console` (warn)

## Git

- `.gitignore` ignores `node_modules/` and `dist/`
- No commit hooks configured
