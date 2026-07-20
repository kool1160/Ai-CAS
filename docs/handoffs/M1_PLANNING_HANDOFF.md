# AI-CAS Milestone 1 Planning Handoff

**Milestone number:** 1
**Milestone name:** External-Action Containment and Public-Data Safety
**Status:** Complete
**Selected:** No
**Primary source of truth:** `AI-CAS_PROJECT_SUMMARY.md`
**Base commit:** `a37cd376b19a013d5bc39ec71a7fc87c8c4f9edb`
**Implementation branch:** `codex/milestone-1`
**Pull request:** `#69`
**Reviewed head:** `7c8d2b153cfab9a13c921261cb002ce3c8404327`
**Squash merge commit:** `487d619f85d74a29df3f4b623850161aff29013c`

## Approved Scope

Milestone 1 contained the approved external-action containment, server-owned
email configuration, final-review confirmation, complete reviewed message
content, synthetic public-data, and deterministic validation work. The
product-owner-approved additional paths were:

- `docs/v3/V3-M32_CORRECTIVE_ACTION_BUILDER_SOURCE_OF_TRUTH_CLOSEOUT.md`
- `features/woc/logic/controlledPdfTemplateFoundation.ts`
- `scripts/select-milestone.mjs`
- `scripts/privacy-fixture-check.mjs`
- `docs/handoffs/M1_PLANNING_HANDOFF.md`

No authentication, durable persistence, Supabase, billing, PDF release, hosted
identity migration, deployment, or product-shell redesign was included.

## Implementation Evidence

- The unauthenticated `app/api/send/route.ts` was deleted and no active caller
  uses `/api/send`.
- `/api/send-correction` requires raw
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

```json
{
  "status": "completed",
  "milestone_number": 1,
  "milestone_name": "External-Action Containment and Public-Data Safety",
  "summary": "Contained unsafe email release, removed unverified public fixture identifiers, preserved employee-ID attribution, and separated application validation from governance evidence.",
  "runtime_impact": "Removed the legacy email route and hardened the active send route; no authentication or persistence was added.",
  "data_persistence_impact": "No durable persistence change. Browser-local behavior remains unchanged.",
  "security_impact": "Email release is server-gated by exact configuration, final-review confirmation, server-owned addresses, PIN validation, and bounded attribution input.",
  "privacy_ip_impact": "Tracked application, tests, fixture-like files, and active documentation are checked for a narrow denylist of removed identifiers; synthetic values are used.",
  "deployment_impact": "No hosted settings or environment values changed. Email release remains disabled by default.",
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
    "node scripts/validate-scope.mjs --milestone 1",
    "node scripts/governance-regression.mjs",
    "git diff --check"
  ],
  "approval_required": "Human approval was received before merge. Deployment, enabling email release, and hosted changes still require separate approval.",
  "unresolved_items": [
    "Real authentication and server-side identity remain absent.",
    "Browser-local ownership and persistence remain limitations.",
    "Email release remains disabled by default."
  ],
  "recommended_next_action": "Run the next selected milestone through the manual AI-CAS Foreman workflow."
}
```

## Review and Merge Evidence

- All review threads were resolved.
- Exact-head governance and application CI jobs passed.
- Vercel preview checks passed.
- No provider calls occurred and no hosted settings changed.
- PR `#69` was squash-merged into `main` as
  `487d619f85d74a29df3f4b623850161aff29013c`.

## Rollback and Remaining Risks

Rollback is a reviewed Git revert of the Milestone 1 squash merge. Do not
restore the unauthenticated route or enable email release as an ad hoc rollback.
The main remaining risks are lack of real authentication, browser-local record
ownership, and no durable backend.

## Closed Boundary

Milestone 1 is complete. This handoff does not authorize deployment, enabling
production email release, hosted settings changes, authentication, persistence,
or GitHub/Vercel identity changes.
