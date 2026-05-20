# B2-M2 — Design Tokens & Type Scale Foundation

Project: AI-CAS — Corrective Action System  
Phase: Beta 2  
Milestone: B2-M2 — Design Tokens & Type Scale Foundation  
Branch: feature/v4-m13-structured-corrective-action  
Type: Documentation only

## Purpose

This document defines the Beta 2 visual foundation for future AI-CAS UI refresh work.

The goal is to give future milestones a consistent visual source of truth for colors, button hierarchy, spacing, type scale, cards, headers, and mobile touch targets before runtime UI changes begin.

This milestone does not change runtime UI, app screens, workflow, PDF logic, email logic, backend logic, or dependencies.

## Visual Direction

AI-CAS should feel like a simple, trusted production tool.

The interface should be:

- Clear
- Guided
- Fast
- Calm under pressure
- Easy to scan on mobile
- Professional without feeling corporate-heavy
- Simple in front, powerful underneath

The design system should reduce friction for real manufacturing users, especially on Capture, Generate, Review / Send, Drafts, History, and More.

---

# 1. Core Color Roles

## Primary Action Color

Use primary action styling for the next safest forward step in the workflow.

Recommended role:

```text
Primary Action = confident blue / AI-CAS action color
```

Use for:

- Start Correction
- Extract with AI Vision
- Continue to Build Correction
- Draft Corrective Action with AI
- Download PDF after final review
- Send Reviewed Email with PDF after final review

Guidance:

Primary buttons should feel strong, trusted, and clearly actionable.

Primary actions should not be visually confused with destructive actions.

## Secondary Action Style

Use secondary styling for supporting actions that do not advance or release the workflow by themselves.

Recommended role:

```text
Secondary Action = neutral glass / outlined / lower-emphasis style
```

Use for:

- Clear Upload
- Skip to Confirm
- Copy Report Draft
- Copy Email Draft
- Save Draft
- Open Draft
- Export / Print Report
- Lock App
- Lock Setup

Guidance:

Secondary actions should remain easy to find but should not compete with the main path.

## Destructive Action Style

Use destructive styling only for actions that delete, clear, reset, remove, or permanently discard something.

Recommended role:

```text
Destructive Action = red / danger style
```

Use for:

- Reset Saved Operator
- Clear Local Records
- Clear destructive data if future approved
- Remove actions only when they delete or discard user data

Do not use red/danger styling for normal controlled send actions.

## Warning / Caution Style

Use warning styling for caution, review-needed, incomplete, or non-blocking risk messages.

Recommended role:

```text
Warning = amber / caution style
```

Use for:

- Missing optional fields
- Review needed
- Known limitation
- Manual fallback notice
- Non-blocking readiness warning
- Evidence not labeled yet

Warning does not always mean the user is blocked.

## Success Style

Use success styling for completed, confirmed, ready, saved, sent, or verified states.

Recommended role:

```text
Success = green / confirmed style
```

Use for:

- Confirmed fields
- Required fields complete
- Draft saved
- AI extraction complete
- Review confirmed
- Email sent
- Setup saved

## Error Style

Use error styling for failed operations, blocked states, or actions the user cannot complete.

Recommended role:

```text
Error = red text/status, not always red button
```

Use for:

- AI Vision failure
- PDF generation failure
- Email send failure
- Setup unlock failure
- Required field missing when action is attempted
- Invalid PIN or access error

Guidance:

Error messages can use red emphasis.

Buttons should only use red if the action itself is destructive.

---

# 2. Send Action Styling Rule

Send actions are controlled primary actions, not destructive actions.

## Required Guidance

Use primary styling for reviewed send actions when the user has passed the required human review gate.

Examples:

```text
Send Reviewed Email with PDF = controlled primary action
Send Reviewed Email = controlled primary action
```

Do not style reviewed send actions as red/danger unless the action deletes, resets, removes, or discards something.

## Why

Red/danger styling teaches the user that a button is harmful or destructive.

A reviewed send action is high-importance, but it is not destructive when gated correctly.

The correct hierarchy is:

```text
Draft / Review / Confirm → Primary Send Action
Delete / Reset / Clear → Destructive Red Action
```

---

# 3. Neutral Card Style

Neutral cards should carry most screen content.

Recommended card role:

```text
Neutral Card = dark glass / soft border / clear internal spacing
```

Use for:

- Workflow cards
- Capture panels
- Confirm field groups
- Generate context blocks
- Review draft panels
- Draft/history record cards
- More/setup panels

Guidance:

Cards should group related tasks without making every section look equally important.

Use stronger card emphasis only for the active work area.

Avoid making every card glow or compete.

---

# 4. Section Header Style

Section headers should explain what the user is doing now.

Recommended hierarchy:

```text
Screen Title = large, clear, task-focused
Section Header = medium, action/context-focused
Step Pill = small, uppercase, support label
Helper Text = smaller, plain-language instruction
```

Examples:

```text
Screen Title: Capture Router
Section Header: Upload Router / Work Order
Step Pill: AI VISION FIRST
Helper Text: Take a photo or upload an image, then extract the job fields.
```

Guidance:

Headers should reduce thinking.

Avoid vague headers like “Details” when a more useful label exists.

---

# 5. Mobile Spacing Scale

Beta 2 mobile spacing should use a simple repeatable scale.

Recommended spacing tokens:

```text
space-1 = 4px
space-2 = 8px
space-3 = 12px
space-4 = 16px
space-5 = 20px
space-6 = 24px
space-7 = 32px
space-8 = 40px
```

Usage guidance:

```text
4px: tight text relationships only
8px: label-to-field spacing
12px: compact internal row spacing
16px: default card internal spacing on mobile
20px: major control spacing
24px: screen section spacing
32px: major screen group separation
40px: hero or major top/bottom breathing room
```

Mobile spacing priorities:

- Keep buttons easy to tap
- Separate primary and destructive actions clearly
- Avoid dense stacked fields with no breathing room
- Keep status messages close to the action that caused them
- Avoid horizontal scrolling
- Avoid clipped bottom controls

---

# 6. Type Scale

Beta 2 should use a simple type scale that works on phone and tablet.

Recommended type tokens:

```text
type-xs = 12px
type-sm = 14px
type-base = 16px
type-md = 18px
type-lg = 22px
type-xl = 28px
type-hero = 34px
```

Usage guidance:

```text
type-xs: status labels, step pills, metadata
type-sm: helper text, secondary descriptions
type-base: field text, body text, button text
type-md: card titles, important labels
type-lg: section titles
type-xl: screen titles
type-hero: Home hero only when space allows
```

Line-height guidance:

```text
Dense labels: 1.2–1.3
Body/helper text: 1.4–1.55
Preview/report text: 1.45–1.6
```

Rule:

Do not make report preview text too small. It must remain readable during review.

---

# 7. Minimum Touch Target Guidance

Primary actions should target 56px minimum height on mobile.

Minimum guidance:

```text
Primary buttons: 56px minimum height
Secondary buttons: 48px minimum height
Small chips/status controls: 36px minimum height when non-interactive
Interactive tap target: 44px absolute minimum
```

Recommended button padding:

```text
Primary mobile button: 16px vertical / 18px horizontal
Secondary mobile button: 12px vertical / 16px horizontal
Full-width action buttons: preferred for primary mobile workflow steps
```

Rule:

If a button advances the workflow or releases output, make it large enough to tap confidently.

---

# 8. Button Hierarchy Rules

## Primary Buttons

Use for the main forward action on each screen.

Examples:

- Start Correction
- Extract with AI Vision
- Continue to Build Correction
- Draft Corrective Action with AI
- Download PDF
- Send Reviewed Email with PDF

Rules:

- One primary action should dominate each screen section.
- Primary actions should be at least 56px high on mobile.
- Primary actions should not be red unless they are destructive, which should be rare.

## Secondary Buttons

Use for support actions.

Examples:

- Clear Upload
- Copy Report Draft
- Copy Email Draft
- Save Draft
- Open Draft
- Lock Setup

Rules:

- Secondary buttons should be visible but quieter.
- Secondary buttons may sit near primary buttons but should not compete visually.

## Destructive Buttons

Use only for delete/reset/clear actions.

Examples:

- Reset Saved Operator
- Clear Local Records
- Remove Photo

Rules:

- Red/danger styling is only for destructive or error actions.
- Never use red solely because an action is important.

## Disabled Buttons

Disabled actions should explain why they are unavailable.

Examples:

- Missing required fields
- Human final review not confirmed
- No generated package available
- No selected draft

Guidance:

Keep disabled-state explanation close to the button.

---

# 9. Status Message Style

Status messages should be attached to the workflow step where the action happened.

Recommended status types:

```text
Info: neutral helper status
Success: action completed
Warning: review needed or non-blocking issue
Error: action failed or blocked
```

Status placement rules:

- Put AI Vision status near extraction controls.
- Put PDF/email status near Review / Send controls.
- Put setup status near setup controls.
- Put draft save/send status near Drafts actions.
- Do not bury important status at the bottom of a long screen.

---

# 10. Evidence UI Style

Evidence should support the issue without overwhelming the operator.

Capture evidence guidance:

- Keep optional evidence collapsed or visually secondary.
- Show file name, type, size, and label when attached.
- Keep photo preview clear but not oversized.

Review evidence guidance:

- Show evidence count clearly.
- Limit visual clutter.
- Keep labels and captions editable in advanced tools.
- Do not imply unsupported release behavior.

Rule:

Evidence UI should help reviewers understand the issue faster, not turn operators into clerks.

---

# 11. Review / Send Screen Hierarchy

Review / Send needs clearer hierarchy in future milestones.

Recommended future hierarchy:

```text
1. Confirmed Job Context
2. Professional Corrective Action Draft
3. Evidence Summary
4. Human Final Review Gate
5. Safe Output Actions
6. Advanced Editing / Evidence Tools collapsed
```

Action grouping:

```text
Low-risk actions:
Copy Report Draft
Copy Email Draft
Save Draft

Controlled release actions:
Download PDF
Send Reviewed Email with PDF

Destructive actions:
None unless deleting/removing data
```

Required guidance:

Send actions are controlled primary actions, not destructive actions.

Red/danger styling is only for destructive or error actions.

Human final review must remain visually clear and functionally preserved.

---

# 12. Screen-Level Design Token Application

## Home

Primary: Start Correction

Secondary: workflow preview only

Focus: simple launch, not dashboard expansion

## Capture

Primary: Extract with AI Vision

Secondary: Take Photo, Upload Image, Clear Upload, Skip to Confirm

Focus: required capture first, optional evidence second

## Confirm

Primary: Continue to Build Correction

Secondary: Confirm individual fields, Confirm Required Fields

Focus: Work Order and Part Number confirmation

## Generate / Correction Context

Primary: Draft Corrective Action with AI

Secondary: advanced/manual controls collapsed

Focus: plain-language issue entry and correction context

## Review / Send

Primary: controlled output actions after review confirmation

Secondary: copy/save actions

Destructive: none by default

Focus: professional draft review and human final review gate

## Drafts

Primary: Open Draft or Send Reviewed Email depending on context

Secondary: copy/export actions

Destructive: none unless future delete is approved

Focus: saved record scannability

## History

Primary: Open History

Secondary: local record review

Destructive: Clear Local Records only if visible/approved

Focus: history and analytics separation

## More / Setup / Beta Feedback

Primary: Report Beta Issue during beta testing, Save Setup when setup is unlocked

Secondary: Lock App, Lock Setup

Destructive: Reset Saved Operator only

Focus: separate operator/help/feedback/setup areas

---

# 13. Beta 2 Preserve Rules

Preserve:

- Current workflow
- Simple Mode
- Human review gate
- AI-CAS branding
- Local Drafts and History behavior
- Beta Feedback path
- Setup/Admin gate
- Existing PDF/email/backend behavior
- Existing screen inventory

Do not change:

- Runtime screens in this milestone
- Backend routes
- Email logic
- PDF logic
- Workflow gates
- Dependencies
- Data model
- Storage behavior

---

# 14. Future Milestone Use

Future Beta 2 UI milestones should reference this file before making visual changes.

Use this document to decide:

- Button color and hierarchy
- Which action should be primary
- Whether red/danger styling is appropriate
- Mobile spacing and touch target sizing
- Section header hierarchy
- Review / Send release hierarchy
- Evidence UI emphasis
- Status message placement

Final rule:

Do not redesign the whole app at once. Use these tokens to make one approved screen or UI layer cleaner at a time.