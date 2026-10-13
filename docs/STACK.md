# HRO Technology Stack and Dependency Manifest

**Document Version:** 1.0  
**Phase:** Foundation Phase A3  
**Package Manager:** pnpm 12.11.2  
**Node Target:** >=20.0.0 (LTS 22.x pinned in `.nvmrc`)

---

## 1. Runtime Dependencies

| Package                         | Version   | Purpose                                                    |
| :------------------------------ | :-------- | :--------------------------------------------------------- |
| `next`                          | `16.4.0`  | React App Router framework, server components, and routing |
| `react`                         | `19.3.0`  | Core UI library                                            |
| `react-dom`                     | `19.3.0`  | DOM renderer for React                                     |
| `@radix-ui/react-avatar`        | `1.3.0`   | Accessible avatar primitive with fallback initials         |
| `@radix-ui/react-checkbox`      | `1.4.0`   | Accessible checkbox primitive                              |
| `@radix-ui/react-collapsible`   | `1.2.0`   | Collapsible sidebar and section primitive                  |
| `@radix-ui/react-dialog`        | `1.3.0`   | Modal dialogs and confirm prompts                          |
| `@radix-ui/react-dropdown-menu` | `2.2.0`   | Contextual and user action dropdowns                       |
| `@radix-ui/react-label`         | `2.1.17`  | Accessible form control labels                             |
| `@radix-ui/react-popover`       | `1.3.0`   | Notifications and filter popovers                          |
| `@radix-ui/react-progress`      | `1.2.0`   | Onboarding progress and stage completion indicators        |
| `@radix-ui/react-radio-group`   | `1.5.0`   | Accessible single-choice radio groups                      |
| `@radix-ui/react-scroll-area`   | `1.4.0`   | Custom scroll container with theme borders                 |
| `@radix-ui/react-select`        | `2.4.0`   | Dropdown select inputs with keyboard navigation            |
| `@radix-ui/react-separator`     | `1.2.0`   | Layout visual dividers conforming to 1px borders           |
| `@radix-ui/react-slot`          | `1.5.0`   | Polymorphic component composition primitive                |
| `@radix-ui/react-switch`        | `1.4.0`   | Accessible toggle switch primitive                         |
| `@radix-ui/react-tabs`          | `1.2.0`   | Accessible tabs for opening detail & design system         |
| `@radix-ui/react-tooltip`       | `1.4.0`   | Accessible tooltips on icon buttons                        |
| `class-variance-authority`      | `0.7.1`   | Type-safe variant-based class composer                     |
| `clsx`                          | `2.1.1`   | Conditional class utility                                  |
| `tailwind-merge`                | `3.7.0`   | Conflict-free Tailwind class concatenation                 |
| `tailwindcss-animate`           | `1.0.7`   | Keyframe transitions respecting reduced-motion             |
| `lucide-react`                  | `1.55.0`  | Consistent 16px/20px icon set (zero emoji)                 |
| `next-themes`                   | `0.4.6`   | Theme management toggling `data-theme` attribute           |
| `@tanstack/react-query`         | `5.104.2` | Async state management, caching, and optimistic updates    |
| `@tanstack/react-table`         | `8.21.3`  | Headless data table logic (sort, filter, paginate)         |
| `react-hook-form`               | `7.90.0`  | Performant form state management                           |
| `@hookform/resolvers`           | `5.9.1`   | Adapter connecting React Hook Form with Zod schemas        |
| `zod`                           | `4.6.6`   | Canonical schema validation and type inference             |
| `@dnd-kit/core`                 | `6.3.1`   | Kanban drag-and-drop core engine                           |
| `@dnd-kit/sortable`             | `10.0.0`  | Kanban column sorting primitives                           |
| `@dnd-kit/utilities`            | `3.2.2`   | Drag event helpers and transform utilities                 |
| `cmdk`                          | `1.1.1`   | Keyboard-accessible Command Palette (`Ctrl/Cmd + K`)       |
| `sonner`                        | `2.0.8`   | Accessible toast notification system                       |
| `date-fns`                      | `4.4.0`   | Date manipulation and relative time formatting             |
| `zustand`                       | `5.0.15`  | Lightweight client state (sidebar, demo role)              |

---

## 2. Development & Quality Dependencies

| Package                       | Version    | Purpose                                                  |
| :---------------------------- | :--------- | :------------------------------------------------------- |
| `typescript`                  | `5.9.3`    | Type system in strict mode with noUncheckedIndexedAccess |
| `tailwindcss`                 | `4.3.3`    | Utility-first CSS generation mapped to CSS variables     |
| `@tailwindcss/turbopack`      | `4.3.3`    | Turbopack compilation optimizer                          |
| `eslint`                      | `9.39.5`   | Static analysis engine                                   |
| `eslint-config-next`          | `16.4.0`   | Next.js core web vitals and linting rules                |
| `eslint-plugin-jsx-a11y`      | `6.10.2`   | WCAG AA in-editor accessibility auditing                 |
| `prettier`                    | `3.9.10`   | Code formatting engine                                   |
| `prettier-plugin-tailwindcss` | `0.8.1`    | Automatic Tailwind class ordering                        |
| `vitest`                      | `5.0.4`    | High-speed unit and domain test runner                   |
| `@vitejs/plugin-react`        | `6.1.2`    | React JSX transform for Vitest                           |
| `jsdom`                       | `30.1.2`   | Headless browser DOM environment for testing             |
| `@testing-library/react`      | `16.3.3`   | React component testing harness                          |
| `@testing-library/jest-dom`   | `7.0.1`    | Custom DOM element matchers                              |
| `@testing-library/user-event` | `14.6.7`   | Accessible user event simulations                        |
| `@playwright/test`            | `1.64.0`   | End-to-end browser automation suite                      |
| `@axe-core/playwright`        | `4.13.0`   | Automated axe WCAG AA accessibility scanner              |
| `husky`                       | `9.1.7`    | Git pre-commit lifecycle hook runner                     |
| `lint-staged`                 | `17.6.0`   | Staged files formatting and linting gate                 |
| `@faker-js/faker`             | `10.6.0`   | Deterministic fixture generator (seed script only)       |
| `@types/node`                 | `20.19.43` | Node.js runtime type definitions                         |
| `@types/react`                | `19.3.0`   | React type definitions                                   |
| `@types/react-dom`            | `19.3.0`   | React DOM type definitions                               |

---

## 3. Excluded Packages & Architectural Invariants

In accordance with PRD Part A3, the following packages are strictly forbidden and omitted:

- No secondary UI kits (e.g. MUI, Chakra, Ant Design)
- No charting libraries (e.g. Recharts, Chart.js)
- No CSS-in-JS (e.g. styled-components, emotion)
- No ORMs or database drivers (e.g. Prisma, Drizzle, pg)
- No authentication libraries (e.g. NextAuth, Clerk)
- No Redux or heavy flux stores
- No Axios, Moment.js, or Lodash
