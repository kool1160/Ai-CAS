# V2-M2 — Floor Feedback / Pilot Input Capture

## 1. Title

**V2-M2 — Floor Feedback / Pilot Input Capture**

---

## 2. V2-M2 Purpose

V2-M2 defines the feedback structure needed before building Refab Connect V2 runtime features.

The purpose of this milestone is to make sure future V2 implementation is grounded in real operator, supervisor, Engineering, Quality, production, and management needs instead of guesses.

V2-M2 is still planning/source-of-truth work. It does not build a feedback UI, add runtime behavior, create a form component, or change app navigation.

---

## 3. Baseline

Refab Connect V2 continues from the locked V1 and V2-M1 planning baseline.

- V1 closed at **M30**.
- V2-M1 passed and locked.
- V2-M1 established iPad-first architecture direction.
- V2-M2 now captures floor feedback needs before implementation.

V2-M1 commit: `b11f65046022206f50c1779087bbc4f5efb2f1e4`.

---

## 4. Why Floor Feedback Matters

Refab Connect V2 must be built around real shop-floor use.

Floor feedback matters because:

- V2 must be built around real shop-floor use.
- Operators need fast capture, not complicated forms.
- Supervisors need visibility and follow-up clarity.
- Engineering needs clean correction information.
- The app should reduce confusion, not create extra work.
- Production reality must guide the next implementation steps.

The pilot input process should expose what actually slows the work down, what information is missing, what Engineering needs to fix, and what supervisors need to see before V2 runtime work expands.

---

## 5. Feedback Sources

Expected V2 pilot feedback sources:

- Operators / welders.
- Leads.
- Supervisors.
- Engineering.
- Quality.
- Production / scheduling.
- Management / owner review.

These sources should help identify both floor-level friction and review-level needs before app behavior is expanded.

---

## 6. Feedback Categories

Future pilot feedback should be organized into practical categories tied to correction, visibility, and follow-up.

Feedback categories:

- Capture friction.
- Missing work-order information.
- Routing or operation issues.
- Incorrect times.
- Fixture or holding issues.
- Drawing/print clarity issues.
- Welding-specific correction needs.
- Machining-specific correction needs.
- Laser/cutting-specific correction needs.
- Engineering response needs.
- Repeat issues.
- Urgency / production impact.
- Evidence/photo usefulness.
- Draft/report clarity.
- Email routing clarity.
- History/search usefulness.

These categories should keep future input structured without turning the pilot into an oversized inspection form.

---

## 7. Pilot Input Fields

A future pilot feedback record should be simple, structured, and useful for review.

Proposed pilot feedback fields:

- Feedback ID.
- Date.
- Submitted by.
- Role / department.
- Work order number.
- Part number.
- Correction category.
- Issue type.
- What happened.
- What slowed the job down.
- What information was missing or wrong.
- Impact on production.
- Suggested correction.
- Evidence/photo needed.
- Urgency level.
- Follow-up owner.
- Status.
- Notes.

These fields are planning only in V2-M2. They define future structure but do not create storage, forms, screens, or runtime behavior.

---

## 8. Feedback Status Flow

Future feedback should use a simple status flow that supports review and follow-up without becoming too heavy.

Status flow:

1. **New**
2. **Reviewed**
3. **Needs Action**
4. **Waiting**
5. **Resolved**
6. **Closed**

This flow should help supervisors and Engineering understand where feedback stands without requiring a full workflow system in the first pilot pass.

---

## 9. iPad-First Feedback Review Direction

V2-M2 preserves the V2-M1 iPad-first direction.

Future iPad feedback review direction:

- iPad should show feedback details and review status side by side.
- Left side = feedback details / work-order context.
- Right side = review notes / action status / related report.
- Supervisors and Engineering should be able to review without digging through long phone-style stacks.

The iPad should support review and comparison work better than a stretched phone layout. The future layout should help users see what happened, what needs action, and what report or correction item it relates to.

---

## 10. Phone Support Direction

Phone remains supported as a fast guided workflow.

Phone support direction:

- Phone should support quick feedback capture.
- Phone should not become a complex dashboard.
- Phone should keep a fast guided input flow.

Phone should remain practical for quick floor capture, quick notes, and mobile updates, while iPad remains the stronger review and operating surface.

---

## 11. Supervisor / Engineering Use

Pilot feedback should help supervisors and Engineering understand what is happening on the floor and what needs follow-up.

Feedback should help users:

- Identify repeat correction problems.
- See what is waiting on Engineering.
- Understand production impact.
- Separate urgent from non-urgent items.
- Improve future correction report quality.
- Prepare for future dashboard/analytics work.

This planning supports future dashboard and analytics direction without implementing dashboards or analytics charts in V2-M2.

---

## 12. Non-Goals

V2-M2 is planning/source-of-truth work only.

V2-M2 non-goals:

- Do not build the feedback form yet.
- Do not add runtime app screens yet.
- Do not add backend/database/cloud sync.
- Do not add authentication or role permissions.
- Do not add dashboard implementation.
- Do not modify V1 records.
- Do not redesign UI.
- Do not add analytics charts yet.
- Do not claim feedback storage exists beyond planning.

Future runtime implementation must be handled in later approved milestones.

---

## 13. Guardrails

V2-M2 guardrails:

- Keep feedback capture simple.
- Do not overbuild the first pilot flow.
- Do not turn feedback into a long inspection form.
- Capture only what helps correction, visibility, and follow-up.
- Preserve the V2-M1 iPad-first direction.
- Avoid UI drift.
- Architecture and workflow clarity come before polish.

The pilot feedback structure should stay lean enough for real shop-floor use while still giving supervisors and Engineering useful follow-up information.

---

## 14. Acceptance Checks

V2-M2 is accepted when the following checks are true:

- V2-M2 document exists.
- Floor feedback purpose is clearly defined.
- Feedback sources are documented.
- Feedback categories are documented.
- Pilot input fields are documented.
- Simple feedback status flow is documented.
- iPad-first review direction is preserved.
- Phone support direction is preserved.
- Supervisor / Engineering use is documented.
- Non-goals and guardrails are clear.
- No runtime files are changed.
- No V1 records are modified.
- No future backend/auth/dashboard features are claimed as complete.

---

## 15. Next Recommended Milestone

**V2-M3 — iPad Operating Shell / Navigation Planning**

The next milestone should plan the iPad operating shell and navigation structure before runtime app screens or components are added.
