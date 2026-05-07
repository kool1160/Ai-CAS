# V2-M3 — iPad Operating Shell / Navigation Planning

## 1. Title

**V2-M3 — iPad Operating Shell / Navigation Planning**

---

## 2. V2-M3 Purpose

V2-M3 defines the planned iPad-first operating shell, navigation hierarchy, and responsive layout rules before implementation.

This milestone clarifies how Refab Connect V2 should organize its main operating areas, responsive layout behavior, and navigation hierarchy before runtime app changes begin.

V2-M3 is still planning/source-of-truth work. It does not build the shell, change app navigation, add runtime behavior, create components, or redesign visuals.

---

## 3. Baseline

Refab Connect V2 continues from the locked V1, V2-M1, and V2-M2 planning baseline.

- V1 closed at **M30**.
- V2-M1 passed and locked.
- V2-M1 established iPad-first architecture direction.
- V2-M2 passed and locked.
- V2-M2 established floor feedback / pilot input planning.
- V2-M3 now plans the operating shell and navigation structure.

V2-M1 commit: `b11f65046022206f50c1779087bbc4f5efb2f1e4`.

V2-M2 commit reviewed: `f0a5babe87f56c42e436ecab9096a8fbf77da465`.

---

## 4. Why the Operating Shell Matters

Refab Connect V2 needs a stronger operating shell before feature expansion begins.

The operating shell matters because:

- V2 needs a stronger shell before feature expansion.
- The app should feel like an operating layer, not a stack of disconnected screens.
- Supervisors and Engineering need faster access to review/status areas.
- Operators need simple capture and confirmation access.
- The shell should support future dashboards without forcing them into the current V1 layout.
- Navigation should reduce confusion and prevent feature drift.

The shell should give Refab Connect V2 a clear structure before new runtime features, screens, dashboards, or feedback workflows are introduced.

---

## 5. Proposed iPad Shell Areas

Planned iPad shell areas:

- Top operating header.
- Primary navigation area.
- Main work area.
- Secondary review/status panel.
- Persistent workflow/status summary.
- Admin/setup access area.
- Draft/history access area.
- Future analytics/review access area.

These areas define future layout responsibilities only. They do not create UI components or runtime behavior in V2-M3.

---

## 6. Proposed Primary Navigation Structure

Future primary navigation groups:

1. **Dashboard**
2. **Capture**
3. **Review**
4. **Drafts**
5. **History**
6. **Feedback**
7. **Analytics Preview**
8. **Setup**

This structure should keep core correction workflow areas easy to access while giving future floor feedback, review, and analytics planning a clear navigation home.

---

## 7. Navigation Purpose by Area

### Dashboard

Planned purpose:

- Operating overview.
- Open items summary.
- Drafts/sent/history summary.
- Supervisor review cues.

### Capture

Planned purpose:

- Work-order image capture/upload.
- Manual fallback.
- Quick start for operators.

### Review

Planned purpose:

- Confirm extracted details.
- Generate/review report.
- Generate/review email draft.
- Send readiness.

### Drafts

Planned purpose:

- Saved reports/email drafts.
- Reopen and continue work.

### History

Planned purpose:

- Completed/sent records.
- Lookup past correction activity.

### Feedback

Planned purpose:

- Future floor feedback / pilot input review.
- Operator/supervisor feedback visibility.

### Analytics Preview

Planned purpose:

- Local-only summary planning.
- Correction categories.
- Repeat issues.
- Review patterns.
- No real analytics implementation yet.

### Setup

Planned purpose:

- Master-code protected settings.
- Engineering recipient.
- Submitted-by/company defaults.
- Local configuration.

---

## 8. iPad Layout Planning

The iPad should use a wide operating layout that takes advantage of screen space without becoming cluttered.

Planning direction:

- iPad should use a wide operating layout.
- Main content should not feel like a stretched phone page.
- Use split-view layout where useful.
- Left/main area should hold active workflow content.
- Right/secondary area should hold review, status, related report, email draft, or feedback context.
- Dashboard-style summaries should use horizontal space.
- Important status should be visible without excessive scrolling.

The iPad should feel like the flagship operating shell for V2, not a scaled-up phone workflow.

---

## 9. Split-View Behavior Rules

Split-view should improve clarity, review speed, and side-by-side checking.

Planned split-view behavior rules:

- Capture + confirmation can sit beside review/status.
- Work-order details can sit beside generated report/email draft.
- Feedback detail can sit beside review/action status.
- Draft/history records can sit beside selected record detail.
- Analytics preview can sit beside filtered record summaries.
- Split view should support clarity, not clutter.

Split-view should be used only where it helps users compare, confirm, review, or act faster.

---

## 10. Phone Layout Planning

Phone remains supported as a fast guided workflow.

Phone layout planning:

- Phone remains supported.
- Phone uses guided vertical workflow.
- Phone navigation should stay simple.
- Phone should prioritize Capture, Confirm, Generate/Review, Send, Drafts, History, and Setup.
- Phone should not force complex dashboard panels.
- Phone is for fast shop-floor input and quick review.
- iPad is the flagship operating shell.

Phone should stay focused on quick capture and review instead of becoming the primary dashboard surface.

---

## 11. Supervisor / Engineering Shell Needs

Future supervisor and Engineering shell needs:

- Quick access to open correction items.
- Clear draft/review status.
- Visibility into waiting items.
- Ability to see what needs Engineering action.
- Ability to review correction detail and email/report side by side.
- Ability to identify repeat issues later.
- Ability to separate urgent from non-urgent work.

These needs guide future operating shell design without implementing supervisor or Engineering dashboards in V2-M3.

---

## 12. Floor Feedback Connection

V2-M3 connects back to the V2-M2 floor feedback / pilot input planning direction.

Planning connection:

- Feedback must have a future navigation home.
- Feedback should not be buried.
- Feedback review should support iPad split-view.
- Feedback should eventually connect to correction records, review status, and supervisor visibility.
- V2-M3 only plans this connection; it does not implement it.

The Feedback navigation area is included so future pilot input can become visible and useful without being hidden inside unrelated screens.

---

## 13. Non-Goals

V2-M3 is planning/source-of-truth work only.

V2-M3 non-goals:

- Do not build the operating shell yet.
- Do not change live navigation.
- Do not add routes.
- Do not add components.
- Do not add feedback screens.
- Do not add dashboard screens.
- Do not add analytics charts.
- Do not add backend/database/cloud sync.
- Do not add authentication or role permissions.
- Do not modify V1 records.
- Do not redesign UI visuals.
- Do not claim planned navigation is implemented.

Future runtime implementation must be handled in later approved milestones.

---

## 14. Guardrails

V2-M3 guardrails:

- Architecture first, implementation later.
- Keep navigation practical for shop-floor use.
- Do not overbuild the first V2 shell.
- Do not create too many lanes too early.
- Keep Capture and Review easy to find.
- Keep Setup protected and separate.
- Preserve iPad-first direction.
- Preserve phone support.
- Avoid UI drift.
- Do not chase polish before structure is locked.

The shell should be planned clearly before design polish, visual changes, or runtime feature expansion begins.

---

## 15. Acceptance Checks

V2-M3 is accepted when the following checks are true:

- V2-M3 document exists.
- Operating shell purpose is clearly defined.
- Proposed shell areas are documented.
- Primary navigation structure is documented.
- Navigation purpose by area is documented.
- iPad layout planning is documented.
- Split-view behavior rules are documented.
- Phone layout planning is documented.
- Supervisor / Engineering shell needs are documented.
- V2-M2 floor feedback connection is documented.
- Non-goals and guardrails are clear.
- No runtime files are changed.
- No navigation routes are changed.
- No V1 records are modified.
- No future shell/navigation/dashboard features are claimed as complete.

---

## 16. Next Recommended Milestone

**V2-M4 — Runtime Shell Implementation Planning / Ticket Breakdown**

The next milestone should break the planned operating shell and navigation direction into controlled implementation tickets before any runtime code changes are made.
