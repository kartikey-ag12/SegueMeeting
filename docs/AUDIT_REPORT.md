# SegueMeet — Full Comparison Audit Report

## 1. Executive Summary

This report provides a read-only audit comparing the current state of the SegueMeet project against the reference BoardPro product and the project's documentation. 

**Overall Completeness:** Approximately **40%** of the core UI shell is in place. The core meeting lifecycle flow (`Meeting -> Agenda -> Pack -> Minutes`) has UI foundations built, but relies heavily on mock data, frontend-only state machines, and incomplete backend integrations.

**Critical Issues Blocking the Core Workflow:**
1. **Agenda Data Fetching:** The backend `getMeetingById` endpoint fails to include nested agenda `items`, causing data loss on refresh (patched defensively on frontend, but fundamentally broken on backend).
2. **Board Pack Generation:** Entirely stubbed out; there is no actual PDF compilation or true board pack view.
3. **Auth & Identity:** The system assumes a logged-in user via mock tokens or `/auth/me`, but no actual login/signup flow exists. The "People" dropdowns (e.g., Presenter selection) are free-text fields.

---

## 2. Module-by-Module Detail

### Dashboard (My Home)
1. **Reference Video:** Shows Upcoming Meetings, My Actions, Recent Decisions, Notifications, and Signatures required.
2. **Current Project:** Implemented at `app/(dashboard)/my-home/page.tsx`.
3. **Done and working:** Tabs for Upcoming vs. Past meetings work and filter local data correctly.
4. **Present but broken:** The "Signature Required" and "Actions" tabs at the bottom display hardcoded empty states (`"No documents are waiting for you to sign."`). Action menu (three dots) on meeting cards does nothing.
5. **Data mismatches:** Meeting cards hardcode the organization name as "Kartikey Tech" instead of fetching the real organization name.

### Meetings List & Creation
1. **Reference Video:** Calendar/list view, fields for name, date, time, location, video URL, attendees.
2. **Current Project:** Implemented at `app/(dashboard)/meetings/page.tsx` and `/new`.
3. **Done and working:** Upcoming/Past splits, status badges for Agenda/Minutes route correctly.
4. **Present but broken:** "Add Meeting" form uses fake simulated saving. Action menu (three dots) in the list view is unhooked.
5. **Missing entirely:** Calendar view mode is missing.

### Agenda Builder
1. **Reference Video:** Drag-and-drop sections and items, purpose dropdowns, presenter, duration, documents, publish, rollback, preview.
2. **Current Project:** Implemented at `app/(dashboard)/meetings/[meetingId]/agenda`.
3. **Done and working:** Drag-and-drop works. "Publish Agenda" sets status to PUBLISHED. "Roll Back to Draft" button exists and reverts status. "Preview" opens a modal showing a formatted read-only view. 
4. **Data mismatches:** If the app falls back to fetching via `getMeetingById` (e.g., on hard refresh), the backend fails to include the `items` array inside `agendaSections`. The UI handles this defensively now, but the actual item data is lost/blank. Presenter is a free-text field, not a user select.

### Board Pack
1. **Reference Video:** Auto-compiled paginated document (Cover, Agenda, Papers).
2. **Current Project:** Implemented at `app/(dashboard)/meetings/[meetingId]/pack/page.tsx`.
3. **Present but broken:** The PDF export button is visible but stubbed out. The viewer does not actually stitch together documents; it is a placeholder.

### Minutes
1. **Reference Video:** Note/Decision/Action blocks per agenda item.
2. **Current Project:** Implemented at `app/(dashboard)/meetings/[meetingId]/minutes/page.tsx`.
3. **Done and working:** The Draft -> Review -> Confirmed state machine is implemented on the frontend. Blocks can be added per item.
4. **Present but broken:** "Send" checklists are visual only; no emails or notifications are actually dispatched.
5. **Data mismatches:** Assigning an action owner is a free-text string instead of a user lookup.

### Actions
1. **Reference Video:** List of actions with statuses (Open, In Progress, Completed), assignees, due dates.
2. **Current Project:** Implemented at `app/(dashboard)/actions/page.tsx`.
3. **Done and working:** Tab routing (Current, Completed, Cancelled).
4. **Present but broken:** Contains a `TODO: Implement Phase 3 - fetch real MinutesActionItem from backend`. The list relies on an empty hardcoded array.

### People & Organisation
1. **Reference Video:** User list, 6 access levels, profile views.
2. **Current Project:** Implemented at `app/(dashboard)/people/page.tsx`.
3. **Done and working:** Fetches members via `/organisations/:id/members` and renders a table.
4. **Present but broken:** "Invite Member", "Edit Role" (gear icon), and "Remove Member" (trash icon) buttons have no `onClick` handlers.

### Decisions
1. **Reference Video:** Searchable list of decisions across meetings and flying minutes.
2. **Current Project:** Route exists (`app/(dashboard)/decisions`).
3. **Missing entirely:** Fully functional backend integration; currently just a placeholder/empty state.

### Documents & Governance Repository
1. **Reference Video:** Folder tree UI, global governance docs.
2. **Current Project:** Route exists (`app/(dashboard)/documents`).
3. **Present but broken:** Mock folder tree. Uploads do not actually persist to S3 or local storage.

### Flying Minutes & Between-Meeting Reports
1. **Reference Video:** Recipient picker gated by `loginEnabled`, voting UI.
2. **Current Project:** Route exists (`app/(dashboard)/between-meetings`).
3. **Missing entirely:** The specific access-gated recipient picker logic is not built.

### Auth & Security
1. **Reference Video:** Login, password reset, MFA.
2. **Current Project:** `(auth)/login` and `(auth)/signup` are missing.
3. **Missing entirely:** No real JWT or session management flow is built in the UI.

### AI Features
1. **Reference Video:** AI Agenda Builder, AI Assistant chat.
2. **Current Project:** 
3. **Missing entirely:** AI buttons are marked `disabled: true` or absent.

---

## 3. Prioritized Punch List

1. **Agenda Item Backend Fetch (Critical - Blocks Core Workflow):** Fix `getMeetingById` to return nested `items`. Currently, hard-refreshing an agenda page loses all item data.
2. **Board Pack PDF Generation (Critical - Blocks Core Workflow):** Implement Puppeteer or similar to actually compile the agenda and documents into a single PDF.
3. **Auth/Login UI (High Priority):** Build the `(auth)` routes. Without real identity, features like Action Assignees and Flying Minute Voters cannot be completed.
4. **Action Items Integration (Medium Priority):** Connect the `/actions` dashboard to the backend `MinutesActionItem` table.
5. **People Management Actions (Medium Priority):** Wire up the Invite, Edit, and Delete buttons in the People module.
6. **Select vs. Free-text Refactor (Medium Priority):** Replace free-text "Presenter" and "Administrator" inputs with `<Select>` dropdowns tied to the People database.
