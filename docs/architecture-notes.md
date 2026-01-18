# Situation Monitor Architecture Notes

## Panel Registration & Display
- **Panel Config**: `src/lib/config/panels.ts` defines `PanelId` union type and `PANELS` record with name + priority
- **Panel Components**: Located in `src/lib/components/panels/`, exported via barrel `index.ts`
- **Main Page**: `src/routes/+page.svelte` directly imports panel components and conditionally renders via `isPanelVisible(id)` checks
- **Visibility Logic**: `settings.enabled[id]` controls whether panel is shown (default true if not set)
- **No Complex Registry**: Panels are not dynamically registered - they're hard-coded in +page.svelte

## Data Fetching Pattern
- **API Functions**: Located in `src/lib/api/` (news.ts, markets.ts, misc.ts, leaders.ts, fred.ts)
- **No Server Routes**: Current implementation has NO SvelteKit server routes - all fetching is client-side
- **Service Layer**: Uses `ServiceClient` from `src/lib/services/client.ts` with:
  - `CacheManager` (memory + localStorage, TTL-based)
  - `CircuitBreaker` (failure tracking, auto-recovery)
  - `RequestDeduplicator` (prevents duplicate in-flight requests)
  - `ServiceRegistry` (per-service config: timeouts, retries, cache TTL)
- **Stores**: Svelte 5 stores in `src/lib/stores/` (news.ts, markets.ts, monitors.ts, settings.ts, refresh.ts, fed.ts)
- **Refresh Orchestration**: `refresh.ts` implements multi-stage refresh with staggered delays

## Theming & Styles
- **Tailwind CSS**: Configured in `tailwind.config.js` with custom dark theme
- **CSS Variables**: Used for theming (--bg, --text-primary, --text-secondary, etc.)
- **Panel Component**: `src/lib/components/common/Panel.svelte` provides standard panel chrome (title, count, loading, error states)
- **Consistent Styling**: All panels follow same visual pattern with panel header, body, and standard states

## Component Patterns
- **Svelte 5 Runes**: Uses `$state`, `$derived`, `$effect` throughout
- **Props Interface**: Components use `interface Props` with destructured `$props()`
- **Snippets**: For custom slots/templates (e.g., Panel component)
- **Type Safety**: Full TypeScript with types in `src/lib/types/index.ts`

## Testing Infrastructure
- **Vitest**: Unit tests located alongside source files as `*.test.ts`
- **Playwright**: E2E tests in `tests/e2e/*.spec.ts`
- **Test Commands**: `npm run test:unit`, `npm run test:e2e`
- **Existing Coverage**: stores/, services/, and e2e smoke tests exist

## Build & Deploy
- **Static Adapter**: Builds to static site (no server runtime)
- **GitHub Pages**: Deployed with `BASE_PATH=/situation-monitor`
- **Build Command**: `npm run build` (outputs to `build/`)
- **Vite**: Development server at localhost:5173

## Key Implementation Insights for Intel Sources
1. **No dynamic panel registry** - must manually add panels to +page.svelte
2. **Server routes needed** - current setup has none, we need to add them for Shodan/WiGLE
3. **Existing CacheManager** - can reuse for server-side caching
4. **Consistent Panel Pattern** - all panels use Panel.svelte wrapper with standard props
5. **Feature flags via env** - use PUBLIC_ prefix for client-exposed flags
6. **Type definitions** - add to src/lib/types/index.ts or new intel.ts
7. **Service client pattern** - client-side API calls use ServiceClient with registry config
