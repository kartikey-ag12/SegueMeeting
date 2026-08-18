# SegueMeet — Master Project Documentation

**Purpose of this document:** complete context for anyone (or any AI tool, e.g. Antigravity) picking up this project — what it is, what it's modeled after, what's built, what rules must not be broken, and what's left to build.

---

## 1. What this project is

**SegueMeet** is a board/meeting management web application, built for internal use at Kartikey's company. It replaces the "Word doc + email + shared drive" workflow boards typically use, with one platform covering the full governance lifecycle: create a meeting → build an agenda → publish it → generate a board pack → run the meeting → take minutes → track decisions and actions → maintain a searchable governance record.

It is explicitly modeled on **BoardPro** ([boardpro.com](https://www.boardpro.com)) — an existing commercial board-management SaaS product. BoardPro is the reference for feature scope, information architecture, and UI/workflow patterns. Section 2 below is a full breakdown of what BoardPro does, extracted from product research.

---

## 2. Reference product — BoardPro (full feature breakdown)

BoardPro's core proposition: replace scattered Word/email/shared-drive workflows with one governance platform covering `Plan → Prepare → Meet → Record → Decide → Assign → Track → Govern`.

### Core modules
- **Dashboard/Home** — upcoming meetings, my actions, recent decisions, notifications
- **People & Organisation** — identity/access layer. Six access levels: **Chair, Administrator, Board Secretary, Board Member, Senior Executive, Executive/Guest**. Important: "Board Member" *access level* and "is an official board member" (`isBoardMember` boolean) are separate concepts — e.g. an auditor can have Board Member-level read access without being an actual board member.
- **Roles & Permissions** — only Chair/Administrator/Board Secretary can change org settings. Recommended model: `User → Role → Permissions → Resource → Action` (not hardcoded `if role === 'admin'` checks).
- **Meeting Management** — calendar/list views, meeting has: name, date, start/end time, location or remote link, administrator, attendees, guests, notes, documents, votes.
- **Meeting Lifecycle (state machine)** — this is the most important structural concept in the whole app:
  ```
  NO_AGENDA → DRAFT_AGENDA → PUBLISHED_AGENDA → MEETING
  → DRAFT_MINUTES → MINUTES_IN_REVIEW → MINUTES_CONFIRMED → LOCKED
  ```
  Publishing an agenda locks structural edits and unlocks the Board Pack + Minutes tabs. Confirming minutes locks the record permanently (in real BoardPro; in our build, confirmed just disables inputs at the UI level since there's no backend yet).
- **Agenda Builder** — hierarchy is `Meeting → Section → AgendaItem`, not a flat list. Each item has: title, description, purpose (none/for_noting/for_decision/for_discussion), presenter, duration, supporting documents. Drag-reorderable.
- **Board Packs** — auto-compiled from the published agenda + attached documents into one paginated document (Cover, Meeting Info, Agenda/TOC, Papers, Appendices).
- **Board Pack Annotations** — user-specific highlights/notes on documents, kept separate from the official document (never mutate the original).
- **Minutes** — NOT a single freeform text field. Structured as `AgendaItem → Note / Decision / Action` blocks:
  - **Note**: freeform discussion text
  - **Decision**: title, date, outcome, mover, seconder — feeds the Decision Register
  - **Action**: title, due date, owner(s) — feeds the Actions list
- **Actions** — title, description, owner(s), due date, status (Open → In Progress → Completed / Cancelled / Overdue).
- **Decision Register** — centralizes decisions from meetings, votes, and flying minutes into one searchable list.
- **Voting** — `AgendaItem → Motion → Vote (Yes/No/Abstain) → Outcome → Decision Register`. Never designed as an isolated module.
- **Flying Minutes** — async e-voting between scheduled meetings: create → circulate → discuss → vote → approve/reject → auto-record in Decision Register. **Confirmed real BoardPro behavior worth replicating exactly:** starting a Flying Minute opens a recipient picker that only allows selecting members with login/access enabled; if zero eligible recipients are selected, the Start/Send action stays disabled (server-side, not just UI).
- **Interest Register** — conflicts of interest: type, description, date declared, status (current/past). Users manage their own; Chair/Admin/Secretary can manage others'.
- **Governance Repository** — persistent org-level document storage (policies, constitutions, legal docs), distinct from per-meeting documents.
- **Subcommittees** — modeled as another "Board" with a `parentBoardId`, reusing the entire Meeting/Agenda/Minutes stack rather than a parallel data model.
- **Annual Work Plan** — month-by-month planning items, each optionally linked to a real Meeting.
- **Search** — global search across meetings, agenda items, documents, minutes, actions, decisions.
- **AI Layer**:
  - **AI Assistant** — natural-language Q&A over board data, respects the asker's existing permissions, always cites sources.
  - **AI Agenda Builder** — plain-language description → draft agenda → human review → published.
  - **AI Minutes** — meeting transcript → mapped against the agenda structure → draft minutes → human review before anything becomes official. Hard rule: **AI produces drafts only, a human always confirms** — never `AI → Official Record` directly.

### Confirmed behaviors (verified live in a BoardPro trial, not just marketing copy)
1. **Status changes never auto-send email.** Publishing an agenda, finishing minutes, etc. are always separate from sending — every notification is an explicit, skippable step.
2. **`loginEnabled` is a hard notification/voting gate**, not just a UI label. Any recipient picker (Flying Minute invite, meeting notice, pack email) must filter to members with login access enabled. Members without access need an admin "cast/act on behalf of" fallback, not silent exclusion.

---

## 3. Team & ownership

- **Kartikey** — building the **entire frontend** solo (`frontend/` folder). This document is maintained from his side of the build.
- **Nayan & Ashutosh** — building the **backend**, on their own laptops, added as GitHub contributors. They will push to their **own branch** (not `main` directly). **Critical rule: no backend logic exists anywhere in the frontend codebase** — everything is mock/local data until their branch is merged, specifically to avoid integration conflicts.
- **Aman** — informed periodically of frontend progress for context/knowledge, not actively building right now.

---

## 4. Tech stack (decided, not open questions)

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 16 (App Router), TypeScript, no `src/` dir |
| Styling | Tailwind CSS + shadcn/ui (preset: Nova — Lucide icons / Geist font) |
| Icons | lucide-react |
| Package manager | npm (npm workspaces monorepo) |
| Frontend hosting/dev | local dev via `npm run dev:frontend`, deploy target TBD |
| Backend (Nayan/Ashutosh, separate branch) | Node.js — exact framework TBD by them, was originally scoped as NestJS + Prisma + PostgreSQL per the Implementation Plan, subject to their decisions |
| Planned AI provider (future, backend concern) | Google Gemini API free tier (dev), swappable to Anthropic/OpenAI later |
| Planned e-signature (future, backend concern) | DocuSign sandbox |
| Planned PDF generation (future, backend concern) | Puppeteer (HTML→PDF) |

**Frontend-only rule:** none of the backend/AI/e-sign/PDF integrations above are implemented yet in `frontend/`. All current "save," "publish," "confirm" actions are simulated with local React state and `setTimeout`-style fake delays — this is intentional and matches the "no backend logic on frontend" rule in §3.

---

## 5. Repository structure (current, as of last restructure)

```
SegueMeet/
├── frontend/                      # Kartikey's entire domain — Next.js app root
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/              # not yet built
│   │   │   └── signup/             # not yet built
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # sidebar + topbar shell — wraps everything below
│   │   │   ├── my-home/
│   │   │   │   └── page.tsx        # dashboard — currently placeholder text only
│   │   │   ├── meetings/
│   │   │   │   ├── page.tsx        # Meeting List (Upcoming/Past)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create Meeting form
│   │   │   │   └── [meetingId]/
│   │   │   │       ├── agenda/
│   │   │   │       │   └── page.tsx   # Agenda Builder
│   │   │   │       ├── pack/
│   │   │   │       │   └── page.tsx   # Board Pack (view-only, PDF export stubbed)
│   │   │   │       └── minutes/
│   │   │   │           └── page.tsx   # Minutes (Note/Decision/Action blocks)
│   │   │   └── settings/
│   │   │       └── page.tsx        # General / Notifications / Security tabs
│   │   ├── layout.tsx               # root layout (Next.js default, untouched)
│   │   ├── page.tsx                  # redirects to /my-home
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # shadcn primitives (button, input, badge, table, tabs, select, switch, textarea, avatar, dropdown-menu, separator, sheet)
│   │   └── layout/
│   │       ├── sidebar.tsx          # persistent left nav
│   │       └── topbar.tsx           # board name + user avatar/dropdown
│   ├── lib/
│   │   ├── types.ts                 # ALL shared TypeScript shapes — single source of truth
│   │   ├── utils.ts                 # shadcn's cn() helper
│   │   ├── mock-meetings.ts
│   │   ├── mock-agenda.ts
│   │   └── mock-minutes.ts
│   ├── package.json                 # name: "frontend"
│   └── (standard Next.js config files: next.config.ts, tsconfig.json, components.json, eslint.config.mjs, postcss.config.mjs)
├── packages/
│   ├── ui/                          # currently unused — reserved for when a 2nd frontend app exists
│   └── types/                       # currently unused — same reason; types live in frontend/lib/types.ts for now
├── docs/
│   ├── 01_Project_Proposal_SOW.docx
│   ├── 02_Requirements_Document_BRD.docx
│   ├── 04_Coding_Standards_Contribution_Guide.docx
│   ├── 05_Project_Folder_Structure.docx   (describes the OLD apps/web+apps/api layout — superseded by this doc for folder structure purposes)
│   ├── TEAM_SPLIT_AND_WORKFLOW.md          (superseded — was for a two-frontend-dev split that no longer applies)
│   ├── AMAN_BRIEF.md                        (superseded, same reason)
│   └── FRONTEND_ROADMAP.md                  (still accurate — phase breakdown of remaining screens)
├── package.json                     # root: npm workspaces = ["frontend", "packages/*"]
└── .gitignore
```

**Note on the restructure:** the project originally used `apps/web` + `apps/api` (matching `05_Project_Folder_Structure.docx`). It was deliberately changed to a root-level `frontend/` folder (this doc reflects the current, correct structure). Nayan/Ashutosh's backend folder name/location is **not yet finalized** — flag this for coordination before their branch merges, so it doesn't collide with `frontend/`.

---

## 6. Shared data model (`frontend/lib/types.ts`)

This is the single source of truth for every screen's data shape. Reproduced here so Antigravity doesn't need to open the file to know it:

```ts
export type AgendaStatus = "draft" | "published";
export type MinutesStatus = "not_started" | "draft" | "in_review" | "confirmed";

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agendaStatus: AgendaStatus;
  minutesStatus: MinutesStatus;
}

export interface AgendaItem {
  id: string;
  title: string;
  purpose: "none" | "for_noting" | "for_decision" | "for_discussion";
  presenter: string;
  durationMinutes: number;
}

export interface AgendaSection {
  id: string;
  title: string;
  items: AgendaItem[];
}

export type MinuteBlockType = "note" | "decision" | "action";

export interface MinuteBlock {
  id: string;
  agendaItemId: string;
  blockType: MinuteBlockType;
  content: string;
  decisionOutcome?: "approved" | "rejected" | "deferred";
  mover?: string;
  seconder?: string;
  actionOwner?: string;
  actionDueDate?: string;
}
```

Mock data files (`mock-meetings.ts`, `mock-agenda.ts`, `mock-minutes.ts`) are all keyed by `meetingId` and conform to these shapes. When real backend endpoints exist, these mock files get swapped for real fetch calls — the shapes should stay identical so components don't need rewrites, only their data source changes.

---

## 7. Build rules and conventions (do not violate these)

1. **No backend logic in `frontend/`.** No real `fetch()` calls to an API, no database code, no auth logic. Every "save"/"submit"/"publish" action fakes success with local state + a short delay, then updates UI state directly. This is deliberate, per §3.
2. **Route groups**: `(auth)` and `(dashboard)` are Next.js route groups — folders in parens don't add a URL segment, they just let each group have its own `layout.tsx`. `(dashboard)/layout.tsx` renders the Sidebar + Topbar; everything under it inherits that shell automatically.
3. **Dynamic routes**: `[meetingId]` is a literal folder name (square brackets included) — matches any meeting ID in the URL, read via `useParams<{ meetingId: string }>()`.
4. **State-machine locking pattern**, used consistently across Agenda Builder and Minutes: a `status` field in local state gates whether inputs are `disabled`. Publishing/confirming sets the lock; "Roll back" reverses it. This mirrors BoardPro's real reversible-until-final-confirm behavior (§2).
5. **JSX apostrophe rule**: plain `'` in JSX text content trips `eslint(react/no-unescaped-entities)`. Always use `&apos;` instead (e.g. `meeting&apos;s`).
6. **Never trust frontend-only locks for anything governance-critical** — comments throughout the code flag where a real backend must re-enforce a rule (e.g. "agenda published" gating minutes) once it exists.
7. **Components use shadcn primitives from `components/ui/`** — never hand-roll a button/input/etc. if a shadcn equivalent exists; add new ones via `npx shadcn@latest add <component>` from inside `frontend/`.
8. **Free-text stand-ins for future dropdowns**: fields like "Presenter" and "Meeting administrator" are currently plain text inputs because they should eventually be `<Select>` dropdowns sourced from the People module, which doesn't exist yet. Flagged in code comments — revisit once People is built.

---

## 8. Screens — completed

| # | Screen | Route | File | Status |
|---|---|---|---|---|
| 1 | App shell | — | `components/layout/sidebar.tsx`, `topbar.tsx`, `(dashboard)/layout.tsx` | ✅ Done |
| 2 | Root redirect | `/` | `app/page.tsx` | ✅ Redirects to `/my-home` |
| 3 | Dashboard | `/my-home` | `(dashboard)/my-home/page.tsx` | ⚠️ Placeholder text only — no real cards yet (see Phase A below) |
| 4 | Meeting List | `/meetings` | `(dashboard)/meetings/page.tsx` | ✅ Upcoming/Past split, agenda + minutes status badges |
| 5 | Create Meeting | `/meetings/new` | `(dashboard)/meetings/new/page.tsx` | ✅ Notice-tab fields, remote/in-person toggle, fake submit |
| 6 | Agenda Builder | `/meetings/[meetingId]/agenda` | `(dashboard)/meetings/[meetingId]/agenda/page.tsx` | ✅ Sections/items, purpose dropdown, publish/rollback lock |
| 7 | Board Pack | `/meetings/[meetingId]/pack` | `(dashboard)/meetings/[meetingId]/pack/page.tsx` | ✅ Cover, TOC, Papers per section — guards on unpublished agenda; PDF export disabled/stubbed |
| 8 | Minutes | `/meetings/[meetingId]/minutes` | `(dashboard)/meetings/[meetingId]/minutes/page.tsx` | ✅ Note/Decision/Action blocks per agenda item, draft→review→confirmed state machine, non-blocking send checklist; guards on unpublished agenda |
| 9 | Settings | `/settings` | `(dashboard)/settings/page.tsx` | ✅ General / Notifications / Security tabs, fake save |

Mock meeting IDs currently in use: `"1"` = August Board Meeting (published agenda, empty minutes), `"2"` = July Board Meeting (published agenda, confirmed minutes with sample blocks), `"3"` = September Strategy Session (draft agenda, no agenda items yet — used to test the "not published" guards).

---

## 9. Screens — remaining, phased

### Phase A — finish core MVP loop
1. **Login / Signup** — `(auth)/login`, `(auth)/signup` — centered-card layout (needs its own `(auth)/layout.tsx`, no sidebar), form UI + client-side validation only, no real auth
2. **Actions list** — `/actions` — Current/Completed/Cancelled tabs, filter by owner; should read from Action-type `MinuteBlock`s created in Minutes
3. **Dashboard — real content** — `/my-home` — cards for Upcoming Meetings, My Actions, Recent Decisions, pulling from existing mock data files

### Phase B — governance record-keeping
4. **People** — `/people` — list (Name, 6 access-level roles, Board Member? toggle, Email, Status) + profile page. Once built, go back and upgrade the free-text Presenter/Administrator fields in Meeting/Agenda forms to real dropdowns sourced from here.
5. **Decisions Register** — `/decisions` — filterable list, populated from Decision-type `MinuteBlock`s
6. **Documents repository** — `/documents` — Governance vs Meeting document split, folder tree UI (mock tree, real upload needs backend)
7. **Interests Register** — `/interests` — CRUD, Current/Past filter
8. **Changes Log / audit trail UI** — read-only table (actor, action, resource, timestamp), surfaced in People profile or Settings

### Phase C — async governance
9. **Flying Minutes** — `/flying-minutes` — create form, voting UI (support/against/abstain); replicate the confirmed real-BoardPro rule from §2 (recipient picker gated by access-enabled members, Start disabled with zero eligible recipients)
10. **Between-Meetings Reports** — simpler circulate-only variant, can share most UI with Flying Minutes
11. **Annual Work Plan** — `/work-plan` — month-by-month CRUD, link to a real Meeting
12. **Committees** — topbar board-switcher becomes real; committees reuse the entire Meeting/Agenda/Minutes stack as another "board"

### Phase D — AI layer (UI shells only, canned responses — real AI wiring is backend's job)
13. **AI Agenda Builder** — prompt input on Agenda Builder → canned draft structure to accept/edit
14. **AI Minutes** — transcript upload UI → fake "draft ready for review" screen with suggested blocks per agenda item
15. **AI Assistant** — chat panel with canned Q&A pairs + citation-style source links

### Phase E — enterprise/compliance UI (lowest priority, heaviest backend dependency)
16. MFA setup screen (mock QR code)
17. E-signature flow UI (typed-signature or pad, no real DocuSign wiring)
18. Board Pack annotations layer
19. Static Access Levels reference page (pure content, no logic — could actually be built early as a quick win)
20. Billing/plans page — **skip**, this is an internal company tool, not being commercialized

---

## 10. How to run this project

```powershell
cd C:\Dev\SegueMeet
npm install
npm run dev:frontend
```

Visit `http://localhost:3000` — redirects to `/my-home`.

## 11. Known gotchas already hit and fixed (context for whoever debugs next)

- PowerShell needs `mkdir a, b, c` syntax and quoted paths for anything with parentheses (`"app\(dashboard)"`), unlike bash's `mkdir -p`.
- Project was originally inside a OneDrive-synced Desktop folder — moved to `C:\Dev\SegueMeet` to avoid OneDrive fighting with `node_modules`/`.next` during builds.
- `page.ts` vs `page.tsx` matters — Next.js pages returning JSX must be `.tsx`, not `.ts`, or you get "The default export is not a React Component."
- Route-group nesting mistakes (e.g. accidentally nesting `meetings/` inside `my-home/`, or root files like `layout.tsx`/`globals.css` accidentally ending up inside `(dashboard)/` instead of `app/` root) have happened during manual folder creation — always verify structure against §5 above after creating new routes.
