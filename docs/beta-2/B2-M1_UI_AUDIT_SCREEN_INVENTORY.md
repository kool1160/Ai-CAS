# B2-M1 — UI Audit & Screen Inventory

Project: AI-CAS — Corrective Action System  
Phase: Beta 2  
Milestone: B2-M1 — UI Audit & Screen Inventory  
Branch: feature/v4-m13-structured-corrective-action  
Type: Documentation only

## Purpose

This document inventories the current AI-CAS screens before any Beta 2 UI refresh work begins.

The goal is to document what exists, what each screen does, what should be preserved, and where Beta 2 can improve usability without changing the workflow.

## Scope Guard

This audit does not redesign screens, change runtime code, add features, change backend/email/PDF logic, or change workflow.

Beta 2 UI refresh work should use this document as a baseline before proposing visual or layout changes.

## Current Screen List

Current AI-CAS screen flow:

1. Home
2. Capture
3. Confirm
4. Generate / Correction Context
5. Review / Send
6. Drafts
7. History
8. More / Setup / Beta Feedback

The active runtime screen set is controlled by the AI-CAS app shell and bottom navigation. The main workflow remains Capture Issue → Extract + Confirm → Build Correction → Generate Draft → Confirm + Save.

---

# 1. Home

## Current Purpose

Home introduces AI-CAS as the active corrective-action system and gives the user a clear starting point.

## Primary User Action

Start Correction.

## Secondary Actions

Review the workflow preview cards.

## Current Pain Points

The Home screen is simple and strong, but the workflow preview may need tighter visual hierarchy during Beta 2 polish.

The screen should avoid feeling like a marketing page once operators are already using the tool daily.

## Beta 2 Refresh Opportunities

Make the Start Correction action visually dominant.

Keep the workflow preview readable but secondary.

Improve spacing for iPhone and iPad without adding new content.

Consider making the screen feel more like a production tool launch panel than a general landing page.

## Preserve Rules

Preserve AI-CAS branding.

Preserve the Start Correction entry point.

Preserve the simple workflow preview.

Do not add dashboards, analytics, admin controls, or extra navigation to Home.

---

# 2. Capture

## Current Purpose

Capture lets the user take or upload a router/work order image, extract job context with AI Vision, optionally add a short issue note, optionally attach evidence, and continue to Confirm.

## Primary User Action

Take/upload router or work order image and extract with AI Vision.

## Secondary Actions

Clear upload.

Skip to Confirm.

Add optional issue note.

Add optional evidence photo and evidence label.

Use manual fallback.

## Current Pain Points

Capture contains several useful paths, but density can grow quickly because router upload, AI extraction, issue note, evidence photo, and manual fallback all live on one screen.

Optional areas are already collapsed in places, but the user may still need clearer visual separation between required capture and optional support evidence.

Status feedback must stay obvious because extraction success/failure directly affects user confidence.

## Beta 2 Refresh Opportunities

Strengthen required-versus-optional hierarchy.

Keep AI Vision first, but make manual fallback easy to find when needed.

Improve mobile spacing around upload buttons and extraction status.

Make evidence UI feel supportive rather than mandatory.

Clarify that rough shop-floor notes are acceptable.

## Preserve Rules

Preserve Take Photo, Upload Image, Extract with AI Vision, Clear Upload, Skip to Confirm, optional Issue Note, optional Evidence Photo, and Manual Fallback.

Preserve local/session-only evidence behavior.

Preserve manual fallback.

Do not change extraction logic, evidence storage logic, backend routes, or workflow sequence.

---

# 3. Confirm

## Current Purpose

Confirm allows the user to review and confirm extracted work order and part information before AI-CAS uses it downstream.

## Primary User Action

Confirm required Work Order and Part Number fields.

## Secondary Actions

Edit extracted fields.

Confirm all required fields.

Review secondary extracted job fields.

Review uploaded router context as read-only supporting context.

Continue to Build Correction.

## Current Pain Points

Confirm is functionally clear, but it can feel field-heavy if too many optional fields appear at once.

The key action is confirmation, so the UI should not make users feel like they are re-entering the whole work order.

## Beta 2 Refresh Opportunities

Make Work Order and Part Number confirmation feel like the obvious center of the screen.

Keep secondary fields collapsed or visually secondary.

Improve status chips for Review / Confirmed.

Make the Continue button state easier to understand when locked.

## Preserve Rules

Preserve Work Order and Part Number confirmation gates.

Preserve edit capability for extracted fields.

Preserve read-only uploaded router context as supporting information only.

Do not allow extracted data to become official without confirmation.

Do not change gate logic.

---

# 4. Generate / Correction Context

## Current Purpose

Generate / Correction Context lets the operator describe the issue in plain language and select the correction type, affected department, and operation/equipment.

## Primary User Action

Describe the issue and draft corrective action with AI.

## Secondary Actions

Review captured job context.

Select correction type.

Select affected department / area.

Select operation / equipment.

Use advanced/manual controls when needed.

## Current Pain Points

The core Simple Mode idea is strong, but the page must prevent advanced controls from visually competing with the simple operator entry.

The issue description field is the most important input and should feel easy, safe, and low-pressure.

## Beta 2 Refresh Opportunities

Make the plain-language issue box feel like the main work area.

Improve Correction Context grouping so selections feel connected.

Keep advanced/manual controls collapsed and clearly optional.

Improve mobile spacing for long text entry.

Make the disabled Draft button reason more obvious.

## Preserve Rules

Preserve Simple Mode.

Preserve rough shop-floor wording support.

Preserve correction type, affected department, and operation/equipment selection.

Preserve advanced/manual controls as optional/collapsed.

Do not change AI draft generation logic or workflow gates.

---

# 5. Review / Send

## Current Purpose

Review / Send lets the user review the AI-generated corrective-action draft, review confirmed job context, manage review-step evidence, confirm human final review, copy/save/download/send controlled outputs, and keep advanced editing tools available but collapsed.

## Primary User Action

Human final review confirmation before output release.

## Secondary Actions

Review confirmed job context.

Review corrective-action draft.

Review evidence summary.

Copy report draft.

Copy email draft.

Save draft.

Download PDF after review confirmation.

Send reviewed email with controlled PDF after review confirmation.

Use advanced editing / evidence tools if needed.

## Current Pain Points

Review / Send is the densest and most important screen.

There are many output actions, and Beta 2 should make the release sequence feel safe and obvious.

The user must understand what is draft, what is reviewed, and what is allowed only after final confirmation.

## Beta 2 Refresh Opportunities

Make the human review gate visually unmistakable.

Group actions by risk: copy/save first, controlled PDF/send after review.

Keep advanced editing collapsed but discoverable.

Improve evidence status clarity.

Make status messages easier to scan after PDF/email actions.

## Preserve Rules

Preserve final human review gate.

Preserve copy report, copy email, save draft, PDF download, and reviewed email with PDF behavior.

Preserve send gating.

Preserve disabled legacy text-only send control.

Preserve advanced editing/evidence tools as collapsed optional tools.

Do not change email/PDF/backend logic.

---

# 6. Drafts

## Current Purpose

Drafts lists saved correction packages stored on the current browser and lets users open, review, copy, print/export, and send reviewed saved drafts.

## Primary User Action

Open a saved draft.

## Secondary Actions

Copy saved report.

Copy saved email draft.

Export / print report.

Confirm final review for saved draft.

Send reviewed email.

## Current Pain Points

Draft records can contain long subject lines and report previews, so visual scanning may become heavy as draft count grows.

The saved draft detail panel must clearly separate review, copy/export, and send actions.

## Beta 2 Refresh Opportunities

Improve list scannability with clearer record cards.

Make selected draft state more obvious.

Keep final review confirmation close to send action.

Improve mobile spacing around copy/export/send controls.

## Preserve Rules

Preserve local saved draft behavior.

Preserve final review confirmation before sending saved draft.

Preserve copy, print/export, and send reviewed email actions.

Do not change storage, send logic, or record model.

---

# 7. History

## Current Purpose

History shows local analytics summary, local record counts, completed history records, and selected history detail.

## Primary User Action

Review completed correction history and local record summary.

## Secondary Actions

Open a history record.

Review saved engineering report draft.

Review saved email draft.

Review evidence status.

View disabled future export note.

Clear local records when available through provided controls.

## Current Pain Points

History currently combines dashboard/analytics and completed records in one lane, which can feel like two different purposes.

Record detail panels may become dense with long report/email previews.

## Beta 2 Refresh Opportunities

Clarify Dashboard / History naming and hierarchy.

Make local records and completed records easier to scan separately.

Improve selected history detail spacing.

Keep disabled future export behavior clear without making it feel broken.

## Preserve Rules

Preserve local history records.

Preserve analytics preview.

Preserve disabled uncontrolled export/release behavior.

Preserve evidence status display.

Do not add new export flows or record systems.

---

# 8. More / Setup / Beta Feedback

## Current Purpose

More contains operator access information, settings/help, beta feedback/report issue link, and setup/admin controls.

## Primary User Action

Access setup/help or report beta issue.

## Secondary Actions

Lock app.

Reset saved operator if available.

Unlock setup with master code.

Edit company name, engineering recipient email, sender display name, default operator name, and default operator email.

Save setup.

Lock setup.

Report beta issue by email.

## Current Pain Points

More holds different types of actions: operator access, help, beta feedback, and setup/admin.

Setup controls are important but should not visually overwhelm beta feedback or help.

Beta feedback should be easy to find during testing.

## Beta 2 Refresh Opportunities

Separate operator, help, feedback, and setup sections more clearly.

Make Beta Feedback / Report Issue more prominent during Beta 2 testing.

Keep setup/admin visually contained and guarded by master code.

Improve mobile spacing for stacked setup fields.

## Preserve Rules

Preserve current operator info.

Preserve Lock App behavior.

Preserve Beta Feedback / Report Issue mailto path.

Preserve setup master-code gate.

Preserve setup fields and save/lock behavior.

Do not add backend admin, roles, permissions, login expansion, or enterprise security planning.

---

# Cross-Screen Audit Notes

## Button Hierarchy

Primary actions should be visually dominant and limited per screen.

Secondary actions should remain available but quieter.

Danger/send actions should remain clearly separated from draft/copy/save actions.

Final send/download actions should stay gated by human review where applicable.

## Screen Density

Capture, Generate, Review / Send, and More are the highest-density screens.

Beta 2 refresh should reduce visual competition without removing current functionality.

Optional sections should stay collapsed or visually secondary.

## Mobile Spacing

Buttons need enough vertical spacing for phone use.

Long text fields need breathing room.

Record lists and preview boxes need better scan rhythm on small screens.

Avoid horizontal drift, clipped controls, or cramped bottom navigation.

## Status Messages

Status messages should stay close to the action that caused them.

Success and error states should remain clear.

AI Vision, PDF, email, save, send, and setup messages should not be buried below unrelated content.

## Evidence UI

Evidence exists in Capture and Review / Send.

Capture evidence should remain optional and supportive.

Review evidence should remain limited and review-focused.

Evidence handling should not imply unsupported release behavior.

## Review / Send UX

Review / Send must lead with professional draft review and human confirmation.

Raw/advanced tools should stay available but not dominate the main path.

The release sequence should remain: review → confirm → copy/save/download/send.

## Preserve Rules Across Beta 2

Preserve current workflow.

Preserve human review gate.

Preserve Simple Mode.

Preserve AI-CAS branding.

Preserve local Drafts and History behavior.

Preserve Beta Feedback path.

Preserve setup/admin gating.

Do not change backend/email/PDF logic.

Do not add new features during UI audit.

Do not redesign screens as part of this milestone.

## Beta 2 Refresh Opportunity Summary

Beta 2 UI refresh should focus on clarity, spacing, hierarchy, and confidence.

Highest-value targets:

1. Make the primary action on each screen obvious.
2. Reduce density on Capture, Generate, Review / Send, and More.
3. Improve mobile spacing and scan rhythm.
4. Keep optional and advanced tools collapsed or visually secondary.
5. Make human-review gates and output status messages clearer.
6. Preserve the current workflow exactly until a separate approved implementation milestone.