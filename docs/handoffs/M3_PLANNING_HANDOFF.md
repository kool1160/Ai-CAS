# AI-CAS Milestone 3 Planning Handoff

**Milestone number:** 3
**Milestone name:** AI Extraction Contract and Confidence Safety
**Status:** Awaiting independent rereview
**Selected:** Yes
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Operator protocol:** `OPERATOR_PROTOCOL.md`
**Current status:** `docs/status/CURRENT.md`
**Base commit:** `697b84c2be8884e13d6e8a8c25a8504cc33687cf`
**Review branch:** `claude/milestone-3`
**Reviewed repair base:** `9f6b660afb86a78ee4657812913918ba7459d05f`
**Evidence update:** The final PR comment records the exact pushed repair head
and its terminal CI result; this tracked handoff does not self-reference.

## Scope and authority

Milestone 3 hardens AI extraction and corrective-action drafting contracts
while preserving mandatory human confirmation and manual fallback.

On 2026-08-06 the product owner explicitly expanded the active gate to install
the command-driven AI-CAS operating protocol modeled on the proven LaserX
command discipline. The amendment is intentionally included in the same active
draft PR so AI-CAS does not create a parallel implementation gate. It changes
project control, not AI-CAS product identity, operator workflow, runtime safety,
production state, or hosted resources.

The tracked milestone file contains the exact default-deny allowed paths and
forbidden operations. Merge, milestone completion, Milestone 4 selection,
deployment, hosted rename, destructive action, and external release remain
outside `Continue AI-CAS`.

## Runtime repair state

The current runtime branch adds a shared `aiContracts.ts` module, bounded
provider handling, timeout/error normalization, safer logging, and synthetic
mocked-provider tests. It preserves manual fallback, M1 email boundaries, and
M2 confirmation gates.

Independent review recorded six merge-blocking findings on the prior head.
They were repaired locally on the same branch with deterministic synthetic
regression coverage:

1. Extraction now requires its complete exact key set, string field types, a
   structured source-notes object, and in-limit values; empty strings remain
   the only supported representation of an intentionally missing value.
2. Draft output now requires every exact section, literal
   `draft-only-unconfirmed` status, nonempty string sections, and in-limit
   values; partial, contradictory, empty, mistyped, and oversized payloads
   fail closed.
3. Provider output, source notes, and client facts now reject oversize,
   mistyped, unknown, or unsafe values instead of silently truncating or
   coercing them.
4. The draft route validates the parsed top-level body and draft-foundation
   container before property access, returning controlled 400 responses for
   `null`, arrays, strings, and numbers without a provider call.
5. Both routes incrementally read and enforce a bounded provider-wrapper body
   before JSON parsing.
6. Both routes combine the caller signal with the timeout signal and preserve
   that distinction through fetch and bounded response-body streaming. Caller
   cancellation returns 499, provider timeout returns 504, and unrelated
   unreadable or oversized bodies remain controlled 502 responses.

Independent rereview of `9f6b660` accepted items 1 through 5 and found that
item 6 still collapsed cancellation or timeout into a generic 502 if the body
stream failed after headers. The current bounded repair passes both signals
into the shared response reader and adds deterministic stream-phase regression
coverage for both routes.

The review threads intentionally remain unresolved until an independent
reviewer verifies the exact pushed head. The earlier 115-test result remains
historical and does not substitute for the final exact-head evidence.

## Exact implementation-head evidence

Validated locally on the current repair worktree based on reviewed head
`9f6b660afb86a78ee4657812913918ba7459d05f` before the evidence commit:

- `npm ci` completed without installing or changing dependencies; npm reported
  three high-severity audit findings for the existing dependency set.
- `npm run test:run`: 8 files passed, 134 tests passed.
- `npm run typecheck`: passed.
- `npm run build`: passed on Next.js 15.3.8.
- Privacy fixture, milestone selection, scoped M3, governance regression,
  Bash contract, PowerShell contract, and `git diff --check`: passed.
- The POSIX contract was executed through the installed Git Bash executable;
  `bash` is not directly on this PowerShell PATH.
- No live OpenAI, Resend, Supabase, Vercel, or other provider call was made.

## Owner-approved operator-system amendment

- Added `OPERATOR_PROTOCOL.md` with the seven commands: Plan, Lock, Continue,
  Check, Advance, Status, and Hold.
- Enforced one repository, one selected milestone, one active implementation
  PR, one next command, and block-instead-of-guessing behavior.
- Separated planning/review Foreman authority from Codex implementation
  authority. Only `Continue AI-CAS` authorizes normal implementation.
- Required exact-head independent review before `READY`; green CI alone is not
  merge permission.
- Reserved merge and gate advancement for an explicit `Advance AI-CAS` command
  after the reviewed head, CI, review threads, acceptance criteria, rollback,
  and boundaries are reverified.
- Added `docs/status/CURRENT.md` as the compact active-gate record and keeps
  exact-head review, CI, merge, and advancement state explicit.
- Updated the primary project summary with the current operating model and
  corrected the stale repository entry to verified `kool1160/Ai-CAS`; no
  GitHub or Vercel rename was performed.
- Updated Codex instructions and local execution guidance so implementation
  repairs blockers first, CI second, otherwise stops for review.
- Added deterministic governance regression checks for command vocabulary,
  authority order, current status, manual workflow trigger, and separation of
  implementation from merge.

## Prior evidence and final evidence requirement

Before the governance amendment, the runtime branch reported:

- 8 Vitest files and 115 tests passed, including 66 new provider-contract tests;
- TypeScript typecheck passed;
- Next.js 15.3.8 production build passed;
- privacy-fixture, governance, selected-milestone, scope, Bash contract, and
  diff checks passed;
- no real data, live provider, environment, hosted, deployment, or external
  action occurred.

Those results belong to an earlier head and do not prove the review findings
were fixed. The current repair state has 85 focused synthetic contract and
route tests across the three affected test files, including four stream-phase
abort/timeout route regressions. The final PR update must name the exact pushed
head and link the exact-head GitHub workflow outcome. Independent review, not
this handoff, decides whether the threads may be resolved.

## Required validation

Run the following on the final local repair state, then push only this existing
branch and update the same draft PR with the exact pushed-head evidence:

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
- required GitHub workflows on the exact pushed head

After final-head CI evidence is available, stop for `Check AI-CAS`. Do not
resolve review threads merely because code changed; independent rereview must
confirm each finding.

## Approval boundaries

The product owner's 2026-08-06 instruction approves this governance scope
amendment only. It does not authorize merge, M3 closeout, M4 selection or
implementation, production deployment, GitHub/Vercel rename, environment
changes, live provider use, external sending, destructive work, paid service,
authentication, durable backend work, or later scope.

Only a READY verdict on the exact repaired head followed by the separate
explicit command `Advance AI-CAS` can authorize merge and gate advancement.

## Rollback

Before merge, ordinary approved Git review may reject or revise the draft PR.
After merge, revert the single reviewed PR if the runtime or governance change
causes a verified regression. Do not reset, force-push, delete records, rename
hosted resources, or perform destructive migration.

## Unresolved risks

- Six concrete runtime contract findings block merge and must be repaired.
- The 25-second provider timeout remains untuned against real manufacturing
  document latency because no live provider call is allowed in this milestone.
- Extraction and drafting quality against real documents remains unverified.
- Hosted branch protection, environment reviewers, deployment state, and
  rollback readiness remain external and require independent verification.
- The governance amendment shares the active M3 review surface by explicit
  owner direction; reviewers must inspect both runtime and control-plane diffs
  before READY.

## Exact change surface

```json
{
  "status": "approval_required",
  "milestone_number": 3,
  "milestone_name": "AI Extraction Contract and Confidence Safety",
  "summary": "Repair the six recorded M3 runtime contract blockers on the existing draft PR and stop for independent exact-head rereview.",
  "runtime_impact": "The shared AI-provider contract layer now rejects malformed, partial, contradictory, mistyped, unknown, unsafe, and oversized data; routes validate top-level requests, bound provider wrappers before parsing, and distinguish caller cancellation from timeout through both fetch and response-body streaming.",
  "data_persistence_impact": "No persistence behavior or storage key changes.",
  "security_impact": "The governance layer prevents implementation from self-authorizing merge or advancement and requires exact-head review. Runtime safety now fails closed for the six repaired contract gaps; independent review remains required.",
  "privacy_ip_impact": "Synthetic tests and mocked providers only; no real customer, employer, personal, or proprietary data and no transfer of LaserX product identity or scope.",
  "deployment_impact": "No deployment, hosted setting, environment value, GitHub/Vercel rename, or production action.",
  "files_changed": [
    ".github/codex/prompts/run-milestone.md",
    "AGENTS.md",
    "AI-CAS_PROJECT_SUMMARY.md",
    "BACKLOG.md",
    "DECISIONS.md",
    "OPERATOR_PROTOCOL.md",
    "app/api/draft-corrective-action/route.ts",
    "app/api/extract-work-order/route.ts",
    "docs/ARCHITECTURE.md",
    "docs/LOCAL_CODEX_EXECUTION.md",
    "docs/handoffs/M2_PLANNING_HANDOFF.md",
    "docs/handoffs/M3_PLANNING_HANDOFF.md",
    "docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md",
    "docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md",
    "docs/status/CURRENT.md",
    "features/woc/state/aiContracts.ts",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
    "scripts/governance-regression.mjs",
    "tests/aiContracts.test.ts",
    "tests/draft-corrective-action.route.test.ts",
    "tests/extract-work-order.route.test.ts"
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
    "node scripts/validate-scope.mjs --milestone 3",
    "node scripts/governance-regression.mjs",
    "git diff --check",
    "required GitHub workflows on the exact pushed head"
  ],
  "approval_required": "Continue AI-CAS may repair only the six recorded blockers. Check AI-CAS must then independently review the exact repaired head. Advance AI-CAS is separately required for merge and gate advancement; deployment and other controlled actions remain prohibited.",
  "unresolved_items": [
    "The original PR review threads remain unresolved; five findings were accepted on the prior head and the stream-phase repair requires independent exact-head rereview.",
    "Provider timeout is untuned against real document latency.",
    "Real-document extraction and drafting quality remains unverified.",
    "Hosted protection, environment reviewer, deployment, and rollback settings remain external evidence.",
    "Final-head CI and independent rereview are pending."
  ],
  "recommended_next_action": "Check AI-CAS: independently review the exact pushed head, complete diff, six repaired threads, and final-head CI."
}
```
