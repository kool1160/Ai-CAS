# Milestone 3 - AI Extraction Contract and Confidence Safety

**Status:** In Progress
**Selected:** Yes
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Make AI extraction and corrective-action drafting outputs structurally
validated, attributable, bounded, and safely rejected when provider output is
malformed, unsupported, contradictory, oversized, uncertain, or unavailable.
Human confirmation remains mandatory.

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

## Out of scope

- OCR replacement, model benchmarking with real documents, or model fine-tuning.
- Automatic acceptance of AI output or removal of confirmation gates.
- Real customer or employer documents in tests, prompts, logs, or CI.
- Authentication, persistence, email release changes, routing, PDF release,
  hosted settings, deployment, or shell redesign.

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

## Required affected roles

- AI-CAS Foreman
- AI Extraction Engineer
- Corrective Action Workflow Engineer
- Security and Access Engineer
- Privacy and IP Guardian
- Validation Engineer
- UX and Mobile Workflow Engineer
- Deployment Engineer

Data and Records Engineer reviews structured metadata. Manufacturing Operations
Engineer validates synthetic floor-side cases. Product and Commercial Engineer
reviews complexity and adoption impact.

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
- Typecheck, build, privacy, governance, scope, and handoff validation pass.
- No live provider, hosted setting, deployment, or real-data action occurs.

## Approved Change Scope

Scope is default-deny. Any required path outside this list is a stop-and-ask
condition.

### Allowed paths

- `BACKLOG.md`
- `DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`
- `docs/handoffs/M2_PLANNING_HANDOFF.md`
- `docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`
- `docs/handoffs/M3_PLANNING_HANDOFF.md`
- `docs/milestones/M4_BROWSER_RECORD_INTEGRITY_RECOVERY.md`
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

### Forbidden paths

- `AI-CAS_PROJECT_SUMMARY.md`
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
- GitHub/Vercel identity
- production settings
- deployment
- destructive operations
- merge without human approval
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

On successful completion, mark M3 Complete and not selected, then mark M4
selected. Do not select M4 before M3 evidence and handoff are complete.

## Approval boundaries

The Foreman may prepare, validate, and request publication of one draft PR for
Milestone 3. Merge, deployment, external provider use, hosted changes, scope
expansion, and destructive actions remain human approval boundaries.
