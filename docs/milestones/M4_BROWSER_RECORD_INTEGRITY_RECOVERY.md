# Milestone 4 - Browser Record Integrity and Recovery

**Status:** Queued
**Selected:** No
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Strengthen the current browser-local record model so drafts and history are
versioned, validated, recoverable, and portable without claiming durable cloud
persistence or activating a backend.

## Entry condition

Milestone 3 must be merged and marked Complete before Milestone 4 becomes the
selected milestone. The Milestone 3 closeout may switch the sole tracked
selection marker from M3 to M4.

## In scope

- Close Milestone 3 and select Milestone 4.
- Add a documented local schema version for drafts and history.
- Replace array-length-derived IDs with stable collision-resistant local IDs.
- Preserve existing storage-key compatibility without renaming keys.
- Detect malformed records and expose a safe recovery/quarantine result instead
  of silently discarding data.
- Add validated local backup export for drafts and history.
- Add preview-first, explicitly confirmed local backup import.
- Detect duplicate records and avoid destructive overwrite by default.
- Preserve review metadata, attribution, evidence metadata, and original dates.
- Add deterministic round-trip, migration, malformed-data, duplicate, and
  rollback tests.
- Keep all persistence claims explicitly browser-local.

## Out of scope

- Database, Supabase, cloud sync, server records, authentication, multi-user
  ownership, billing, or customer-data backend.
- Storage-key rename, silent destructive migration, or automatic overwrite.
- Email, extraction, routing, PDF release, hosted settings, deployment, or shell
  redesign.

## Required behavior

### Versioned local records

Draft and history records include an explicit schema version. Existing records
without a version load through a tested compatibility path. Invalid versions or
shapes do not silently become current valid records.

### Stable identifiers

New record IDs are collision-resistant within the browser and do not depend on
array length. Existing IDs remain readable and are not rewritten merely because
the app loaded them.

### Recovery and quarantine

Malformed local JSON or malformed records produce visible, bounded recovery
information. Valid records continue loading. Invalid data is not silently
promoted, and recovery does not leak record contents into logs.

### Backup export and import

Export produces a clearly labeled AI-CAS browser-local backup containing a
version, export timestamp, and validated records. Import validates before
writing, shows a summary, detects duplicates, and requires explicit confirmation.
Merge is the safe default; destructive replacement requires a separate explicit
product decision and is not part of this milestone.

## Required affected roles

- AI-CAS Foreman
- Data and Records Engineer
- Corrective Action Workflow Engineer
- Security and Access Engineer
- Privacy and IP Guardian
- Validation Engineer
- UX and Mobile Workflow Engineer
- Deployment Engineer

Manufacturing Operations Engineer reviews usability. AI Extraction Engineer
confirms extraction data is preserved without reinterpretation. Product and
Commercial Engineer reviews support burden and beta value.

## Acceptance criteria

- Draft and history records use a documented local schema version.
- Existing unversioned records remain readable through tested compatibility.
- Stable local IDs replace array-length-derived IDs for new records.
- Malformed records are reported or quarantined rather than silently disappearing.
- Exported backups are versioned, validated, synthetic-testable, and clearly browser-local.
- Imports are validated and previewed before an explicit confirmation.
- Duplicate handling is deterministic and non-destructive by default.
- Review, attribution, evidence, and timestamp metadata survive round trips.
- Existing storage keys remain readable and no automatic destructive migration occurs.
- No backend, authentication, provider call, hosted change, or deployment occurs.
- Typecheck, build, privacy, governance, scope, and handoff validation pass.

## Approved Change Scope

Scope is default-deny. Any required path outside this list is a stop-and-ask
condition.

### Allowed paths

- `BACKLOG.md`
- `DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`
- `docs/handoffs/M3_PLANNING_HANDOFF.md`
- `docs/milestones/M4_BROWSER_RECORD_INTEGRITY_RECOVERY.md`
- `docs/handoffs/M4_PLANNING_HANDOFF.md`
- `features/woc/components/WocApp.tsx`
- `features/woc/components/DraftsScreen.tsx`
- `features/woc/components/HistoryScreen.tsx`
- `features/woc/components/MoreScreen.tsx`
- `features/woc/logic/localRecordsStorage.ts`
- `features/woc/logic/localRecordBackup.ts`
- `features/woc/persistence/**`
- `features/woc/types/wocSessionTypes.ts`
- `tests/**`
- `scripts/ci-contract.sh`
- `scripts/ci-contract.ps1`

### Forbidden paths

- `AI-CAS_PROJECT_SUMMARY.md`
- `app/api/**`
- `app/print-report/**`
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
- live provider calls
- database, Supabase, cloud sync, authentication, or customer-data backend
- storage-key renaming or silent destructive migration
- real customer, employer, personal, or proprietary data
- product-shell redesign

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
- `node scripts/validate-scope.mjs --milestone 4`
- `node scripts/governance-regression.mjs`
- `git diff --check`

## Queue end behavior

Milestone 4 is the final currently executable queue item. On completion, mark
M4 Complete but do not invent the next milestone. Stop and request a product-
owner queue refill based on fresh repository evidence.

## Approval boundaries

The Foreman may prepare, validate, and request publication of one draft PR for
Milestone 4. Merge, deployment, backend activation, hosted changes, destructive
migration, scope expansion, and real-data use remain human approval boundaries.
