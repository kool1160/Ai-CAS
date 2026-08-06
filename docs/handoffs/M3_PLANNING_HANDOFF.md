# AI-CAS Milestone 3 Planning Handoff

**Milestone number:** 3
**Milestone name:** AI Extraction Contract and Confidence Safety
**Status:** In Progress / Blocked for repair
**Selected:** Yes
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Operator protocol:** `OPERATOR_PROTOCOL.md`
**Current status:** `docs/status/CURRENT.md`
**Base commit:** `697b84c2be8884e13d6e8a8c25a8504cc33687cf`
**Review branch:** `claude/milestone-3`
**Current review head:** Resolve the exact branch head from GitHub before every
action; this handoff does not self-reference its own commit.

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

## Runtime implementation state

The current runtime branch adds a shared `aiContracts.ts` module, bounded
provider handling, timeout/error normalization, safer logging, and synthetic
mocked-provider tests. It preserves manual fallback, M1 email boundaries, and
M2 confirmation gates.

Independent review found that the implementation does not yet satisfy the full
Milestone 3 contract. Six unresolved merge-blocking threads remain:

1. Extraction output does not yet require every exact key and allowed type.
2. Draft output still accepts partial, contradictory, empty, mistyped, or
   oversized sections instead of failing clearly.
3. Silent truncation can mutate provider output or client facts.
4. A valid JSON top-level `null`, array, string, or number is not consistently
   rejected before property access in the draft route.
5. Provider wrapper bodies are parsed before an enforceable whole-body size
   bound.
6. Caller abort is not propagated and distinguished from provider timeout in
   both routes.

The runtime portion is therefore not READY. Its earlier 115-test result cannot
override these contract findings.

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
- Added `docs/status/CURRENT.md` as the compact active-gate record and marked
  the current gate BLOCKED while the six runtime findings remain unresolved.
- Updated the primary project summary with the current operating model and
  corrected the stale repository entry to verified `kool1160/Ai-CAS`; no
  GitHub or Vercel rename was performed.
- Updated Codex instructions and local execution guidance so implementation
  repairs blockers first, CI second, otherwise stops for review.
- Added deterministic governance regression checks for command vocabulary,
  authority order, current status, manual workflow trigger, and separation of
  implementation from merge.

## Prior evidence and current evidence gap

Before the governance amendment, the runtime branch reported:

- 8 Vitest files and 115 tests passed, including 66 new provider-contract tests;
- TypeScript typecheck passed;
- Next.js 15.3.8 production build passed;
- privacy-fixture, governance, selected-milestone, scope, Bash contract, and
  diff checks passed;
- no real data, live provider, environment, hosted, deployment, or external
  action occurred.

Those results belong to an earlier head and do not prove the six review
findings were fixed. On the last inspected governance-amended head, Vercel
reported success but the repository connector returned no associated GitHub PR
workflow runs. Final-head application and governance evidence remains pending.

## Required repair and validation

Use `Continue AI-CAS` to repair only the six recorded review findings, add
negative validator and route regression tests, update the same handoff, and
run:

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

After repair and green exact-head evidence, stop for `Check AI-CAS`. Do not
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
  "status": "blocked",
  "milestone_number": 3,
  "milestone_name": "AI Extraction Contract and Confidence Safety",
  "summary": "Install the owner-approved command-driven AI-CAS operating protocol in the active M3 draft PR while recording six unresolved runtime contract blockers that must be repaired before rereview.",
  "runtime_impact": "The branch adds a shared AI-provider contract layer and route hardening, but independent review found incomplete exact-key/type/length validation, silent truncation, unsafe malformed-body handling, pre-bound parsing, and incomplete abort behavior. Runtime work remains blocked.",
  "data_persistence_impact": "No persistence behavior or storage key changes.",
  "security_impact": "The governance layer prevents implementation from self-authorizing merge or advancement and requires exact-head review. Runtime safety is improved but not complete until all six review findings are repaired.",
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
    "Six unresolved PR review threads block the runtime contract.",
    "Provider timeout is untuned against real document latency.",
    "Real-document extraction and drafting quality remains unverified.",
    "Hosted protection, environment reviewer, deployment, and rollback settings remain external evidence.",
    "Final-head CI and independent rereview are pending."
  ],
  "recommended_next_action": "Continue AI-CAS: repair only the six recorded PR blockers, add regression tests, rerun final-head checks, and stop for Check AI-CAS."
}
```
