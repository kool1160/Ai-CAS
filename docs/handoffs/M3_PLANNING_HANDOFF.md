# AI-CAS Milestone 3 Planning Handoff

**Milestone number:** 3
**Milestone name:** AI Extraction Contract and Confidence Safety
**Status:** In Progress
**Selected:** Yes
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Base commit:** `697b84c2be8884e13d6e8a8c25a8504cc33687cf`
**Review branch:** `claude/milestone-3`
**Current review head:** Verify the branch head from GitHub at review time; this handoff does not self-reference its own commit.

## Scope and authority

Milestone 3 implements the approved rule: AI extraction and drafting output
must be structurally validated, attributable, bounded, and safely rejected
when malformed, unsupported, contradictory, oversized, uncertain, or
unavailable, while human confirmation remains mandatory. The tracked
milestone document remains the authoritative scope record and M3 remains In
Progress and selected until human review and merge.

The approved paths are the exact paths declared in
`docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`, including the two
active AI provider routes, the new shared contract module, the capture/confirm/
review-send/app workflow components (read for context; not modified beyond
what evidence required), the draft-model and session types, focused tests,
the two governance contract scripts, this handoff, and the affected
architecture, decision, backlog, and milestone records. No path outside that
declaration is included.

## Implementation summary

- Added `features/woc/state/aiContracts.ts` as a pure, shared runtime contract
  module for both AI provider routes: plain-object structural validation,
  per-field length bounds, control-character stripping, field-source-note
  bounding, a shared `extractProviderOutputText`/`stripJsonCodeFence` parsing
  pair, and provider-error/network-failure message normalization.
- `app/api/extract-work-order/route.ts` now validates the parsed OpenAI Vision
  payload as a plain object before trusting any field (a non-object payload —
  array, string, number, null — is rejected with a clear error instead of
  silently becoming an accepted all-blank extraction), bounds the provider
  output size before parsing, wraps the provider `fetch` in a fixed
  `AbortSignal.timeout`, and normalizes provider HTTP and network/timeout
  failures into generic client-facing messages. Extracted field-source-note
  values are no longer written to `console.info`; only field names and counts
  are logged.
- `app/api/draft-corrective-action/route.ts` validates and bounds the
  client-supplied `aiDraftFoundation.input` before it is used to build the
  server-owned prompt, applies the same timeout/abort and output-size bounds,
  validates the parsed drafting output as a plain object, and always forces
  the literal `draft-only-unconfirmed` status server-side regardless of what
  the provider returns. Provider HTTP and network/timeout failures are
  normalized the same way as the extraction route.
- Neither route was previously wrapped in a `try/catch` around the provider
  `fetch` call; an unhandled fetch rejection (network failure, timeout) would
  have propagated as an unhandled exception. Both routes now catch that
  failure and return a normalized, bounded JSON error.
- Existing missing-field reporting (`missingExpectedFields`,
  `missingDraftSections`), manual-entry/manual-drafting fallback, and the M1
  email and M2 confirmation-gate boundaries are unchanged; no client component
  required a behavior change because the client already treats any non-2xx
  response generically via the existing `payload?.error` fallback pattern.
- Closed Milestone 2: recorded PR `#72`'s merge evidence (squash commit
  `697b84c2be8884e13d6e8a8c25a8504cc33687cf`) in
  `docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`,
  `docs/handoffs/M2_PLANNING_HANDOFF.md`, and `BACKLOG.md`, and marked
  Milestone 3 In Progress and selected in the same three records.
- Generalized `scripts/ci-contract.sh`/`scripts/ci-contract.ps1`: the M2
  handoff's change-surface check now validates against its own fixed
  `Base commit`/`Reviewed head` range (the same pattern already used for M1)
  instead of the live `main...HEAD` diff, which would otherwise always fail
  once M2's own diff was no longer the active one. A new M3-specific
  change-surface check validates this handoff's `files_changed` against the
  live `main...HEAD` diff while M3 is in progress, and a new M3/M4 lifecycle
  check mirrors the existing M2/M3 one.

## Evidence

- Malformed top-level provider payloads (arrays, strings, numbers) are
  rejected with a clear 502 response instead of silently producing an
  all-blank extraction or draft; deterministic tests cover this for both
  routes.
- Oversized provider output (over the bounded character limit) is rejected
  before `JSON.parse` is attempted.
- Field-source notes are capped in both entry count and per-note length;
  non-string note values are dropped rather than coerced.
- Provider HTTP failures (401/403/429/5xx/other) and network/timeout
  failures are normalized into generic, context-appropriate messages;
  deterministic tests assert that injected raw provider text never appears
  in the client-facing error.
- A synthetic marker placed in a field-source note is asserted absent from
  every `console.info` call made during extraction.
- The drafting route always returns `status: 'draft-only-unconfirmed'` even
  when the mocked provider response supplies a different status value.
- An oversized client-supplied drafting input is asserted to produce a
  bounded outbound prompt rather than being forwarded unbounded to the
  provider request.
- All provider interactions in tests are mocked; no test performs network
  access or requires real credentials.

## Milestone 2 closeout evidence

- Pull request `#72` was reviewed (both automated review threads resolved)
  and squash-merged into `main` as
  `697b84c2be8884e13d6e8a8c25a8504cc33687cf`.
- `git diff --name-only 4bd4af9cbef6ffaae8a5012c6d9aafe9bdc570fb...6c7f79f83a97f7ccb487d7d30c8e3c5f34b050b8`
  matches the 17-file `files_changed` list recorded in
  `docs/handoffs/M2_PLANNING_HANDOFF.md`.
- `node scripts/select-milestone.mjs --validate` and `--selected` confirm
  Milestone 3 as the sole selected milestone after the closeout edits.

## Validation and approval boundaries

Validation evidence:

- `npm ci` completed successfully without changing tracked dependencies.
- `npm run test:run` passed: 8 test files, 115 tests (66 new tests across
  `tests/aiContracts.test.ts`, `tests/extract-work-order.route.test.ts`, and
  `tests/draft-corrective-action.route.test.ts`; the 49 Milestone 1/2 tests
  continue to pass unchanged).
- `npm run typecheck` passed.
- `npm run build` passed with Next.js 15.3.8.
- `node scripts/privacy-fixture-check.mjs` passed.
- Bash governance contract (`bash scripts/ci-contract.sh`) passed.
- `node scripts/select-milestone.mjs --validate` and `--selected` passed with
  M3 as the sole selected milestone.
- `node scripts/validate-scope.mjs --milestone 3` passed for every changed
  path.
- `node scripts/governance-regression.mjs` passed all 6 checks.
- `git diff --check` passed.

No real customer, employer, personal, or proprietary data was processed. No
OpenAI, Resend, Supabase, Vercel, or other provider was called; all provider
interactions in tests are mocked. No environment value, hosted setting,
repository identity, or deployment was changed.

Merge, deployment, enabling email release, authentication, durable
persistence, scope expansion, and any externally visible action remain
explicit human approval boundaries. Do not merge or deploy from this
handoff.

## Rollback

Before merge, discard the review branch through ordinary approved Git review
procedures. After merge, revert the single Milestone 3 pull request if the
provider-contract behavior causes a verified regression. Do not reset,
force-push, delete browser records, rename storage keys, or perform
destructive migration.

## Unresolved risks

- Provider timeout bound (25 seconds) is a fixed default and has not been
  tuned against real Vision extraction latency, since no live provider call
  is part of this milestone.
- Extraction and drafting quality against real manufacturing documents
  remains unverified; only synthetic mocked-provider fixtures were used.
- Hosted branch protection and deployment settings remain external and were
  not verified or changed by this implementation.

## Exact change surface

```json
{
  "status": "approval_required",
  "milestone_number": 3,
  "milestone_name": "AI Extraction Contract and Confidence Safety",
  "summary": "Add explicit runtime validation, bounding, timeout/abort handling, and provider-error normalization to the OpenAI Vision extraction and AI corrective-action drafting routes, and close out Milestone 2.",
  "runtime_impact": "Hardened the two existing AI provider API routes with structural validation, bounded fields, request timeouts, and normalized errors; no route was added or removed and no client component behavior changed.",
  "data_persistence_impact": "No persistence change. Browser-local and server-side behavior outside the two provider routes is unchanged.",
  "security_impact": "Provider requests now time out deterministically; malformed provider payloads are rejected instead of silently accepted; raw provider error text is never forwarded to the client; extracted document text is no longer logged.",
  "privacy_ip_impact": "No real data or provider calls; field-source notes and drafting input are bounded and control-character-stripped before use or display.",
  "deployment_impact": "No provider, environment, hosted setting, or deployment change.",
  "files_changed": [
    "BACKLOG.md",
    "DECISIONS.md",
    "app/api/draft-corrective-action/route.ts",
    "app/api/extract-work-order/route.ts",
    "docs/ARCHITECTURE.md",
    "docs/handoffs/M2_PLANNING_HANDOFF.md",
    "docs/handoffs/M3_PLANNING_HANDOFF.md",
    "docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md",
    "docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md",
    "features/woc/state/aiContracts.ts",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
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
    "git diff --check"
  ],
  "approval_required": "Human review and merge approval before M3 closeout; explicit approval remains required for deployment, email enablement, hosted changes, and scope expansion.",
  "unresolved_items": [
    "Provider timeout bound is a fixed default, untuned against real Vision extraction latency.",
    "Extraction and drafting quality against real manufacturing documents remains unverified.",
    "Hosted protection and deployment settings remain external prerequisites and were not changed."
  ],
  "recommended_next_action": "Run independent review, then stop for explicit human approval before merge."
}
```

## Review notes

The M3 handoff records the same repository-summary local-path metadata
conflict noted by the M2 handoff (`docs/handoffs/M2_PLANNING_HANDOFF.md`);
that conflict is unrelated to Milestone 3's scope and is not resolved here.
