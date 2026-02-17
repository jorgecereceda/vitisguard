# AGENTS.md - VitisGuard Development Guide

VitisGuard is a Vue 3 + TypeScript web application using Vite, Pinia, and Vue Router with Atomic Design principles.

## Commands

### Development
```bash
npm run dev              # Start dev server
npm run preview          # Preview production build
```

### Build
```bash
npm run build            # Type-check + build
npm run build-only       # Build only
npm run type-check       # vue-tsc type checking
```

### Linting & Formatting
```bash
npm run lint             # Run all linters (oxlint + eslint)
npm run lint:oxlint      # Oxlint with auto-fix
npm run lint:eslint      # ESLint with auto-fix
npm run format           # Format with oxfmt
```

### Testing
```bash
npm run test:unit        # Vitest unit tests
npm run test:e2e         # Cypress E2E tests
npm run test:e2e:dev     # E2E in dev mode
```

#### Running a Single Test
```bash
npx vitest run src/__tests__/App.spec.ts     # Specific file
npx vitest run --grep "component name"       # By pattern
npx vitest run -t "test name"                # By test name
npx vitest src/__tests__/App.spec.ts         # Watch mode
```

## Code Style Guidelines

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables/Constants | camelCase | `userCount`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Functions/Methods | camelCase | `calculateTotal()` |
| Classes/Components | PascalCase | `UserProfile` |
| Files/Folders | kebab-case | `user-service.ts` |
| Boolean variables | `is`/`has`/`should` | `isLoading` |

### Formatting Rules
- **Indentation**: 2 spaces
- **Semicolons**: No
- **Quotes**: Single quotes
- **Line length**: Max 100 characters
- **Line endings**: LF

### File Limits
- Max 300-400 lines per file
- Max 20-30 lines per function (single responsibility)

## TypeScript Guidelines

- Always define types for function parameters and return values
- Use `@/` path alias for src/ imports:
```typescript
import { useCounterStore } from '@/stores/counter'
import type { User } from '@/types'
```

## Import Order

1. External libraries (Vue, Pinia)
2. Internal modules (stores, composables, services)
3. Relative imports (local components)
4. Type imports (use `import type`)

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { User, ApiResponse } from '@/types'
```

## Vue 3 Composition API

- Use `<script setup>` + Composition API required
- Use `ref`, `reactive`, `toRef` appropriately:
  - `ref`: primitives or reassigning
  - `reactive`: objects not reassigned
  - `toRef`: refs from reactive properties
- Define props/emits with TypeScript:
```typescript
interface Props { title: string; count?: number }
const props = withDefaults(defineProps<Props>(), { count: 0 })
const emit = defineEmits<{ update: [value: number] }>()
```

### Atomic Design Structure
```
src/components/
├── atoms/       # Buttons, inputs
├── molecules/   # Cards, search boxes
└── organisms/   # Headers, lists
```

## Error Handling

- No console.log in production
- No magic numbers - use named constants:
```typescript
const API_TIMEOUT_MS = 5000
await new Promise(r => setTimeout(r, API_TIMEOUT_MS))
```
- Handle async errors always
- Use error boundaries for graceful handling

## Testing Guidelines

### Unit Tests
Co-located with source: `BaseButton.vue` → `BaseButton.test.ts`

Minimum 5 tests covering:
1. Component rendering
2. Composable logic
3. Interactivity (v-show, v-if)
4. State management (Pinia)
5. CRUD operations

### Naming
Use `.spec.ts` or `.test.ts` suffix with descriptive names.

## Quality Rules

- **DRY**: Extract shared logic to composables
- **Comment intent**: Explain *why*, not *what*
- **TypeScript**: Never use `any`

## Configuration Reference

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config |
| `vitest.config.ts` | Vitest config |
| `eslint.config.ts` | ESLint config |
| `.oxlintrc.json` | Oxlint rules |
| `.oxfmtrc.json` | Formatter rules |
| `tsconfig.app.json` | App TypeScript |
| `.editorconfig` | Editor settings |

## Project Structure

```
src/
├── assets/          # Images, fonts, styles
├── components/      # Atomic Design
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── composables/    # Reusable Vue composables
├── router/         # Vue Router
├── services/       # API services
├── stores/         # Pinia stores
├── views/          # Page components
├── App.vue         # Root
└── main.ts         # Entry point
```
