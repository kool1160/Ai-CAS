# V2-M1 — Planning / Architecture / iPad Direction

## 1. Title

**V2-M1 — Planning / Architecture / iPad Direction**

---

## 2. V1 Baseline

Refab Connect V2 starts after the completed Refab Connect Core Reskin V1 baseline.

- Refab Connect Core Reskin V1 closed at **M30**.
- **M1-M30 passed**.
- V1 is **pilot-ready with known limitations**.
- Latest runtime milestone before documentation closeout: **M29**.
- M29 commit: `0cc98109b0fca42c6f4b9e0aa2db738209c6291e`.
- M30 was **documentation/package closeout only**.

V1 proves the core correction workflow foundation and should remain the stable pilot release baseline.

---

## 3. V2 Core Rule

- **M1-M30 = V1 Core / Pilot Release**.
- **V2 starts fresh in this workspace**.
- Do **not** add V2 ideas backward into V1.

V1 closure documentation and V1 milestone records must remain separated from V2 planning and V2 implementation work.

---

## 4. V2-M1 Purpose

V2-M1 exists to define the Refab Connect V2 product layout and architecture direction before implementation begins.

The core planning decision for V2-M1 is:

**V2-M1 is product layout and architecture first.**

This milestone locks the first V2 planning layer so Refab Connect V2 starts cleanly after the V1 M30 closure baseline and moves toward an iPad-first shop-floor operating layer without drifting into unapproved runtime changes.

---

## 5. V2 Goals

Refab Connect V2 should build from the proven V1 correction workflow foundation while expanding toward a stronger shop-floor operating layer.

V2 goals:

- Expand Refab Connect from correction reporting into a shop-floor operating layer.
- Make iPad the flagship experience.
- Keep phone supported.
- Support larger supervisor / Engineering review screens.
- Use dashboard-style layouts where screen size allows.
- Support split-view workflows.
- Preserve the proven V1 correction workflow foundation.
- Prepare for future backend/auth/analytics without claiming those features exist yet.

V2 should feel less like a single-phone correction form and more like a practical operating layer for capture, confirmation, review, visibility, and follow-up.

---

## 6. V2 Non-Goals

V2-M1 is a planning and architecture milestone only.

V2-M1 non-goals:

- Do not rebuild V1 from scratch.
- Do not push V2 ideas backward into V1.
- Do not alter V1 closure documentation.
- Do not add runtime features in V2-M1.
- Do not add database/cloud sync.
- Do not add authentication.
- Do not add role permissions.
- Do not add audit logs.
- Do not claim actual evidence attachment sending/storage.
- Do not create native iOS/App Store version.
- Do not turn Refab Connect into an ERP system.
- Do not chase visual polish before architecture is locked.

Future technical planning is allowed, but future capabilities must not be described as complete until they are actually implemented and tested.

---

## 7. Proposed Future Screen Structure

The proposed future V2 screen structure is:

1. **Home / Operating Dashboard**
2. **Capture**
3. **Confirm / Details**
4. **Generate / Review**
5. **Send / Final Review**
6. **Drafts**
7. **History**
8. **Analytics / Review Preview**
9. **Setup / Admin**

This structure preserves the proven V1 correction workflow while creating room for broader operating-layer review, visibility, and future dashboard planning.

---

## 8. iPad-First Layout Direction

The iPad is the flagship V2 operating experience.

V2 should avoid making the iPad feel like a stretched phone screen. Larger screens should use space intentionally to make capture, review, confirmation, and Engineering/supervisor checking easier.

Planning direction:

- iPad is the flagship V2 operating experience.
- iPad should not feel like a stretched phone screen.
- Use two-panel layouts where useful.
- Left side = capture, input, details, extracted fields, confirmation.
- Right side = report, email draft, review, status, dashboard context.
- Larger screens should support supervisor/Engineering review better.
- Reduce unnecessary scrolling during review.
- Make side-by-side checking easier.

The iPad layout should support practical shop-floor work: capture information, compare details, review generated output, and verify readiness without constantly jumping between long vertical sections.

---

## 9. Phone Support Rule

Phone remains supported in V2.

The phone layout should keep the fast guided lane from V1 instead of becoming the main dashboard target.

Phone support rule:

- Phone remains supported.
- Phone keeps a guided vertical workflow.
- Phone is for quick capture, quick field confirmation, quick draft review, quick send, history checks, and mobile updates.
- Phone is not the primary dashboard layout target.
- iPad gets the operating layer; phone keeps the fast guided lane.

The phone should stay useful for fast floor capture and quick review, while the iPad becomes the stronger planning, checking, and operating surface.

---

## 10. Supervisor / Engineering Dashboard Planning

Supervisor and Engineering dashboard capability is future planning only in V2-M1.

Future dashboard direction may include visibility into:

- Open correction items.
- Draft status.
- Sent/history status.
- Correction categories.
- Affected parts/work orders.
- Issue trends.
- Review readiness.
- Production reality visibility.

These dashboards are **not implemented in V2-M1**.

V2-M1 only documents the direction so future implementation can happen in controlled milestones after the architecture and screen structure are locked.

---

## 11. UI Drift Guardrails

V2-M1 is not a visual redesign task.

Guardrails:

- Do not redesign visuals during V2-M1.
- Do not chase colors, icons, polish, animations, or style experiments.
- Do not add new UI components yet.
- Lock structure first.
- Architecture first, polish later.

The purpose of V2-M1 is to prevent UI drift by defining layout direction, screen structure, and operating-layer intent before runtime implementation begins.

---

## 12. Acceptance Checks

V2-M1 is accepted when the following checks are true:

- V2-M1 planning file exists.
- V1 closure is clearly separated from V2 planning.
- V2 starts fresh after M30.
- iPad-first direction is clearly defined.
- Phone support is preserved.
- Proposed future screen structure is documented.
- Split-view planning is documented.
- Supervisor/Engineering dashboard direction is documented as future planning only.
- Non-goals and guardrails are clear.
- No runtime app files are changed.
- No V1 milestone records are modified.
- No future features are claimed as complete.

---

## 13. Next Recommended Milestone

**V2-M2 — Floor Feedback / Pilot Input Capture**

The next milestone should capture structured floor feedback and pilot input before runtime implementation expands beyond the architecture direction locked in V2-M1.
