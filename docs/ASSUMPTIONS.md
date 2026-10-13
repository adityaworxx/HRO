# HRO Engineering Assumptions & Simplifications

**Document Version:** 1.0  
**Status:** Recorded per PRD Operating Rule A1.3 and Reference Section 10

---

## 1. Scope & Domain Simplifications

1. **Single-Tenant Architecture:** HRO operates within a single organization without multi-tenant boundaries or tenant isolation complexity.
2. **Two Primary Roles Only:** The system recognizes exactly two user roles: `manager` (Hiring Manager) and `hr` (HR / People Operations). Candidates, external interviewers, IT admins, and executives do not have distinct logins.
3. **External Candidate Sourcing:** Candidates do not log in or submit applications directly through the app. HR sources candidates externally (e.g. LinkedIn, Naukri) and inputs candidate profiles into HRO.
4. **Light Interview Workflow:** The interview stage intentionally avoids complex scorecards, calendar integrations, and video platform webhooks. It focuses on recording scheduled dates, interview modes (Video/Phone/Onsite), and clear outcomes (`Selected`, `Rejected`, `On Hold`).
5. **Streamlined Onboarding:** Onboarding operates as an internal HR checklist generated from a standard template upon offer acceptance. Candidates do not upload documents or e-sign contracts through the app.

---

## 2. Technical & Architectural Assumptions

1. **Frontend-Only Mock Boundary:** There is no live backend or database in this foundation phase. All data operations pass through swappable API interfaces backed by an in-memory store that persists across browser sessions using `localStorage` key `hro:v1`.
2. **Simulated Asynchronous Latency:** The mock API simulates network reality by introducing artificial delays of 300ms to 700ms and standardized error payloads `{ code, message, fieldErrors? }`.
3. **Client-Side Auth Seam:** Authentication is controlled via a demo role switcher in the App Shell, managed by Zustand and synchronized with localStorage. Permission checks are centralized through `can(user, action, resource)` pure functions.
4. **Zero Raw Hex Colors:** All components, shells, and layouts consume semantic design tokens exclusively from `styles/tokens.css` to guarantee complete light/dark theme contrast compliance.
