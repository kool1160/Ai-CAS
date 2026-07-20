# Milestone 1 - External-Action Containment and Public-Data Safety

**Status:** In Progress
**Selected:** Yes
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Contain unsafe production email-release paths, make real sending fail closed by
default, carry final-review evidence to the server, preserve complete reviewed
content in any accepted message, and remove unverified realistic sample data
from public application and fixture surfaces.

## In scope

- Delete the unauthenticated legacy `/api/send` route.
- Harden `/api/send-correction` with an exact server-controlled release flag,
  server-only destination and sender, strict request validation, a literal
  final-review confirmation, and one provider call per accepted request.
- Include the approved email draft and complete submitted report in the
  outgoing plain-text body without attachments or unsupported evidence claims.
- Carry `finalReviewConfirmed: true` from both active send callers.
- Replace unverified realistic sample identifiers with clearly synthetic values.
- Add Vitest route regression tests, a lockfile, and provider-offline CI
  application test/build steps.
- Update affected architecture, local execution, backlog, decisions, and
  milestone records.

## Out of scope

- Full authentication, Supabase, durable persistence, billing, PDF release, or
  hosted identity migration.
- Provider calls during tests or CI, real customer/employer documents, and
  actual email release.
- Product-shell redesign, navigation rewrite, deployment, production settings,
  environment-value changes, merge, or destructive operations.

## Required environment boundary

Email release remains disabled unless the server environment contains the
exact value `AI_CAS_EMAIL_RELEASE_ENABLED=true`. The server must also provide
`RESEND_API_KEY`, `REFAB_CONNECT_SEND_PIN`, `REFAB_CONNECT_EMAIL_TO`, and
`REFAB_CONNECT_EMAIL_FROM`. These are names only; no values belong in source,
tests, artifacts, or CI. The browser's recipient and sender fields are not
authoritative.

## Required affected roles

- Corrective Action Workflow Engineer
- Security and Access Engineer
- Validation Engineer
- Data and Records Engineer
- Deployment Engineer
- Privacy and IP Guardian
- Manufacturing Operations Engineer
- AI-CAS Foreman

Product and Commercial Engineer and UX and Mobile Workflow Engineer review the
scope for adoption and shell impact. AI Extraction Engineer confirms that this
milestone does not change extraction behavior.

## Approved Change Scope

Scope is default-deny. Exact paths are used for application code; a trailing
`/**` prefix is permitted only for the narrow test directory. Scope does not
authorize secrets, environment values, provider calls, deployment, merge,
identity changes, or destructive operations.

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
- `scripts/select-milestone.mjs`
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

All paths not listed under Allowed paths are forbidden by the default-deny
validator. In particular, no other `app/` or `features/` path is authorized.

### Forbidden operations

- secrets
- environment values
- GitHub/Vercel identity
- production settings
- deployment
- destructive operations
- merge
- real customer or employer data
- live OpenAI, Resend, Supabase, Vercel, or other provider calls from tests or CI
- authentication, Supabase, durable persistence, billing, PDF release, or shell redesign

## Acceptance evidence

- M0 is Complete and not selected; this milestone is In Progress and selected.
- The legacy route is absent and no active caller references `/api/send`.
- Route tests cover disabled/malformed release flags, literal final-review
  confirmation, server-only recipient, missing/unsafe configuration, content
  completeness, header injection, and at-most-once provider invocation.
- `npm ci`, `npm test`, and `npm run build` pass in a clean dependency state.
- CI invokes only local tests/build and governance checks; no provider calls or
  secrets are available to it.
- Synthetic-data scans, secret scans, scope checks, and `git diff --check` pass.
- No application path outside this document's allowed list changes.

## Approval boundaries

The release flag is intentionally disabled by default and this milestone does
not enable it in any environment. Sending, deployment, merge, hosted settings,
identity migration, and real-data testing remain human approval boundaries.

## Known conflicts and decisions

- The repository retains historical Refab Connect / AI-WOC storage keys and
  documentation; this milestone removes active outgoing wording and sample
  identifiers only, without performing a hosted identity migration.
- The current browser-local setup still contains recipient fields for display
  and future configuration, but the server ignores browser-provided recipient
  values for release.
