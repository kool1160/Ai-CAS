# Milestone 2 - Human Confirmation Gate Integrity

**Status:** In Progress
**Selected:** Yes
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Make the locked product rule true throughout the active workflow: draft first,
confirm accuracy, then save, print, export, send, or release. Add browser-local
review metadata without claiming authentication, cryptographic identity,
durable persistence, or authoritative auditability.

## Problem statement

Repository evidence shows that the initial Save Draft handler requires only a
generated package, and the saved-draft print action does not require final
review. This conflicts with the project summary and Product Constitution.
Milestone 2 repairs those gates without enabling direct release or redesigning
the shell.

## In scope

- Close Milestone 1 records with PR and merge evidence.
- Gate initial Save Draft in both the UI and handler.
- Persist review status, timestamp, reviewer label, and local user ID on new drafts.
- Load existing drafts without review metadata as `legacy-unconfirmed`.
- Require fresh final-review confirmation before saved-draft print/export.
- Persist saved-draft reconfirmation while preserving original creation data.
- Require literal confirmation evidence in the print session handoff.
- Reject invalid confirmation evidence in `/print-report`.
- Replace active print-page Refab Connect error wording with AI-CAS wording.
- Add deterministic gate, sanitizer, migration, and print-payload tests.
- Preserve all Milestone 1 email and privacy controls.

## Out of scope

- Direct email or controlled PDF release from the initial Review screen.
- Server-generated PDF files or evidence attachments.
- Authentication, sessions, Supabase, databases, cloud sync, or durable storage.
- Storage-key renaming or destructive record migration.
- Product-shell redesign, navigation rewrite, deployment, or hosted settings.

## Required behavior

### Initial Save Draft

Save Draft requires both a generated package and literal final-review
confirmation. The button is disabled before confirmation and the handler
rejects direct invocation with:

`Complete and confirm final review before saving this correction package.`

Copy controls may remain available but must remain clearly labeled as draft
content.

### Review metadata

Newly saved drafts use narrowly scoped metadata such as:

- `reviewStatus: 'confirmed' | 'legacy-unconfirmed'`
- `reviewedTimestamp?: string`
- `reviewedBy?: string`
- `reviewedById?: string`

Existing records without valid metadata load as `legacy-unconfirmed`. Malformed
metadata cannot become confirmed. Existing report and evidence data must survive.

### Saved-draft controlled actions

Saved-draft print/export requires a fresh session confirmation. The UI disables
the action before confirmation and the handler rejects direct invocation.
Reconfirming a draft updates review metadata while preserving original creation
time and content. Unchecking the session checkbox relocks print and email but
does not falsify previously recorded review history.

### Print handoff

The print payload carries literal `finalReviewConfirmed: true`, review timestamp,
and reviewer attribution. The helper refuses to create a print payload without
literal confirmation. `/print-report` refuses to render missing, false, string,
numeric, or malformed confirmation evidence. Browser print-to-PDF remains a
browser feature and is not described as controlled server PDF generation.

## Required affected roles

- AI-CAS Foreman
- Corrective Action Workflow Engineer
- Data and Records Engineer
- Security and Access Engineer
- UX and Mobile Workflow Engineer
- Validation Engineer
- Privacy and IP Guardian
- Deployment Engineer

Manufacturing Operations Engineer confirms that the gate does not add
unnecessary floor-side clerical work. AI Extraction Engineer confirms no
extraction behavior changes. Product and Commercial Engineer reviews adoption
impact.

## Acceptance criteria

- Initial Save Draft is disabled and handler-rejected until confirmation is literal `true`.
- New drafts persist confirmed review metadata and attribution.
- Existing and malformed records cannot be silently upgraded to confirmed.
- Existing evidence metadata survives sanitization and migration.
- Saved-draft print/export is disabled and handler-rejected without fresh confirmation.
- Reconfirmation updates review metadata without deleting original content or creation time.
- Print handoff and print page reject missing or non-literal confirmation.
- Print errors use AI-CAS wording.
- Existing email release tests and controls continue passing unchanged.
- Synthetic automated tests cover positive, negative, migration, and relock cases.
- Typecheck, build, privacy, governance, scope, and handoff checks pass.
- No provider calls, deployment, hosted settings changes, or real-data processing occur.

## Approved Change Scope

Scope is default-deny. Any required path outside this list is a stop-and-ask
condition and must not be added silently by the Foreman.

### Allowed paths

- `BACKLOG.md`
- `DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/milestones/M1_EXTERNAL_ACTION_CONTAINMENT.md`
- `docs/handoffs/M1_PLANNING_HANDOFF.md`
- `docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`
- `docs/handoffs/M2_PLANNING_HANDOFF.md`
- `docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`
- `features/woc/components/WocApp.tsx`
- `features/woc/components/ReviewSendScreen.tsx`
- `features/woc/components/DraftsScreen.tsx`
- `features/woc/logic/localRecordsStorage.ts`
- `features/woc/logic/printCorrectionReport.ts`
- `features/woc/state/reviewGate.ts`
- `features/woc/types/wocSessionTypes.ts`
- `app/print-report/page.tsx`
- `tests/**`
- `scripts/ci-contract.sh`
- `scripts/ci-contract.ps1`

### Forbidden paths

- `AI-CAS_PROJECT_SUMMARY.md`
- `app/api/**`
- `.github/workflows/**`
- `package.json`
- `package-lock.json`
- `public/**`
- `.env`
- `.vercel/**`
- `vercel.json`

### Forbidden operations

- secrets
- environment values
- GitHub/Vercel identity
- production settings
- deployment
- destructive operations
- merge without human approval
- real email sending or live provider calls
- enabling production email release
- authentication, backend, Supabase, or durable persistence
- storage-key renaming or deletion of existing browser records
- product-shell redesign
- real customer, employer, personal, or proprietary data

## Required validation

- `npm ci`
- `npm run test:run`
- `npm run typecheck`
- `npm run build`
- `node scripts/privacy-fixture-check.mjs`
- `bash scripts/ci-contract.sh`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1`
- `node scripts/select-milestone.mjs --validate`
- `node scripts/select-milestone.mjs --selected`
- `node scripts/validate-scope.mjs --milestone 2`
- `node scripts/governance-regression.mjs`
- `git diff --check`

## Queue transition

On successful completion, mark M2 Complete and not selected, then mark M3
selected. Do not select M3 before M2 evidence and handoff are complete.

## Approval boundaries

The Foreman may prepare, validate, and request publication of one draft PR for
Milestone 2. Merge, deployment, email release, hosted changes, scope expansion,
and destructive actions remain explicit human approval boundaries.

## Known conflict

`AI-CAS_PROJECT_SUMMARY.md` still contains historical commit metadata and an
outdated recommended next action. This milestone records the conflict but may
not edit the summary without separate product-owner approval.
