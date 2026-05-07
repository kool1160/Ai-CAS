# V2-M5 — Runtime Shell Inventory / Existing App Structure Map

## 1. Title

**V2-M5 — Runtime Shell Inventory / Existing App Structure Map**

---

## 2. V2-M5 Purpose

V2-M5 documents the current runtime structure before V2 shell implementation begins.

This milestone identifies the existing app shell, navigation/screen structure, workflow areas, likely implementation targets, and risk areas so future V2 runtime work can modify the correct files without breaking V1 behavior.

V2-M5 is inspection and documentation only. It does not change runtime behavior, create app components, change navigation routes, redesign UI, or add features.

---

## 3. Baseline

Refab Connect V2 continues from the locked V1 and V2 planning baseline.

- V1 closed at **M30**.
- V2-M1 through V2-M4 passed and locked.
- V2-M4 recommended runtime shell inventory before runtime shell changes.
- V2-M5 performs that inventory without changing app behavior.

Locked planning commits:

- V2-M1 commit: `b11f65046022206f50c1779087bbc4f5efb2f1e4`.
- V2-M2 commit reviewed: `f0a5babe87f56c42e436ecab9096a8fbf77da465`.
- V2-M3 commit reviewed: `acfb4c98081dc9ed71b4731af5c4b37e3487f13f`.
- V2-M4 commit reviewed: `e7c742bac41a595e4e94acfa5e8e8bfdc2e82e42`.

---

## 4. Repository / Runtime Structure Summary

### Framework / Project Type

The app is a **Next.js** project using React and TypeScript.

Visible project indicators:

- `package.json`
  - Scripts: `next dev`, `next build`, `next start`.
  - Dependencies include `next`, `react`, `react-dom`, and `resend`.

### Main Source Directories

Observed runtime/source directories:

- `app/`
  - Next.js app entry and route layer.
  - Global layout and global styles.
  - API route handlers.
- `features/woc/`
  - Main Work Order Correction app feature area.
  - Contains WOC components, state, logic, persistence, and types.
- `docs/v2/`
  - V2 source-of-truth planning and inventory documents.

### Primary App Entry Files

- `app/page.tsx`
  - Main page entry.
  - Imports `WocApp` and `LaunchSplash`.
  - Renders the app through:
    - `LaunchSplash`
    - `WocApp`

- `app/layout.tsx`
  - Root layout.
  - Imports `app/globals.css`.
  - Defines metadata, manifest, Apple web app settings, viewport, theme color, and dark color scheme.

### Main App Shell / Layout Files

- `features/woc/components/WocApp.tsx`
  - Current central app shell and runtime coordinator.
  - Owns most app state.
  - Owns active screen state.
  - Owns current user/app unlock state.
  - Owns WOC correction data, confirmations, draft/history records, setup config, send state, and selected record state.
  - Conditionally renders workflow screens based on `activeScreen`.
  - Renders `BottomNav` after the active screen content.

- `app/globals.css`
  - Current global visual and layout foundation.
  - Contains `.app-shell`, `.app-frame`, `.nav-dock`, `.nav-button`, `.stack`, `.card`, `.hero`, `.screen-title`, and supporting UI styles.
  - Current `.app-frame` is constrained to a phone-style max width.
  - Current `.nav-dock` is fixed at the bottom with five navigation slots.

### Routing / Navigation Files

No separate route-based page files were observed for each workflow screen.

Current workflow navigation appears primarily **state-based and component-driven** inside `WocApp.tsx`:

- `activeScreen` state controls which screen component renders.
- `BottomNav` sends a selected `Screen` value back to `WocApp`.
- Workflow progression buttons call `setActiveScreen(...)` directly.

Relevant files:

- `features/woc/components/WocApp.tsx`
- `features/woc/components/BottomNav.tsx`
- `features/woc/types/wocSessionTypes.ts`

### Screen / Page / Component Organization

Observed WOC screen components:

- `features/woc/components/LoginScreen.tsx`
- `features/woc/components/LaunchSplash.tsx`
- `features/woc/components/HomeScreen.tsx`
- `features/woc/components/CaptureScreen.tsx`
- `features/woc/components/ConfirmScreen.tsx`
- `features/woc/components/GenerateScreen.tsx`
- `features/woc/components/ReviewSendScreen.tsx`
- `features/woc/components/DraftsScreen.tsx`
- `features/woc/components/HistoryScreen.tsx`
- `features/woc/components/MoreScreen.tsx`
- `features/woc/components/EngineeringAnalyticsPreview.tsx`
- `features/woc/components/BottomNav.tsx`

### Styling Locations

Primary styling location:

- `app/globals.css`

Current styling is global class-based CSS, not component-scoped CSS modules.

Key current layout classes:

- `.app-shell`
- `.app-frame`
- `.stack`
- `.home-screen`
- `.card`
- `.card-grid`
- `.hero`
- `.screen-title`
- `.nav-dock`
- `.nav-button`
- `.placeholder-list`
- `.placeholder-item`
- `.preview-box`

### Data / Mock / Local Storage Areas

Visible local persistence and state areas:

- `features/woc/logic/currentUserStorage.ts`
  - Stores current local user and App Access PIN data in `localStorage`.
- `features/woc/logic/localRecordsStorage.ts`
  - Stores Drafts and History records in `localStorage`.
- `features/woc/logic/setupConfigStorage.ts`
  - Stores local Setup/Admin config in `localStorage`.
- `features/woc/components/CaptureScreen.tsx`
  - Stores photo evidence metadata in `sessionStorage` for local/session-only use.
- `features/woc/state/wocDataModel.ts`
  - Defines default WOC correction data, confirmation state, correction options, affected area options, gate status, generated report/email package builders, and report/email text builders.
- `features/woc/persistence/correctionRecordAnalytics.ts`
  - Builds local Engineering analytics preview data from Drafts and History.

### Utility / Helper Areas

Visible utility/helper areas:

- `features/woc/logic/printCorrectionReport.ts`
  - Used by Review, Drafts, and History for report export/print behavior.
- `features/woc/logic/evidenceAttachmentPreparation.ts`
  - Used by WOC data model and evidence metadata handling.
- `features/woc/logic/currentUserStorage.ts`
- `features/woc/logic/localRecordsStorage.ts`
- `features/woc/logic/setupConfigStorage.ts`
- `features/woc/persistence/correctionRecordAnalytics.ts`

### API Route Areas

Visible API route handlers:

- `app/api/extract-work-order/route.ts`
  - Handles uploaded image extraction through OpenAI vision API configuration.
- `app/api/send-correction/route.ts`
  - Handles real email send through Resend when configured.
- `app/api/setup/unlock/route.ts`
  - Handles Setup/Admin master-code unlock.

These routes should be treated as runtime-critical because they support extraction, send, and setup/admin behavior.

---

## 5. Existing Workflow Structure

### Home

- **Likely file/component location:** `features/woc/components/HomeScreen.tsx`
- **Current purpose:** Entry/home screen with system active status, app identity, workflow preview, and Start Capture action.
- **Runtime-critical:** Medium.
- **Preserve during V2 shell work:** Yes. Home is the safe starting point and current operator entry lane.

### Capture

- **Likely file/component location:** `features/woc/components/CaptureScreen.tsx`
- **Current purpose:** Router/work-order photo capture, upload, AI extraction trigger, manual entry fallback, and optional local/session-only photo evidence metadata capture.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Capture is one of the core V1 workflow foundations.

### Confirm

- **Likely file/component location:** `features/woc/components/ConfirmScreen.tsx`
- **Current purpose:** Review and confirm extracted or manually entered work order data, especially Work Order and Part Number.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Confirm gates Generate and protects correction accuracy.

### Generate / Review Preparation

- **Likely file/component location:** `features/woc/components/GenerateScreen.tsx`
- **Current purpose:** Select correction type, affected area, issue details, and requested Engineering action before generating the correction package.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Generate is central to report/email package creation.

### Send / Final Review

- **Likely file/component location:** `features/woc/components/ReviewSendScreen.tsx`
- **Current purpose:** Review generated Engineering report and email draft, copy report/email, export/print report, save draft, confirm final review, enter Send PIN, and send email.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Copy/send/save/print controls must not be broken.

### Drafts

- **Likely file/component location:** `features/woc/components/DraftsScreen.tsx`
- **Current purpose:** Show saved local draft records, open selected drafts, copy saved report/email, print/export report, final review saved draft, enter Send PIN, and send saved draft email.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Draft persistence and reopen/send behavior must remain intact.

### History

- **Likely file/component location:** `features/woc/components/HistoryScreen.tsx`
- **Current purpose:** Show completed/sent local history records, open selected record details, view saved report/email, print/export report, and show Resend ID when available.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. History is part of the V1 pilot-ready record trail.

### Setup / Admin

- **Likely file/component location:** `features/woc/components/MoreScreen.tsx` with unlock route at `app/api/setup/unlock/route.ts`
- **Current purpose:** Master-code protected Setup/Admin controls for company name, Engineering recipient email, sender display name, default submitted-by name, and default submitted-by email.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. Setup/Admin controls email routing and local configuration.

### More / Local Records / Analytics Preview

- **Likely file/component location:** `features/woc/components/MoreScreen.tsx` and `features/woc/components/EngineeringAnalyticsPreview.tsx`
- **Current purpose:** Holds current user info, lock app, local analytics preview, settings/help, setup/admin, local record counts, and clear local records.
- **Runtime-critical:** Medium to High.
- **Preserve during V2 shell work:** Yes. More currently contains multiple sensitive support functions and should not be casually split apart without a planned migration.

### Login / App Access PIN

- **Likely file/component location:** `features/woc/components/LoginScreen.tsx`
- **Current purpose:** First-time user setup and returning-user App Access PIN unlock.
- **Runtime-critical:** High.
- **Preserve during V2 shell work:** Yes. App access behavior gates the rest of the app.

### Launch Splash

- **Likely file/component location:** `features/woc/components/LaunchSplash.tsx`
- **Current purpose:** App launch wrapper/splash experience before the main WOC app is displayed.
- **Runtime-critical:** Low to Medium.
- **Preserve during V2 shell work:** Yes unless a later approved milestone changes launch behavior.

---

## 6. Current Navigation / Screen Flow

### Current Navigation Model

The current app navigation appears to be **state-based and component-driven**, not route-based.

Observed pattern:

- `WocApp.tsx` owns `activeScreen` state.
- `Screen` type in `features/woc/types/wocSessionTypes.ts` defines the screen keys:
  - `home`
  - `capture`
  - `confirm`
  - `generate`
  - `review`
  - `drafts`
  - `history`
  - `more`
- `WocApp.tsx` conditionally renders the active screen component.
- Workflow buttons call `setActiveScreen(...)` to move users forward.
- `BottomNav.tsx` renders the primary bottom dock navigation from a `NavItem[]` array.

### Current Bottom Navigation

Current bottom nav items in `WocApp.tsx`:

1. Home
2. Capture
3. Drafts
4. History
5. More

Current bottom nav file:

- `features/woc/components/BottomNav.tsx`

The bottom nav does not directly expose every workflow step. Confirm, Generate, and Review are workflow-driven screens reached from Capture/Confirm/Generate actions.

### Current Workflow Movement

Current flow:

1. Login / App Access PIN if app is locked.
2. Home.
3. Start Capture moves to Capture.
4. Capture can extract uploaded data and move to Confirm.
5. Confirm validates Work Order and Part Number and moves to Generate.
6. Generate builds the correction package and moves to Review.
7. Review supports copy, print/export, save draft, final review, Send PIN, and send.
8. Drafts and History can be reached from bottom nav.
9. More contains current user, analytics preview, Setup/Admin, and local records controls.

### Setup / Admin Access Pattern

Setup/Admin is currently inside `MoreScreen.tsx`.

- Unlock is controlled by `setupUnlocked` state in `WocApp.tsx`.
- Unlock checks through `app/api/setup/unlock/route.ts`.
- Setup unlock uses environment variable configuration on the server side.
- Setup config saves to localStorage through `setupConfigStorage.ts`.
- Leaving the `more` screen resets setup unlock state in `WocApp.tsx`.

### Send Protection / PIN Flow

There are two relevant PIN/access patterns:

- **App Access PIN**
  - Local user/app unlock behavior.
  - Managed by `LoginScreen.tsx`, `WocApp.tsx`, and `currentUserStorage.ts`.
- **Send PIN**
  - Required for real email sending.
  - Managed in Review and Draft send flows.
  - Server-side configured send PIN is checked in `app/api/send-correction/route.ts`.

These should remain separate during V2 shell work.

---

## 7. Current Responsive / Phone Behavior Notes

Current layout appears phone-first.

Observed phone-oriented behavior:

- `.app-frame` in `app/globals.css` uses a narrow max-width container.
- `.nav-dock` is fixed to the bottom and limited to phone-style width.
- Screens use `.stack`, `.card`, `.placeholder-list`, and vertical section flow.
- Screen content is mostly single-column.
- Confirm, Generate, Review, Drafts, History, and More rely on vertical stacking.
- The existing bottom dock supports quick mobile switching among Home, Capture, Drafts, History, and More.

Phone behavior to protect when adding iPad-first layout later:

- App Access PIN login and unlock flow.
- Start Capture path.
- Capture upload/photo/manual fallback.
- Confirm required fields.
- Generate required correction package fields.
- Final review and Send PIN lockout.
- Copy Report / Copy Email Draft fallback behavior.
- Save Draft behavior.
- Draft reopen/send behavior.
- History lookup behavior.
- More / Setup / Admin access.
- Bottom dock usability on small screens.

Future iPad shell work should add wide-layout capability without making the phone version harder to use.

---

## 8. Current iPad / Wide Layout Limitations

Likely current iPad/wide layout limitations:

- The main `.app-frame` is constrained to a phone-style max width, so iPad may feel like a stretched or centered phone app rather than an operating layer.
- Most workflow screens are vertical stacks, which can create unnecessary scrolling on larger screens.
- Confirm data and review/status cannot currently sit side by side.
- Generated Engineering report and email draft are stacked vertically in Review.
- Draft list and selected draft detail are stacked vertically.
- History list and selected history detail are stacked vertically.
- More combines user, analytics preview, settings/help, setup/admin, and local record controls in one long vertical flow.
- Current navigation is a five-item bottom dock; it does not yet reflect the V2 planned iPad operating shell navigation groups.

Areas that may benefit from split view later:

- Capture + extraction/status context.
- Confirm details + review readiness/status.
- Work-order details + generated report/email draft.
- Draft list + selected draft detail.
- History list + selected history detail.
- Feedback list/detail + review/action status.
- Analytics preview + filtered local record summaries.
- Setup/Admin + configuration/status summary.

Areas where dashboard/status summary could be added later:

- Home / Operating Dashboard.
- More / analytics preview migration.
- Drafts and History summary counts.
- Review readiness and waiting items.
- Future Feedback lane.

These are limitations and future opportunities only. No iPad shell features are implemented by V2-M5.

---

## 9. Existing Data / Persistence Notes

Visible persistence is local/browser-based.

### localStorage Usage

Observed localStorage areas:

- `refab-connect-current-user`
  - Managed by `features/woc/logic/currentUserStorage.ts`.
  - Stores current local user identity and App Access PIN data.

- `refab-connect-drafts`
  - Managed by `features/woc/logic/localRecordsStorage.ts`.
  - Stores saved draft correction records.

- `refab-connect-history`
  - Managed by `features/woc/logic/localRecordsStorage.ts`.
  - Stores completed/sent history records.

- `refab-connect-setup-config`
  - Managed by `features/woc/logic/setupConfigStorage.ts`.
  - Stores local Setup/Admin configuration.

### sessionStorage Usage

Observed sessionStorage area:

- `refab-connect-photo-evidence`
  - Used for photo evidence metadata/status only.
  - Evidence image itself is local/session-only and is not permanently stored or emailed based on current visible implementation notes.

### Draft / History Persistence Patterns

Draft and History records are loaded into state in `WocApp.tsx`, saved back to localStorage after local records load, and sanitized through `localRecordsStorage.ts`.

Draft and History records include fields such as:

- record ID
- timestamp
- subject line
- work order number
- part number
- affected area
- correction type
- report text
- email draft text
- submitted-by data
- evidence metadata fields
- status
- Resend ID for sent history records when available

### Setup / Config Persistence Patterns

Setup config is loaded into state in `WocApp.tsx`, edited in `MoreScreen.tsx`, and saved through `setupConfigStorage.ts`.

Visible setup fields:

- company name
- Engineering recipient email
- sender display name
- default submitted-by name
- default submitted-by email

### Mock / Static Data

Visible default WOC data exists in `features/woc/state/wocDataModel.ts`.

Current default values include example work order, part number, revision, customer/job, quantity, correction type, affected area, issue details, and requested Engineering action.

### Backend / Database / Cloud Sync Claims

No database/cloud sync implementation was identified from the inspected files.

Current visible persistence is local/browser storage plus API routes for extraction, setup unlock, and send email when environment variables are configured.

---

## 10. Risk Areas for Future Runtime Shell Work

Likely risk areas for future V2 runtime shell implementation:

- Breaking existing correction workflow progression from Home → Capture → Confirm → Generate → Review.
- Breaking AI extraction handoff from Capture to Confirm.
- Breaking Work Order and Part Number confirmation gates.
- Breaking Generate readiness gates.
- Breaking Copy Report / Copy Email Draft behavior.
- Breaking Export / Print Report behavior.
- Breaking Save Draft behavior.
- Breaking real send behavior through Send PIN and `/api/send-correction`.
- Breaking saved draft send behavior.
- Breaking Drafts localStorage load/save behavior.
- Breaking History localStorage load/save behavior.
- Breaking Setup/Admin unlock or setup config persistence.
- Breaking App Access PIN login/unlock behavior.
- Breaking phone layout by forcing an iPad shell onto small screens.
- Creating unfinished routes that users can access but cannot use.
- Duplicating navigation logic instead of carefully extending the existing state-driven navigation model.
- Mixing future dashboard/feedback work too early.
- Moving More/Setup/Analytics behavior without preserving current local records and setup controls.
- Visual drift before shell structure is stable.

---

## 11. Recommended Future Implementation Targets

Future V2 shell milestones may need to touch the following files/areas after this inventory is accepted.

### `features/woc/components/WocApp.tsx`

- **Why it matters:** Central runtime coordinator for active screen state, workflow movement, bottom nav items, records, setup, send behavior, and rendered screen components.
- **Suggested caution level:** High.
- **Notes:** Any shell or navigation work is likely to touch this file. Changes must preserve existing correction workflow and local state behavior.

### `features/woc/types/wocSessionTypes.ts`

- **Why it matters:** Defines `Screen`, `NavItem`, records, setup config, current user, upload info, and shared session types.
- **Suggested caution level:** High.
- **Notes:** Adding new V2 navigation groups or future screen keys may require type changes. Avoid adding unfinished feature screens without approved placeholder rules.

### `features/woc/components/BottomNav.tsx`

- **Why it matters:** Current primary navigation component.
- **Suggested caution level:** Medium.
- **Notes:** Future iPad shell may need a different navigation pattern, but phone bottom nav should remain protected.

### `app/globals.css`

- **Why it matters:** Contains current shell, frame, nav dock, stack, card, preview, and responsive behavior.
- **Suggested caution level:** High.
- **Notes:** Future shell foundation will likely require layout changes here. Phone-first constraints must not be broken while adding tablet/wide behavior.

### `app/page.tsx`

- **Why it matters:** Main page entry that wraps `WocApp` in `LaunchSplash`.
- **Suggested caution level:** Medium.
- **Notes:** Likely stable. Should only change if future shell bootstrapping requires a new wrapper structure.

### `app/layout.tsx`

- **Why it matters:** Root metadata, manifest, viewport, and global CSS import.
- **Suggested caution level:** Medium.
- **Notes:** Should remain stable unless future shell work requires metadata/viewport changes.

### `features/woc/components/HomeScreen.tsx`

- **Why it matters:** Current home/entry screen and workflow preview.
- **Suggested caution level:** Medium.
- **Notes:** Future Dashboard/Operating Overview may evolve from this area, but avoid claiming dashboard functionality before implementation.

### `features/woc/components/CaptureScreen.tsx`

- **Why it matters:** Core capture, upload, extraction, manual entry, and evidence metadata capture behavior.
- **Suggested caution level:** High.
- **Notes:** Preserve all capture/manual fallback behavior during shell changes.

### `features/woc/components/ConfirmScreen.tsx`

- **Why it matters:** Required field confirmation gate.
- **Suggested caution level:** High.
- **Notes:** Split-view work may place confirmation beside review/status later, but confirmation logic must remain intact.

### `features/woc/components/GenerateScreen.tsx`

- **Why it matters:** Correction package input and Generate Draft gate.
- **Suggested caution level:** High.
- **Notes:** Do not break correction type, affected area, issue details, or requested action inputs.

### `features/woc/components/ReviewSendScreen.tsx`

- **Why it matters:** Final review, copy, print, save draft, Send PIN, and send behavior.
- **Suggested caution level:** High.
- **Notes:** Strong candidate for future iPad split-view because report and email draft are currently stacked.

### `features/woc/components/DraftsScreen.tsx`

- **Why it matters:** Saved draft list/detail/send behavior.
- **Suggested caution level:** High.
- **Notes:** Strong candidate for future list/detail split-view. Preserve saved draft send and print/copy behavior.

### `features/woc/components/HistoryScreen.tsx`

- **Why it matters:** Completed/sent record lookup and print behavior.
- **Suggested caution level:** High.
- **Notes:** Strong candidate for future list/detail split-view. Preserve history record visibility.

### `features/woc/components/MoreScreen.tsx`

- **Why it matters:** Holds current user, analytics preview, setup/admin, local records, and app lock behavior.
- **Suggested caution level:** High.
- **Notes:** This file currently owns multiple support/admin surfaces. Any future separation into Setup, Analytics Preview, or Dashboard areas should be ticketed carefully.

### `features/woc/components/EngineeringAnalyticsPreview.tsx`

- **Why it matters:** Existing local analytics preview surface.
- **Suggested caution level:** Medium.
- **Notes:** Future dashboard/analytics planning may use this as a reference. Do not overbuild analytics before approved milestones.

### `features/woc/logic/localRecordsStorage.ts`

- **Why it matters:** Draft/History persistence.
- **Suggested caution level:** High.
- **Notes:** Avoid data model changes until explicitly approved.

### `features/woc/logic/currentUserStorage.ts`

- **Why it matters:** Local current user and App Access PIN persistence.
- **Suggested caution level:** High.
- **Notes:** Preserve login/unlock behavior.

### `features/woc/logic/setupConfigStorage.ts`

- **Why it matters:** Setup/Admin local config persistence.
- **Suggested caution level:** High.
- **Notes:** Engineering recipient config must remain stable.

### `features/woc/state/wocDataModel.ts`

- **Why it matters:** Core WOC data model, gates, correction options, generated report, generated email, and subject line logic.
- **Suggested caution level:** High.
- **Notes:** Do not change report/email logic as part of shell work unless separately approved.

### `app/api/extract-work-order/route.ts`

- **Why it matters:** AI Vision extraction route.
- **Suggested caution level:** High.
- **Notes:** Shell work should not change extraction behavior.

### `app/api/send-correction/route.ts`

- **Why it matters:** Real email send route and Send PIN verification.
- **Suggested caution level:** High.
- **Notes:** Shell work should not change send behavior.

### `app/api/setup/unlock/route.ts`

- **Why it matters:** Setup/Admin master-code unlock route.
- **Suggested caution level:** High.
- **Notes:** Preserve setup protection behavior.

---

## 12. V2-M6 Recommendation

**V2-M6 — Runtime Shell Foundation / Safe Layout Container**

**Purpose:**
Create the first controlled runtime shell foundation after the inventory is accepted, while preserving V1 workflow and phone behavior.

V2-M6 should introduce only the safe layout container foundation needed for future iPad-first behavior. It should not add dashboard/feedback lanes, unfinished routes, backend/auth/database behavior, or visual redesign beyond what is required for the shell foundation.

---

## 13. V2-M6 Preview Acceptance Checks

V2-M6 should be accepted when the following checks are true:

- Existing workflow still works.
- Phone layout remains usable.
- iPad/tablet shell foundation is introduced safely.
- No backend/auth/database behavior added.
- No unfinished feature routes added.
- No V1 records modified.
- No dashboard/feedback implementation added early.

---

## 14. Guardrails

Runtime shell work after this inventory must follow these guardrails:

- Inventory before implementation.
- Preserve V1 pilot-ready behavior.
- Do not rewrite the app from scratch.
- Do not remove working behavior.
- Do not overbuild V2 shell.
- Do not add dashboard/feedback runtime lanes yet.
- Do not add auth/backend/database.
- Do not chase polish before shell foundation is safe.
- Keep future changes ticketed and reviewable.

---

## 15. Acceptance Checks

V2-M5 is accepted when the following checks are true:

- V2-M5 document exists.
- Current runtime structure is summarized.
- Current workflow areas are mapped.
- Current navigation/screen flow is documented.
- Current phone behavior is documented.
- Current iPad/wide layout limitations are documented.
- Current persistence/data areas are noted if visible.
- Risk areas are documented.
- Future implementation targets are listed.
- V2-M6 recommendation is included.
- No runtime files are changed.
- No navigation routes are changed.
- No app components are created.
- No V1 records are modified.
- No future runtime shell features are claimed as complete.
