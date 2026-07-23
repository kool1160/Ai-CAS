# AI-CAS Milestone 2 Planning Handoff

**Milestone number:** 2
**Milestone name:** Human Confirmation Gate Integrity
**Status:** In Progress
**Selected:** Yes
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Base commit:** `4bd4af9cbef6ffaae8a5012c6d9aafe9bdc570fb`
**Review branch:** `codex/milestone-2`
**Current review head:** Verify the branch head from GitHub at review time; this handoff does not self-reference its own commit.

## Scope and authority

Milestone 2 implements the approved rule: draft first, confirm accuracy, then
save, print, export, send, or release. The tracked milestone document remains
the authoritative scope record and M2 remains In Progress and selected until
human review and merge.

The approved paths are the exact paths declared in
`docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`, including the three
active workflow components, browser-local storage and print helpers, the new
review-gate helper, the draft record type, the print page, focused tests, the
two governance contract scripts, this handoff, and the affected architecture
and decision records. No path outside that declaration is included.

## Implementation summary

- Added pure literal-confirmation, review-metadata, migration, fresh-action,
  and print-payload helpers in `features/woc/state/reviewGate.ts`.
- Disabled and handler-gated initial Save Draft until a generated package has
  `confirmations.finalReviewConfirmed === true`.
- Persisted confirmed review metadata on new and reconfirmed browser-local
  drafts while preserving legacy content and creation timestamps.
- Loaded missing or malformed review metadata as `legacy-unconfirmed`.
- Disabled and handler-gated saved-draft Export / Print Report until a fresh
  final review is confirmed, and validated the session-storage handoff on the
  active print page.
- Normalized accepted browser-local reviewer identity into bounded review
  attribution without mutating setup identity or claiming authentication.
- Displayed persisted confirmed versus legacy review status separately from
  the fresh-action checkbox in both draft list and detail views.
- Preserved structured evidence filename, MIME type, and size in print
  handoffs, with legacy report parsing only as compatibility fallback and
  explicit no-evidence state taking precedence over session evidence.
- Consolidated literal confirmation, nonempty report text, reviewer metadata,
  and optional print fields into one deterministic confirmed-payload contract.
- Kept direct email and controlled PDF/export actions on the initial Review
  screen disabled. Existing Milestone 1 email and privacy boundaries remain
  unchanged.
- Recorded the M2 lifecycle decision and the pre-merge queue-transition
  wording conflict without marking M2 complete or selecting M3.

## Evidence

- Initial Save Draft uses the exact denial text:
  `Complete and confirm final review before saving this correction package.`
- Literal `true`, string, numeric, object, omitted, legacy, malformed timestamp,
  and unsafe reviewer inputs are covered by deterministic tests.
- Reviewer normalization tests cover whitespace, control characters, bounds,
  idempotence, and browser-local fallback without changing setup or send data.
- Persisted-status tests prove exact confirmed and legacy wording and prevent
  malformed stored metadata from appearing reviewed.
- Evidence tests prove structured-first resolution, legacy fallback,
  filename/type/size preservation, and isolation from unrelated session data.
- Print handoff tests prove that only validated confirmed metadata can be
  stored before navigation to `/print-report`, including required nonempty
  report text and valid optional print fields.
- Existing M1 route tests remain offline and no provider calls occur.
- No authentication, durable persistence, server PDF generation, email
  enablement, hosted setting, deployment, or product-shell redesign is part of
  this handoff.

## Milestone 1 closeout evidence and conflict

The current repository records M1 as complete with squash merge commit
`487d619f85d74a29df3f4b623850161aff29013c` and PR `#69` in
`docs/handoffs/M1_PLANNING_HANDOFF.md` and `BACKLOG.md`. The immediately
following queue commit is `199c17c` with commit subject `chore: queue AI-CAS
Foreman milestones 2 through 4 (#70)`. This conflicts with the ticket wording
that identifies PR #70 as the M1 closeout. The repository evidence is recorded
here for human verification rather than silently rewriting M1 records.

## Lifecycle conflict

The tracked M2 milestone document contains queue-transition wording that says
to mark M2 Complete and select M3 on successful completion. The current
operating rule requires human review and merge before that transition. This
implementation therefore keeps M2 In Progress and selected, leaves M3 Queued
and unselected, and requires a separate post-merge closeout to advance the
queue.

## Validation and approval boundaries

Validation evidence:

- `npm ci` completed successfully without changing tracked dependencies.
- `npm run test:run` passed: 5 test files, 49 tests.
- `npm run typecheck` passed.
- `npm run build` passed with Next.js 15.3.8.
- `node scripts/privacy-fixture-check.mjs` passed.
- Bash governance contract passed through Git Bash.
- PowerShell governance contract passed and now fails on native-command errors.
- `node scripts/select-milestone.mjs --validate` and `--selected` passed with
  M2 as the sole selected milestone.
- `node scripts/validate-scope.mjs --milestone 2` passed for all 17 changed
  paths; the full contracts were run in a clean generated-artifact context
  because this validator intentionally rejects installed ignored directories.
- `node scripts/governance-regression.mjs` passed all 6 checks.
- `git diff --check` passed.

No real customer, employer, personal, or proprietary data was processed. No
OpenAI, Resend, Supabase, Vercel, or other provider was called. No environment
value, hosted setting, repository identity, or deployment was changed.

Merge, deployment, enabling email release, authentication, durable
persistence, scope expansion, and any externally visible action remain explicit
human approval boundaries. Do not merge or deploy from this handoff.

## Rollback

Before merge, discard the review branch through ordinary approved Git review
procedures. After merge, revert the single Milestone 2 pull request if the
confirmation behavior causes a verified regression. Do not reset, force-push,
delete browser records, rename storage keys, or perform destructive migration.

## Unresolved risks

- Browser-local review metadata is not authentication or durable auditability.
- Existing browser-local drafts may require a fresh review before print/export.
- The app PIN remains a convenience gate on a shared device, not full
  authentication.
- The M2 queue-transition wording conflict requires post-merge product-owner
  closeout handling.
- Hosted branch protection and deployment settings remain external and were not
  verified or changed by this implementation.

## Exact change surface

```json
{
  "status": "approval_required",
  "milestone_number": 2,
  "milestone_name": "Human Confirmation Gate Integrity",
  "summary": "Make literal human confirmation gate initial save and saved-draft browser print/export while preserving browser-local and provider safety boundaries.",
  "runtime_impact": "Gated active client save and saved-draft print handoff; no API route, authentication, backend, or product-shell redesign changed.",
  "data_persistence_impact": "Added browser-local review metadata with legacy-unconfirmed migration; existing draft content and creation timestamps remain intact.",
  "security_impact": "Rejects non-literal confirmation, malformed review metadata, and unconfirmed print payloads before controlled browser actions.",
  "privacy_ip_impact": "No real data or provider calls; reviewer attribution is bounded browser-local metadata and is not claimed as durable identity.",
  "deployment_impact": "No provider, environment, hosted setting, or deployment change.",
  "files_changed": [
    "DECISIONS.md",
    "app/print-report/page.tsx",
    "docs/ARCHITECTURE.md",
    "docs/handoffs/M2_PLANNING_HANDOFF.md",
    "features/woc/components/DraftsScreen.tsx",
    "features/woc/components/ReviewSendScreen.tsx",
    "features/woc/components/WocApp.tsx",
    "features/woc/logic/localRecordsStorage.ts",
    "features/woc/logic/printCorrectionReport.ts",
    "features/woc/state/reviewGate.ts",
    "features/woc/types/wocSessionTypes.ts",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
    "tests/localRecordsStorage.test.ts",
    "tests/printCorrectionReport.test.ts",
    "tests/privacy-fixture-check.test.ts",
    "tests/reviewGate.test.ts"
  ],
  "tests": [
    "npm ci",
    "npm run test:run",
    "npm run typecheck",
    "npm run build",
    "node scripts/privacy-fixture-check.mjs",
    "bash scripts/ci-contract.sh",
    "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1",
    "node scripts/select-milestone.mjs --validate",
    "node scripts/select-milestone.mjs --selected",
    "node scripts/validate-scope.mjs --milestone 2",
    "node scripts/governance-regression.mjs",
    "git diff --check"
  ],
  "approval_required": "Human review and merge approval before M2 closeout; explicit approval remains required for deployment, email enablement, hosted changes, and scope expansion.",
  "unresolved_items": [
    "Browser-local review metadata is not authentication or durable auditability.",
    "M2 must remain In Progress and selected until post-merge closeout despite pre-merge queue-transition wording in the tracked milestone document.",
    "Hosted protection and deployment settings remain external prerequisites and were not changed."
  ],
  "recommended_next_action": "Run independent review, then stop for explicit human approval before merge."
}
```
