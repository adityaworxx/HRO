# HRO Architecture and Data Boundaries

**Document Version:** 1.0  
**Phase:** Foundation Phase A9

---

## 1. Single Data Boundary Model

HRO enforces a strict boundary between the UI layer and data services. UI components and page routes **never** access `localStorage`, import test fixtures, or invoke fake stores directly. All data access flows through a swappable API client.

```
[UI Components & Pages]
        │
        ▼
[TanStack Query Custom Hooks] (features/*/hooks.ts)
        │
        ▼
[HroApiClient Interface] (services/api/index.ts)
        │
        ├── NEXT_PUBLIC_DATA_SOURCE = 'mock' ──► [MockApi Implementation] (services/mock/mockApi.ts)
        │                                                │
        │                                                ├── Simulated Latency (300–700ms)
        │                                                └── LocalStorage Persistence (`hro:v1`)
        │
        └── NEXT_PUBLIC_DATA_SOURCE = 'http' ──► [HttpApi Stub] (services/http/httpApi.ts)
                                                         │
                                                         └── Throws NotImplementedError until Backend arrives
```

---

## 2. Transitioning to a Real Backend

When the real backend is ready:

1. Implement the endpoints in `services/http/httpApi.ts` using `fetch` or native HTTP requests.
2. Update `.env.local` with `NEXT_PUBLIC_DATA_SOURCE=http` and configure `NEXT_PUBLIC_API_URL`.
3. **Zero UI changes:** Not a single component, query hook, or page route needs to be modified.

---

## 3. Role-Based Navigation & Route Guards

Access rules are maintained in `lib/navigation.ts` and enforced at layout time in `app/(app)/layout.tsx`:

- **Manager Persona:** Access to `/`, `/openings`, `/openings/new`, `/openings/[id]`, `/openings/[id]/edit`, `/shortlist`, `/interviews`, `/settings`.
- **HR Persona:** Access to `/`, `/openings`, `/openings/[id]`, `/candidates`, `/pipeline`, `/onboarding`, `/reports`, `/settings`.
- Unauthorized route visits immediately trigger a redirection to `/` accompanied by an accessible error toast.
