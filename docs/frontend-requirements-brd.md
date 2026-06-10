# ADO #930 – Concuity Query Service: Frontend Development Requirements

> Source: Notion document derived from the company BRD (BRD Author: Amy Webster, May 11 2026).
> Notion link: https://app.notion.com/p/ADO-930-Concuity-Query-Service-Frontend-Development-Requirements-379b7301912b81ef96bfca57e186c68f

## Task Understanding

The **Concuity Query Service** is a web application with two portals:

1. **Client User Portal** — business users create, submit, track, and manage SQL query requests.
2. **Admin Portal** — Concuity IT/DBA Administrators review, approve, reject, edit, and manage submitted queries.

Once a query is approved, it gets a unique numeric identifier and is exposed via API to the **MicroAutomation Scheduler** for execution against Concuity's inventory database.

Frontend responsibilities: build all UI screens for both roles, role-based access at UI level, form interactions, validations, state transitions, and query versioning logic.

## User Roles & Security Permissions (BRD §2.1)

| Security Function | Add | Delete | Modify | Approve |
|---|---|---|---|---|
| Client User | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Administrator | ❌ No | ❌ No | ✅ Yes | ✅ Yes |

- "Create Query" only visible to Client Users.
- Approve/Reject only visible to Administrators.
- Soft delete (UI requirement) conflicts with Delete=No in security table — see Clarification Item #2.

## Screens to Build (5 total)

### Screen 1 — Client User: Query List (Dashboard)

Grid columns (all sortable asc/desc): Query Name (hyperlink → detail), Submitted By, Status (color-coded badge), Date Submitted, Date Approved/Rejected, Notes.

Status values (client view): **Draft, Awaiting Approval, Approved, Rejected**.
Assumed badge colors: Draft=Gray, Awaiting=Yellow/Orange, Approved=Green, Rejected=Red.

Features:
- **Search bar** — filter by Query Name.
- **Column sorting** — every column, asc/desc toggle.
- **Delete Selected (soft delete)** — checkbox per row + "Delete Selected" button; failure message if a deleted query is later accessed/executed.
- **Create New Query** button → Screen 2 (Client User only).

### Screen 2 — Client User: Create / Submit Query Form

| # | Field | Input Type | Required |
|---|---|---|---|
| 1 | Query Name | Text input (free form) | Yes |
| 2 | SQL Text | Large textarea | Yes |
| 3 | Business Reason | Textarea | Yes |
| 4 | Parameter Name | Auto-populated (read-only), parsed from SQL | Auto |
| 5 | Data Type | Dropdown per parameter: Character / Number / Date | Yes per param |
| 6 | Expected Volume | Text input (free form) | Yes |
| 7 | Expected Frequency | Dropdown: Ad-hoc / Daily / Weekly / Bi-weekly / Other | Yes |

**Parameter parsing (critical):** SQL parameters are "systematically parsed" from SQL Text and one row is rendered per parameter (read-only name + Data Type dropdown). Parsing syntax/trigger not defined in BRD (Clarification Item #1). Assumed: parse on blur/change of SQL Text.

**Post-submission:** success message, then either "Enter another query" (reset form) or "Close/Exit".

### Screen 3 — Client User: Query Detail View

- Opens via Query Name hyperlink. Read-only display of all Screen 2 fields + status, version number, dates, and Unique Query ID (once Approved).
- **Editability by status:** Draft = yes; Rejected = yes (re-submit); Approved = no (must "Create New Version"); Awaiting Approval = conflicting in BRD (Item #3).
- **Versioning:** "Create New Version" on Approved queries creates a copy with incremented version, Draft status; original remains intact. Assumed version starts at 1.
- **Copy:** copy any query (any status) → new independent Draft. Difference vs. Create New Version unclear (Item #6).

### Screen 4 — Admin: Query List (Approval Queue)

Same grid columns as Screen 1. Status values (admin view): **Awaiting Approval, Approved, Rejected** (no Draft — assumed Admins don't see drafts).

**Default sort:** Awaiting Approval first, then descending by Date Submitted.

Features: Search by Query Name; Disable an Approved Query (performance reasons, UI specifics undefined — Item #4); email notification to Admins on submission (backend concern).

### Screen 5 — Admin: Query Detail / Approval View

- Read mode of all query fields + version, submission date, Submitted By, Unique Query ID if approved.
- **Approve** button → Status Approved; system generates unique numeric Query ID.
- **Reject** button → Status Rejected; reason captured in **Notes** textarea (visible to Client Users).
- After Approve/Reject, screen closes and returns Admin to list (Screen 4).
- Admins can also edit query details (minor SQL tweaks); assumed no version bump for admin edits.

## Status Flow

```
Draft → Awaiting Approval        (Client submits)
Awaiting Approval → Approved     (Admin approves)
Awaiting Approval → Rejected     (Admin rejects)
Rejected → Awaiting Approval     (Client edits + re-submits)
Approved → New Version in Draft  (Client creates new version)
Approved → Disabled              (Admin disables)
```

### Editability by Status

| Status | Client Edit | Admin Edit | Available Actions |
|---|---|---|---|
| Draft | ✅ Full | — | Edit, Submit, Copy, Delete (soft) |
| Awaiting Approval | ⚠️ Conflicting (Item #3) | ✅ | Admin: Approve/Reject/Edit |
| Approved | ❌ (Create New Version) | ✅ | Client: Create New Version, Copy |
| Rejected | ✅ Full | ✅ | Client: Edit, Re-submit |
| Disabled | ❌ | ✅ (re-enable?) | Admin: Re-enable? (unclear) |

### Email Notifications (backend-triggered)

- Query submitted → email Admins.
- Query Approved/Rejected → email Client User with Query Name + Status.

## Reusable UI Components

- **Data display:** QueryGrid (sortable/searchable/selectable), StatusBadge, VersionBadge, QueryDetailPanel.
- **Form:** QueryForm, SQLTextarea (auto-parse), ParameterRow, DataTypeDropdown, FrequencyDropdown.
- **Actions:** ApproveRejectPanel, CreateNewVersionButton, CopyQueryButton, DisableQueryToggle, DeleteSelectedButton, SubmitQueryButton.
- **Navigation/feedback:** SearchBar, ColumnSortHeader, SuccessNotification, ErrorMessage/FailureAlert, PostSubmitActions.

## Points Needing Clarification (open questions with BA)

1. **Parameter parsing logic** — syntax (`:param`, `@param`, `?`, `{{param}}`?), client-side or backend, trigger event, behavior when no parameters.
2. **Delete vs. security table conflict** — soft delete allowed for Client Users despite Delete=No? Admins too?
3. **Awaiting Approval: editable or locked?** — System Requirements say locked; UI Requirements say editable. Direct contradiction.
4. **"Disable" feature UI details** — is Disabled a status? Where is the action? Re-enable possible? Client notified?
5. **Admin visibility of Draft queries** — admin status list excludes Draft; filter them out?
6. **Copy vs. Create New Version** — independent copy vs. versioned copy; which statuses allow which?
7. **Unique Query ID display** — grid column? detail only? visible to clients?
8. **MicroAutomation segregation** — UI field/toggle to scope queries to MicroAutomation? Now or future?
9. **Application URL & auth** — URL TBD; auth mechanism (SSO/LDAP/password)?; how roles are distinguished at login.
10. **Approval via change control vs. in-app** — is in-app Approve the only mechanism, or is external change control required first?

## Assumptions Made (in the BRD analysis)

1. Standard badge colors (Green=Approved, Red=Rejected, Yellow=Awaiting, Gray=Draft).
2. Version numbering starts at 1.
3. Each parsed SQL parameter renders its own row with a Data Type dropdown.
4. Standard pagination/infinite scroll on grids.
5. Admins do not see Draft queries.
6. "Create New Version" only for Approved queries.
7. Soft delete is Client User-only.
8. Both portals are one application, role-switched at login.
9. Email notifications entirely backend-triggered.
10. Admin edits do not trigger a new version.
11. Query Name must be unique (needs confirmation).
12. Rejection notes are visible to Client Users.

## Screen Inventory Summary

| # | Screen | Role |
|---|---|---|
| 1 | Query List (Dashboard) | Client User |
| 2 | Create / Submit Query Form | Client User |
| 3 | Query Detail View | Client User |
| 4 | Query List (Approval Queue) | Admin |
| 5 | Query Detail / Approval View | Admin |
