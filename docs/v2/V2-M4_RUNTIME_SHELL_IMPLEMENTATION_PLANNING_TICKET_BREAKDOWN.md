# V2-M4 — Runtime Shell Implementation Planning / Ticket Breakdown

## 1. Title

**V2-M4 — Runtime Shell Implementation Planning / Ticket Breakdown**

---

## 2. V2-M4 Purpose

V2-M4 defines the controlled implementation plan and ticket sequence for the future iPad-first runtime shell work.

This milestone translates the locked V2-M1 through V2-M3 planning direction into a safe implementation path for the first future runtime shell work.

V2-M4 is still planning/source-of-truth work. It does not build the shell, change app navigation, create components, edit runtime app files, or redesign visuals.

---

## 3. Baseline

Refab Connect V2 continues from the locked V1, V2-M1, V2-M2, and V2-M3 planning baseline.

- V1 closed at **M30**.
- V2-M1 passed and locked.
- V2-M1 established iPad-first architecture direction.
- V2-M2 passed and locked.
- V2-M2 established floor feedback / pilot input planning.
- V2-M3 passed and locked.
- V2-M3 established iPad operating shell / navigation planning.
- V2-M4 now converts planning into a ticketed implementation path.

V2-M1 commit: `b11f65046022206f50c1779087bbc4f5efb2f1e4`.

V2-M2 commit reviewed: `f0a5babe87f56c42e436ecab9096a8fbf77da465`.

V2-M3 commit reviewed: `acfb4c98081dc9ed71b4731af5c4b37e3487f13f`.

---

## 4. Why Ticket Breakdown Matters

Runtime work must be controlled before implementation begins.

Ticket breakdown matters because:

- Runtime work must be controlled.
- V2 should not jump from planning directly into large uncontrolled rewrites.
- Tickets prevent UI drift.
- Tickets make implementation easier to test.
- Tickets keep iPad-first shell work separate from feature expansion.
- Tickets help Chat 2, Chat 3, and Chat 4 pass results cleanly without noise.

The ticket path keeps V2 implementation disciplined and protects the existing V1 pilot-ready correction workflow while the runtime shell evolves.

---

## 5. Implementation Principles

Future V2 runtime shell implementation should follow these principles:

- One milestone at a time.
- One controlled runtime change per ticket where possible.
- Preserve V1 pilot-ready behavior.
- Do not break existing correction workflow.
- Do not add backend/auth/database behavior.
- Do not claim future features are complete.
- Keep phone support intact.
- Build the shell before building new feature lanes.
- Architecture first, polish later.

The runtime shell should be improved in small, reviewable steps instead of broad rewrites.

---

## 6. Proposed Runtime Shell Ticket Sequence

### Ticket 1 — Shell Inventory / Existing Runtime Map

**Purpose:**
Identify current app shell, navigation, layout containers, screen entry points, and places that would be affected by future V2 shell work.

**Expected future output:**

- List of relevant files.
- Current navigation/screen structure summary.
- No code changes unless separately approved.

---

### Ticket 2 — Shell Layout Foundation

**Purpose:**
Create or update the broad layout foundation for future iPad-first behavior while preserving existing V1 workflow.

**Expected future output:**

- Safe layout container plan.
- Responsive shell foundation.
- No feature lane expansion.

---

### Ticket 3 — iPad Split-View Foundation

**Purpose:**
Add the first controlled split-view layout foundation for tablet widths.

**Expected future output:**

- iPad/tablet layout behavior.
- Left/main active work area.
- Right/secondary review/status area.
- Phone remains vertical.

---

### Ticket 4 — Navigation Grouping Foundation

**Purpose:**
Prepare navigation grouping around planned V2 areas without overbuilding.

**Expected future output:**

- Planned nav grouping.
- Avoid adding unfinished feature routes unless placeholder behavior is explicitly approved.
- Preserve existing working routes.

---

### Ticket 5 — Dashboard / Operating Overview Placeholder Planning

**Purpose:**
Plan or create a controlled dashboard shell only if approved later.

**Expected future output:**

- Operating overview placeholder direction.
- No analytics claims.
- No fake backend status claims.

---

### Ticket 6 — Feedback Lane Placeholder Planning

**Purpose:**
Plan how V2-M2 floor feedback gets a future home without building the full feature too early.

**Expected future output:**

- Future Feedback lane placement.
- No feedback form implementation unless separately approved.

---

### Ticket 7 — Drafts / History iPad Review Behavior

**Purpose:**
Plan improved iPad review behavior for drafts/history using side-by-side detail patterns.

**Expected future output:**

- Selected record detail planning.
- Review/status panel planning.
- No data model change.

---

### Ticket 8 — Testing / Acceptance Pass

**Purpose:**
Test the first runtime shell changes after implementation begins.

**Expected future output:**

- Preserve V1 workflow.
- Confirm phone support.
- Confirm iPad behavior.
- Confirm no backend/auth/database claims.
- Confirm no V1 records changed.

---

## 7. Recommended Next Runtime Milestone

**V2-M5 — Runtime Shell Inventory / Existing App Structure Map**

**Purpose:**
Before changing runtime code, inspect and document the existing app shell/navigation/runtime structure so future implementation modifies the correct files and avoids breaking V1 behavior.

V2-M5 should map the current structure first so the first runtime implementation ticket does not guess where changes belong.

---

## 8. V2-M5 Preview Acceptance Checks

V2-M5 should be accepted when the following checks are true:

- Current runtime shell files identified.
- Current navigation/screen structure summarized.
- Current phone behavior noted.
- Existing correction workflow preserved.
- Recommended implementation targets documented.
- No unnecessary runtime changes.
- No feature additions.
- No V1 records modified.

---

## 9. Runtime Change Guardrails

Future runtime changes must follow these guardrails:

- Do not rewrite the app from scratch.
- Do not break the V1 correction workflow.
- Do not remove working send/copy/draft/history behavior.
- Do not remove setup/admin behavior.
- Do not create unfinished routes without clear placeholder rules.
- Do not overbuild dashboard lanes.
- Do not add analytics charts yet.
- Do not add floor feedback form yet.
- Do not add backend/database/cloud sync.
- Do not add authentication or role permissions.
- Do not modify V1 milestone history.
- Do not chase visual polish before shell structure is stable.

These guardrails protect the pilot-ready V1 foundation while the V2 runtime shell is planned and implemented in controlled steps.

---

## 10. Chat Workflow Rule

Refab Connect V2 work should continue using separated chat responsibilities.

- Chat 1 owns planning and source of truth.
- Chat 2 executes one approved handoff at a time.
- Chat 3 reviews/testing.
- Chat 4 documentation/binder only when requested.
- Use compressed result cards.
- Pass results, not noise.

This workflow keeps implementation focused and prevents one chat from mixing planning, execution, testing, and documentation into the same noisy thread.

---

## 11. Acceptance Checks

V2-M4 is accepted when the following checks are true:

- V2-M4 document exists.
- V2-M1 through V2-M3 locked direction is referenced.
- Runtime shell implementation path is broken into controlled tickets.
- Next runtime milestone is clearly recommended.
- V2-M5 preview acceptance checks are documented.
- Runtime change guardrails are clear.
- Chat workflow rule is documented.
- No runtime files are changed.
- No navigation routes are changed.
- No app components are created.
- No V1 records are modified.
- No future shell/navigation/dashboard features are claimed as complete.

---

## 12. Next Recommended Milestone

**V2-M5 — Runtime Shell Inventory / Existing App Structure Map**

The next milestone should inspect and document the existing app shell, navigation, runtime structure, and likely implementation targets before any runtime code is changed.
