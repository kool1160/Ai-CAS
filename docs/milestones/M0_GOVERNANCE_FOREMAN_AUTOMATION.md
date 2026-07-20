# Milestone 0 - Establish AI-CAS Governance and Foreman Automation

**Status:** Complete
**Selected:** No
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Establish a reviewable AI-CAS governance layer and safe Foreman automation
without changing application runtime behavior, dependencies, environment
variables, production settings, GitHub identity, or Vercel identity.

## In scope

- Authority documents and product governance.
- Eleven-role Product Team charter.
- Backlog, decisions, glossary, and conflict recording.
- One tracked selected-milestone record.
- Foreman planning, result, and handoff schemas.
- Local contract scripts.
- Manual Foreman workflow with isolated execution and approval-gated publishing.
- Dedicated non-production Foreman credential with fail-closed absence handling.
- Stable milestone branch identity with branch, open-PR, and historical-PR duplicate checks.
- External repository protection and publishing-environment prerequisite documentation.
- Offline CI workflow.
- Ignore rules for generated context and secrets.

## Out of scope

- Application runtime code.
- Product shell redesign.
- `package.json`, dependencies, or lockfile installation.
- Authentication, persistence, Supabase, OpenAI routes, email routes, PDF behavior, or environment values.
- GitHub or Vercel rename.
- Production settings, deployment, merge, or push.
- ERP expansion.

## Required affected roles

All eleven roles in `docs/PRODUCT_TEAM.md` are consulted because governance,
workflow safety, data, validation, deployment, product scope, and privacy are
all materially affected.

## Approved Change Scope

The selected-milestone scope validator uses exact relative paths by default.
Future milestones may use a narrowly controlled trailing `/**` prefix only;
wildcards elsewhere, empty declarations, and broad repository-wide patterns
are invalid. Scope is permission to change files, not permission to bypass
approval boundaries.

### Allowed paths

- `.github/codex/model-default.txt`
- `.github/codex/prompts/run-milestone.md`
- `.github/codex/schemas/foreman-planning.schema.json`
- `.github/codex/schemas/foreman-result.schema.json`
- `.github/codex/schemas/planning-handoff.schema.json`
- `.github/workflows/ai-cas-foreman.yml`
- `.github/workflows/ci.yml`
- `.gitignore`
- `AGENTS.md`
- `AI-CAS_PROJECT_SUMMARY.md`
- `BACKLOG.md`
- `DECISIONS.md`
- `GLOSSARY.md`
- `docs/ARCHITECTURE.md`
- `docs/GITHUB_REPOSITORY_SETUP.md`
- `docs/LOCAL_CODEX_EXECUTION.md`
- `docs/PRODUCT_CONSTITUTION.md`
- `docs/PRODUCT_DIRECTION.md`
- `docs/PRODUCT_TEAM.md`
- `docs/handoffs/M0_PLANNING_HANDOFF.md`
- `docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md`
- `scripts/ci-contract.ps1`
- `scripts/ci-contract.sh`
- `scripts/governance-regression.mjs`
- `scripts/select-milestone.mjs`
- `scripts/validate-governance.mjs`
- `scripts/validate-scope.mjs`

### Forbidden paths

- `app/**`
- `features/**`
- `public/**`
- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `bun.lock`
- `bun.lockb`
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
- merge

## Acceptance evidence

- Required files exist and are readable.
- JSON files parse and schemas contain required properties.
- Planning, representative result, and handoff artifacts pass the documented deterministic schema subset validator.
- Milestone format validates and exactly one milestone is selected.
- Shell and PowerShell contract scripts parse.
- Secret and sensitive-fixture checks pass.
- YAML is structurally reviewed and uses manual dispatch/least privilege.
- Publishing requires both `ai-cas-publish-approval` environment approval and the false-by-default `repository_protections_verified` operator attestation.
- Regression evidence covers denied runtime paths, narrowly approved future runtime paths, added/deleted files, and name-independent milestone publication identity.
- `git diff --check` passes.
- No application runtime file is changed.

## Approval boundaries

The workflow may prepare a patch and artifact. Publishing requires explicit
approval. Merge, deployment, rename, production settings, external data, and
destructive operations remain outside this milestone.

## Known conflicts

The project summary reports Vercel production verification not reproducible
from this checkout; the current Save Draft path does not enforce final review;
and controlled PDF export is disabled even though browser print-to-PDF exists.
These are recorded for later decisions, not changed here.
