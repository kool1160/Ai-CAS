# Milestone 1 - External-Action Containment and Public-Data Safety

**Status:** Complete
**Selected:** No
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`
**Pull request:** `#69`
**Merge commit:** `487d619f85d74a29df3f4b623850161aff29013c`

## Goal

Contain unsafe production email-release paths, make real sending fail closed by
default, carry final-review evidence to the server, preserve complete reviewed
content in any accepted message, and remove unverified realistic sample data
from public application and fixture surfaces.

## Completed scope

- Deleted the unauthenticated legacy `/api/send` route.
- Hardened `/api/send-correction` with an exact server-controlled release flag,
  server-only destination and sender, strict request validation, a literal
  final-review confirmation, and one provider call per accepted request.
- Included the approved email draft and complete submitted report in the
  outgoing plain-text body without attachments or unsupported evidence claims.
- Carried `finalReviewConfirmed: true` from both active send callers.
- Replaced unverified realistic sample identifiers with clearly synthetic values.
- Added Vitest route regression tests, a lockfile, explicit application test and
  typecheck scripts, and provider-offline CI test/typecheck/build steps.
- Added a tracked-file privacy checker with a narrow denylist and deterministic
  tests for prohibited, synthetic, generated, and untracked-file behavior.
- Preserved employee-ID or email attribution as bounded plain text in the
  reviewed message body without using it for email addressing.
- Added a schema-valid Milestone 1 planning handoff and reconciled the exact
  pull-request change surface.

## Environment boundary retained

Email release remains disabled unless the server environment contains the
exact value `AI_CAS_EMAIL_RELEASE_ENABLED=true`. The server must also provide
`RESEND_API_KEY`, `REFAB_CONNECT_SEND_PIN`, `REFAB_CONNECT_EMAIL_TO`, and
`REFAB_CONNECT_EMAIL_FROM`. No values are stored in source, tests, artifacts,
or CI. Browser recipient and sender values are not authoritative.

## Acceptance evidence

- PR `#69` was reviewed, all review threads were resolved, and exact-head CI
  passed separate governance and application jobs.
- Vercel preview checks passed before merge.
- The legacy route is absent and no active caller references `/api/send`.
- Route tests cover disabled and malformed release flags, literal final-review
  confirmation, server-only recipient, missing and unsafe configuration,
  complete content, header injection, employee-ID attribution, and at-most-once
  provider invocation.
- `npm ci`, `npm run test:run`, `npm run typecheck`, and `npm run build` passed.
- Synthetic-data scans, secret scans, scope checks, and `git diff --check` passed.
- No provider call, production credential, hosted setting change, release
  enablement, or deployment occurred.
- Squash merge commit is
  `487d619f85d74a29df3f4b623850161aff29013c`.

## Remaining limitations

- Real authentication and server-side user identity are not implemented.
- Drafts and history remain browser-local and are not durable authoritative records.
- Browser print-to-PDF is not controlled server PDF generation.
- Historical Refab Connect / AI-WOC compatibility strings remain bounded for
  later identity work.

## Historical approved change scope

The list below records the scope used for implementation and review. It is not
an active authorization after completion.

## Approved Change Scope

### Allowed paths

- `.github/workflows/ci.yml`
- `BACKLOG.md`
- `DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/LOCAL_CODEX_EXECUTION.md`
- `docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md`
- `docs/milestones/M1_EXTERNAL_ACTION_CONTAINMENT.md`
- `docs/v3/V3-M32_CORRECTIVE_ACTION_BUILDER_SOURCE_OF_TRUTH_CLOSEOUT.md`
- `features/woc/components/CorrectiveActionBuilderShell.tsx`
- `features/woc/components/WocApp.tsx`
- `features/woc/logic/controlledPdfTemplateFoundation.ts`
- `features/woc/state/wocDataModel.ts`
- `app/api/send/route.ts`
- `app/api/send-correction/route.ts`
- `package.json`
- `package-lock.json`
- `scripts/ci-contract.sh`
- `scripts/ci-contract.ps1`
- `scripts/privacy-fixture-check.mjs`
- `scripts/select-milestone.mjs`
- `docs/handoffs/M1_PLANNING_HANDOFF.md`
- `tests/**`
- `vitest.config.ts`

### Forbidden paths

- `public/**`
- `.vercel/**`
- `vercel.json`
- `.env`
- `pnpm-lock.yaml`
- `yarn.lock`
- `bun.lock`
- `bun.lockb`

### Forbidden operations

- secrets
- environment values
- GitHub/Vercel identity
- production settings
- deployment
- destructive operations
- merge without human approval
- real customer or employer data
- live OpenAI, Resend, Supabase, Vercel, or other provider calls from tests or CI
- authentication, Supabase, durable persistence, billing, PDF release, or shell redesign
