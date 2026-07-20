# AI-CAS Milestone 1 Planning Handoff

**Milestone number:** 1
**Milestone name:** External-Action Containment and Public-Data Safety
**Status:** In Progress; approval required before merge or deployment
**Selected:** Yes
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Base commit:** `a37cd376b19a013d5bc39ec71a7fc87c8c4f9edb`
**Branch:** `codex/milestone-1`
**Final head:** `cd98ecd8d4f8b87930ba12b53daff0069fd8ca32`

## Approved Scope

Milestone 1 contains the approved external-action containment, server-owned
email configuration, final-review confirmation, complete reviewed message
content, synthetic public-data, and deterministic validation work. The
product-owner-approved added paths retained from the earlier review are:

- `docs/v3/V3-M32_CORRECTIVE_ACTION_BUILDER_SOURCE_OF_TRUTH_CLOSEOUT.md`
- `features/woc/logic/controlledPdfTemplateFoundation.ts`
- `scripts/select-milestone.mjs`

This repair additionally adds only the expressly approved review paths:

- `scripts/privacy-fixture-check.mjs`
- `docs/handoffs/M1_PLANNING_HANDOFF.md`

The tracked M1 milestone document is the authoritative scope record. No
authentication, durable persistence, Supabase, billing, PDF release, hosted
identity migration, deployment, or product-shell redesign is included.

## Implementation Evidence

- The unauthenticated `app/api/send/route.ts` is deleted and no active caller
  uses `/api/send`.
- `/api/send-correction` requires the raw server value
  `AI_CAS_EMAIL_RELEASE_ENABLED=true`, server-owned sender and recipient,
  configured PIN, and literal `finalReviewConfirmed: true` before one provider
  call is possible.
- The client carries final-review evidence and sends the current user's email
  or employee ID as `submittedByIdentifier`; the server accepts bounded plain
  text for body attribution only and never uses it for email addressing.
- The outgoing message includes the approved draft and complete submitted
  report, with work-order, part, correction, affected-area, company, and
  submitted-by context where present. It does not claim evidence attachments.
- Public surfaces use clearly synthetic values. The tracked privacy checker
  uses `git ls-files`, excludes generated artifacts, and rejects only the
  documented narrow denylist of known removed fixture identifiers.
- CI separates governance contract checks from application baseline checks.
  The application job uses fixed Node 22, `npm ci`, Vitest, TypeScript, build,
  and the privacy checker without provider credentials.

## Exact Change Surface

The machine-readable list below must equal `git diff --name-only main...HEAD`
after the repair commit. It is intentionally kept in sorted repository-path
order.

```json
{
  "status": "approval_required",
  "milestone_number": 1,
  "milestone_name": "External-Action Containment and Public-Data Safety",
  "summary": "Contain unsafe email release, remove unverified public fixture identifiers, preserve employee-ID attribution, and separate application validation from governance evidence.",
  "runtime_impact": "Removes the legacy email route and hardens the active send route; no authentication or persistence is added.",
  "data_persistence_impact": "No durable persistence change. Browser-local behavior remains unchanged.",
  "security_impact": "Email release is server-gated by exact configuration, final-review confirmation, server-owned addresses, PIN validation, and bounded attribution input.",
  "privacy_ip_impact": "Tracked application, tests, fixture-like files, and active documentation are checked for a narrow denylist of removed identifiers; synthetic values are used.",
  "deployment_impact": "No hosted settings or environment values changed. Merge, deployment, and real email release remain approval boundaries.",
  "files_changed": [
    ".github/workflows/ci.yml",
    "BACKLOG.md",
    "DECISIONS.md",
    "app/api/send-correction/route.ts",
    "app/api/send/route.ts",
    "docs/ARCHITECTURE.md",
    "docs/LOCAL_CODEX_EXECUTION.md",
    "docs/handoffs/M1_PLANNING_HANDOFF.md",
    "docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md",
    "docs/milestones/M1_EXTERNAL_ACTION_CONTAINMENT.md",
    "docs/v3/V3-M32_CORRECTIVE_ACTION_BUILDER_SOURCE_OF_TRUTH_CLOSEOUT.md",
    "features/woc/components/CorrectiveActionBuilderShell.tsx",
    "features/woc/components/WocApp.tsx",
    "features/woc/logic/controlledPdfTemplateFoundation.ts",
    "features/woc/state/wocDataModel.ts",
    "package-lock.json",
    "package.json",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
    "scripts/privacy-fixture-check.mjs",
    "scripts/select-milestone.mjs",
    "tests/privacy-fixture-check.test.ts",
    "tests/send-correction.route.test.ts",
    "vitest.config.ts"
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
    "node scripts/validate-scope.mjs --milestone 1",
    "node scripts/governance-regression.mjs",
    "git diff --check"
  ],
  "approval_required": "Human approval is required before merge, deployment, enabling release, or any externally visible action.",
  "unresolved_items": [
    "Real authentication and server-side identity remain absent.",
    "Hosted CI and Vercel preview checks must pass on the pushed repair commit.",
    "Hosted CI and Vercel preview checks remain external verification gates."
  ],
  "recommended_next_action": "Review the pushed repair, verify hosted checks, and stop for explicit approval before merge or deployment."
}
```

## Required Review Evidence

The final handoff records legacy-route deletion, exact email boundary,
employee-ID compatibility, privacy scan, focused tests, typecheck, build,
hosted CI configuration, and final review findings. The new hosted CI result
must be verified after the repair commit is pushed; no hosted pass is asserted
locally. No provider calls occurred and no hosted settings changed. The route
test provider is mocked and the application CI job has no provider credentials.

## Rollback and Risks

Rollback is a reviewed Git revert of the repair commit or a controlled revert
of the complete M1 pull request after human approval. Do not restore the
unauthenticated route or enable email release as an ad hoc rollback. The main
remaining risks are the lack of real authentication, browser-local record
ownership, and the need for independent hosted environment and branch
protection verification.

## Stop Boundary

Stop before merge, deployment, enabling production email release, changing
hosted settings, or changing GitHub/Vercel identity. Do not treat this handoff
as approval for any of those actions.
