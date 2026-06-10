# Concuity Query Service — Frontend (ADO #930)

React + Vite UI for the Concuity Query Service. Requirements live in
[`../docs/frontend-requirements-brd.md`](../docs/frontend-requirements-brd.md) and
[`../docs/company-brd-hld-api.md`](../docs/company-brd-hld-api.md).

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

Demo accounts (mock login, `src/fixtures/users.js`):

| Role | Username | Password |
|---|---|---|
| Client User | `jdoe` | `user123` |
| Administrator | `asmith` | `admin123` |

## Architecture

- **`src/services/`** — API layer. Currently a localStorage mock seeded from
  `src/fixtures/queries.js`; each function maps 1:1 to a real backend endpoint
  (`GET /queries`, `POST /queries`, `PUT /admin/query/{id}/approve`, …) so the
  mock can be swapped for `fetch` calls without touching components.
- **`src/context/`** — React Context state: `AuthContext` (session/role),
  `QueryContext` (query list + actions).
- **`src/pages/`** — route-level screens, split by role (`user/`, `admin/`).
- **`src/components/`** — shared building blocks (`QueryTable`, `StatusBadge`, layout).
- **`src/utils/sqlParams.js`** — client-side `:param` bind-variable parsing.
- Plain CSS in `src/styles/` (no CSS framework, per project decision).

## Screen status

| BRD Screen | Status |
|---|---|
| 1 — User: Query List | ✅ Built (search, sort, soft delete) |
| 2 — User: Create/Submit Query | ✅ Built (param parsing, draft/submit, post-submit actions) |
| 3 — User: Query Detail | ⏳ Pending |
| 4 — Admin: Approval Queue | ⏳ Pending (placeholder route exists) |
| 5 — Admin: Approval Detail | ⏳ Pending |
