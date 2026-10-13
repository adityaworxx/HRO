# HRO Backend API Contract Specification

**Document Version:** 1.0  
**Phase:** Foundation Phase A9  
**Specification Source:** `types/schemas.ts` and `services/api/index.ts`

---

## 1. Endpoints Specification

### 1.1 Requisitions / Openings

| Method  | Path                       | Request Body                               | Response Body | Roles              | Description                      |
| :------ | :------------------------- | :----------------------------------------- | :------------ | :----------------- | :------------------------------- |
| `GET`   | `/api/openings`            | Query: `status?`, `department?`, `search?` | `Opening[]`   | Manager, HR        | List openings with filters       |
| `GET`   | `/api/openings/:id`        | None                                       | `Opening`     | Manager, HR        | Fetch opening details            |
| `POST`  | `/api/openings`            | `CreateOpeningFormData`                    | `Opening`     | Manager            | Raise new opening                |
| `PATCH` | `/api/openings/:id`        | `Partial<Opening>`                         | `Opening`     | Manager (own only) | Update opening requirements      |
| `PATCH` | `/api/openings/:id/status` | `{ status: OpeningStatus }`                | `Opening`     | HR                 | Advance or change opening status |

### 1.2 Candidates

| Method | Path                           | Request Body                                                        | Response Body | Roles                     | Description                  |
| :----- | :----------------------------- | :------------------------------------------------------------------ | :------------ | :------------------------ | :--------------------------- |
| `GET`  | `/api/candidates`              | Query: `openingId?`, `stage?`, `source?`, `search?`                 | `Candidate[]` | HR, Manager (shared only) | List candidates with filters |
| `GET`  | `/api/candidates/:id`          | None                                                                | `Candidate`   | HR, Manager               | Candidate profile details    |
| `POST` | `/api/candidates`              | `CreateCandidateFormData`                                           | `Candidate`   | HR                        | Sourced candidate entry      |
| `POST` | `/api/candidates/share`        | `{ candidateIds: string[], note?: string }`                         | `Candidate[]` | HR                        | Share shortlist with manager |
| `POST` | `/api/candidates/:id/decision` | `{ decision: 'Shortlisted' \| 'Rejected', comment?: string }`       | `Candidate`   | Manager                   | Record review decision       |
| `POST` | `/api/candidates/:id/schedule` | `{ date: string, mode: 'Video' \| 'Phone' \| 'Onsite' }`            | `Candidate`   | Manager                   | Schedule interview           |
| `POST` | `/api/candidates/:id/outcome`  | `{ outcome: 'Selected' \| 'Rejected' \| 'On Hold', note?: string }` | `Candidate`   | Manager                   | Record interview outcome     |

### 1.3 Onboarding

| Method  | Path                  | Request Body                   | Response Body      | Roles       | Description                     |
| :------ | :-------------------- | :----------------------------- | :----------------- | :---------- | :------------------------------ |
| `GET`   | `/api/onboarding`     | Query: `candidateId?`          | `OnboardingItem[]` | HR          | List onboarding checklist items |
| `PATCH` | `/api/onboarding/:id` | `{ done: boolean }`            | `OnboardingItem`   | HR, Manager | Toggle task completion          |
| `POST`  | `/api/onboarding`     | `CreateOnboardingTaskFormData` | `OnboardingItem`   | HR          | Add ad-hoc onboarding task      |

### 1.4 Notifications & Activity

| Method | Path                          | Request Body                                | Response Body     | Roles        | Description                      |
| :----- | :---------------------------- | :------------------------------------------ | :---------------- | :----------- | :------------------------------- |
| `GET`  | `/api/notifications`          | None                                        | `Notification[]`  | Current User | List role-targeted notifications |
| `POST` | `/api/notifications/:id/read` | None                                        | `Notification`    | Current User | Mark notification as read        |
| `GET`  | `/api/activity`               | Query: `limit?`, `entityType?`, `entityId?` | `ActivityEvent[]` | Manager, HR  | Audit activity timeline events   |

---

## 2. Standardized Error Shape

All error responses adhere strictly to this JSON format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request payload.",
  "fieldErrors": {
    "title": "Title is required and must not be empty."
  }
}
```

Standard HTTP status codes:

- `400 Bad Request`: Schema validation failure.
- `401 Unauthorized`: Missing or expired authentication session.
- `403 Forbidden`: Role permission violation (e.g. HR attempting to create an opening).
- `404 Not Found`: Resource ID does not exist.
- `500 Internal Server Error`: Unhandled server exception.
