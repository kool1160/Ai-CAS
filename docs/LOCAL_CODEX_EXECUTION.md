# Local Codex Execution and Testing

## Required reading

Read the authority files in this order before changing anything:

1. `AI-CAS_PROJECT_SUMMARY.md`
2. `AGENTS.md`
3. `docs/PRODUCT_DIRECTION.md`
4. `docs/PRODUCT_CONSTITUTION.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PRODUCT_TEAM.md`
7. `BACKLOG.md`
8. The selected milestone document
9. `DECISIONS.md`
10. `GLOSSARY.md`

Inspect the actual repository, branch, commit, status, package state, and
relevant historical documents before proposing work.

## Local workflow

```text
git status --short --branch
node scripts/select-milestone.mjs --number 1 --context .ai-cas/selected-milestone.md
bash scripts/ci-contract.sh
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1
node scripts/validate-governance.mjs --check
node scripts/select-milestone.mjs --validate
node scripts/select-milestone.mjs --selected
node scripts/validate-scope.mjs --milestone 1
node scripts/governance-regression.mjs
node scripts/privacy-fixture-check.mjs
git diff --check
git diff --stat
git diff --name-only
```

The generated `.ai-cas/selected-milestone.md` is runtime context only. The
tracked milestone document under `docs/milestones/` is authoritative.

## Application checks

Milestone 1 establishes a lockfile and focused Vitest command. Use an isolated
dependency environment or the CI runner for:

```text
npm ci
npm run build
npm run test:run
npm run typecheck
```

The pull-request workflow keeps governance checks in `Governance contract
checks` and runs application evidence separately in `Application baseline
checks` with fixed Node 22. The application job runs exactly `npm ci`,
`npm run test:run`, `npm run typecheck`, `npm run build`, and
`node scripts/privacy-fixture-check.mjs`. Neither job receives provider
credentials or calls OpenAI, Resend, Supabase, Vercel, or another live service.

Before handoff, validate the selected milestone and M1 handoff:

```text
node scripts/validate-scope.mjs --milestone 1
node scripts/validate-governance.mjs --handoff docs/handoffs/M1_PLANNING_HANDOFF.md --milestone 1
```

Do not provide production environment values to local checks. The email route
is disabled unless `AI_CAS_EMAIL_RELEASE_ENABLED=true` is explicitly supplied,
and no such value is supplied in CI. Use synthetic inputs and mocked provider
boundaries. Never send real documents to OpenAI or real emails through Resend
during repository validation.

The route's server boundary requires `RESEND_API_KEY`,
`REFAB_CONNECT_SEND_PIN`, `REFAB_CONNECT_EMAIL_TO`, and
`REFAB_CONNECT_EMAIL_FROM` only for a deliberately configured non-CI runtime.
The browser's recipient field is not authoritative.

## Approval boundaries

Stop before merge, push, deployment, GitHub/Vercel rename, production-setting
changes, destructive actions, paid services, real sensitive data, or external
publication. Record the boundary in the planning artifact and handoff.

The Foreman implementation workflow is manual `workflow_dispatch` only. CI may
run automatically on pull requests and explicitly configured pushes; that is
validation only and does not authorize implementation, publishing, merging, or
deployment. Foreman uses only `AI_CAS_FOREMAN_OPENAI_API_KEY`, a dedicated
non-production credential with separate limits and rotation. Publishing also
requires the approval-gated `ai-cas-publish-approval` environment and the
false-by-default `repository_protections_verified` operator attestation after
independent GitHub settings verification. Repository files cannot prove that
environment reviewers or branch protection are configured.

The Foreman validates the selected milestone's explicit path scope before and
after implementation. The scope validator includes modified, added, deleted,
and untracked paths, rejects ignored files outside `.ai-cas/`, and defaults to
deny. Foreman patch artifacts are exported from the staged index with
`git diff --cached --binary --full-index`; the execute job stages changes for
artifact construction but never commits them.

The governance CI checkout fetches the base branch history before reconciling
the handoff's exact changed-file list. The contracts prefer local `main` and
fall back to `origin/main` for detached pull-request merge checkouts; they fail
closed when neither reference is available.
