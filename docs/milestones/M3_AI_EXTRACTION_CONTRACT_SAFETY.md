# Milestone 3 - AI Extraction Contract and Confidence Safety

**Status:** In Progress
**Selected:** Yes
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Make AI extraction and corrective-action drafting outputs structurally
validated, attributable, bounded, and safely rejected when provider output is
malformed, unsupported, contradictory, oversized, uncertain, or unavailable.
Human confirmation remains mandatory.

Under the product owner's 2026-08-06 directive, this active draft PR also
installs the command-driven AI-CAS operating protocol without opening a
parallel implementation gate or changing product behavior.

## Entry condition

Milestone 2 must be merged and marked Complete before Milestone 3 becomes the
selected milestone. The Milestone 2 closeout may switch the sole tracked
selection marker from M2 to M3.

## In scope

- Close Milestone 2 and select Milestone 3.
- Add explicit runtime validation for Vision extraction and AI drafting outputs.
- Bound strings, arrays, field-source notes, and provider-derived metadata.
- Normalize provider errors before returning them to the client.
- Remove or redact user-derived text from server logs.
- Add request timeout and abort handling around provider calls.
- Preserve missing-field reporting, manual fallback, and confirmation gates.
- Add deterministic mocked-provider tests for valid, malformed, partial,
  contradictory, oversized, timeout, and unavailable-provider cases.
- Document data flow, uncertainty behavior, and remaining provider limitations.
- Record the owner-approved AI-CAS command system in the primary summary,
  `OPERATOR_PROTOCOL.md`, `AGENTS.md`, and `docs/status/CURRENT.md`.
- Make local and workflow Codex execution obey `Continue AI-CAS`, stop for
  review, and prohibit self-merge, self-advancement, deployment, and scope
  invention.
- Add deterministic governance regression checks for command vocabulary,
  authority order, current-status presence, and implementation/merge
  separation.

## Out of scope

- OCR replacement, model benchmarking with real documents, or model fine-tuning.
- Automatic acceptance of AI output or removal of confirmation gates.
- Real customer or employer documents in tests, prompts, logs, or CI.
- Authentication, persistence, email release changes, routing, PDF release,
  hosted settings, deployment, or shell redesign.
- Merge, milestone completion, selection or implementation of Milestone 4.
- Transfer of LaserX product scope, architecture, or identity into AI-CAS.

## Required behavior

### Structured response validation

Vision extraction and drafting results must pass explicit runtime validation
before reaching active application state. `JSON.parse` success alone is not
sufficient. Unknown or malformed structures fail safely.

### Confidence and provenance

The UI must continue to distinguish extracted values, missing fields, manual
edits, and source notes. No numeric confidence score may be invented. When the
provider cannot support a value, the field remains missing or unconfirmed.

### Provider boundary

Requests use server-only keys, bounded payloads, timeouts, and abort handling.
Raw provider errors and user-entered content are not returned or logged. Tests
mock every provider call and do not use network access.

### Fallback

Manual entry remains available after missing configuration, timeout, malformed
output, rejected schema, or provider failure. Existing work-order and part
confirmation gates remain mandatory.

### Command and gate boundary

AI-CAS keeps one selected milestone, one active implementation PR, and one next
valid command. `Continue AI-CAS` implements or repairs and stops.
`Check AI-CAS` independently reviews the exact head. `Advance AI-CAS` is the
only merge-and-advance command and requires a fresh READY gate plus explicit
product-owner direction. Green CI alone is never merge permission.

## Required affected roles

- AI-CAS Foreman
- AI Extraction Engineer
- Corrective Action Workflow Engineer
- Security and Access Engineer
- Privacy and IP Guardian
- Validation Engineer
- UX and Mobile Workflow Engineer
- Deployment Engineer

Data and Records Engineer reviews structured metadata and durable status
records. Manufacturing Operations Engineer validates synthetic floor-side
cases. Product and Commercial Engineer reviews complexity and adoption impact.
The product owner controls the governance amendment, merge, and advancement.

## Acceptance criteria

- Provider output cannot enter active state without runtime schema validation.
- Malformed, partial, contradictory, and oversized responses fail clearly.
- Missing fields and uncertainty remain visible and unconfirmed.
- Field-source notes are bounded and server logs contain no user-derived values.
- Client errors do not expose raw provider details.
- Provider requests have deterministic timeout and abort behavior.
- Manual entry remains available for every provider failure mode.
- Existing M1 email and M2 confirmation behavior remains unchanged.
- Synthetic mocked-provider tests cover positive and negative contracts.
- `OPERATOR_PROTOCOL.md` defines the seven commands, exact role separation,
  one-gate rule, check/advance safety checks, hold behavior, and compact result
  formats.
- The project summary identifies the current command-driven model and the
  verified `kool1160/Ai-CAS` repository without claiming a hosted rename.
- Codex instructions treat `Continue AI-CAS` as implementation-only and stop
  before merge, closeout, next-gate selection, deployment, or scope invention.
- Governance regression checks fail when command vocabulary, authority order,
  current status, or implementation/merge separation is removed.
- Typecheck, build, privacy, governance, scope, and handoff validation pass.
- No live provider, hosted setting, deployment, merge, or real-data action occurs.

## Approved Change Scope

Scope is default-deny. The product owner explicitly approved the governance
paths below on 2026-08-06. Any other required path remains a stop-and-ask
condition.

### Allowed paths

- `AI-CAS_PROJECT_SUMMARY.md`
- `AGENTS.md`
- `OPERATOR_PROTOCOL.md`
- `BACKLOG.md`
- `DECISIONS.md`
- `docs/status/CURRENT.md`
- `docs/ARCHITECTURE.md`
- `docs/LOCAL_CODEX_EXECUTION.md`
- `docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`
- `docs/handoffs/M2_PLANNING_HANDOFF.md`
- `docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`
- `docs/handoffs/M3_PLANNING_HANDOFF.md`
- `docs/milestones/M4_BROWSER_RECORD_INTEGRITY_RECOVERY.md`
- `.github/codex/prompts/run-milestone.md`
- `app/api/extract-work-order/route.ts`
- `app/api/draft-corrective-action/route.ts`
- `features/woc/components/CaptureScreen.tsx`
- `features/woc/components/ConfirmScreen.tsx`
- `features/woc/components/ReviewSendScreen.tsx`
- `features/woc/components/WocApp.tsx`
- `features/woc/state/wocDataModel.ts`
- `features/woc/state/aiContracts.ts`
- `features/woc/types/wocSessionTypes.ts`
- `tests/**`
- `scripts/ci-contract.sh`
- `scripts/ci-contract.ps1`
- `scripts/governance-regression.mjs`

### Forbidden paths

- `app/api/send-correction/**`
- `features/woc/logic/localRecordsStorage.ts`
- `features/woc/logic/printCorrectionReport.ts`
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
- GitHub/Vercel identity changes
- production settings
- deployment
- destructive operations
- merge without `Advance AI-CAS`, a fresh READY gate, and explicit human approval
- milestone completion or next-gate selection during `Continue AI-CAS`
- live OpenAI, Resend, Supabase, Vercel, or other provider calls from tests or CI
- real customer, employer, personal, or proprietary data
- automatic acceptance of AI output
- removal or weakening of human confirmation gates
- authentication, durable persistence, billing, routing, PDF release, or shell redesign

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
- `node scripts/validate-scope.mjs --milestone 3`
- `node scripts/governance-regression.mjs`
- `git diff --check`

## Queue transition

On successful review, use `Advance AI-CAS` to reverify the exact head and CI,
merge, record M3 completion, and select M4. Do not select or implement M4 during
`Continue AI-CAS`, and do not advance from a green check alone.

## Approval boundaries

The product owner explicitly approved the command-governance scope amendment
on 2026-08-06. That approval does not authorize merge, deployment, external
provider use, hosted changes, destructive actions, or later product scope.
The active PR remains draft until `Check AI-CAS` returns READY. Merge and gate
advancement require the separate explicit command `Advance AI-CAS`.
