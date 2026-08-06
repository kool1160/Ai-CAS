# Local Codex Execution and Testing

## Command boundary

Local Codex implementation starts only from the exact command:

```text
Continue AI-CAS
```

Read `OPERATOR_PROTOCOL.md` before acting. `Plan AI-CAS`, `Lock that into
AI-CAS`, `Check AI-CAS`, `Advance AI-CAS`, `Status AI-CAS`, and `Hold AI-CAS`
belong to the planning/review layer, not to implementation.

## Required reading

Read the authority files in this order before changing anything:

1. `AI-CAS_PROJECT_SUMMARY.md`
2. `OPERATOR_PROTOCOL.md`
3. `AGENTS.md`
4. `docs/status/CURRENT.md`
5. The selected milestone document
6. The active issue or tracked gate contract
7. The active pull request, exact head, review threads, and required CI
8. `docs/PRODUCT_DIRECTION.md`
9. `docs/PRODUCT_CONSTITUTION.md`
10. `docs/ARCHITECTURE.md`
11. `docs/PRODUCT_TEAM.md`
12. `BACKLOG.md`
13. `DECISIONS.md`
14. `GLOSSARY.md`

Inspect the actual repository, branch, commit, worktree status, package state,
selected milestone, active PR, review findings, and CI before proposing or
performing work.

## Continue execution order

1. Stop when `docs/status/CURRENT.md` says `Hold: Yes` or the gate is missing.
2. Repair unresolved blocking review findings first, with regression evidence.
3. Repair required CI failures second.
4. If the same PR is green and unblocked, refresh evidence and stop in
   `AWAITING_REVIEW`.
5. Only when no implementation PR exists, implement the smallest complete
   selected-gate vertical slice, test it, open one draft PR, and stop.
6. Block instead of guessing when repository truth, scope, or authority
   conflicts.

Do not merge, close the active issue, mark the milestone complete, select or
begin the next milestone, deploy, rename hosted resources, change production,
force-push, rewrite history, perform destructive actions, or expand scope.
Feature-branch pushes to update the same active draft PR are allowed only when
they are part of the authorized `Continue AI-CAS` task and preserve the exact
review history.

## Local checks

```text
git status --short --branch
node scripts/select-milestone.mjs --validate
node scripts/select-milestone.mjs --selected
node scripts/select-milestone.mjs --context .ai-cas/selected-milestone.md
node scripts/validate-scope.mjs --milestone <selected-number>
node scripts/validate-governance.mjs --check
node scripts/governance-regression.mjs
node scripts/privacy-fixture-check.mjs
bash scripts/ci-contract.sh
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1
git diff --check
git diff --stat
git diff --name-only
```

The generated `.ai-cas/selected-milestone.md` is runtime context only. The
tracked milestone document under `docs/milestones/` is authoritative.

## Application checks

Use an isolated dependency environment or the CI runner for the checks required
by the selected milestone. The current baseline is:

```text
npm ci
npm run test:run
npm run typecheck
npm run build
node scripts/privacy-fixture-check.mjs
```

The pull-request workflow keeps governance and application evidence separate.
CI receives no provider credentials and must not call OpenAI, Resend,
Supabase, Vercel, or another live service. Use synthetic inputs and mocked
provider boundaries. Never send real documents or real email during repository
validation.

## Draft-PR handoff

Before stopping, verify the exact branch head, changed-file surface, selected
milestone, required tests, unresolved risks, and approval boundaries. Update
the same draft PR and tracked handoff. Do not claim evidence that was not run
or that belongs to an earlier SHA.

Return:

```text
AI-CAS M## - AWAITING_REVIEW | BLOCKED
PR: #__
Head: <short SHA>
CI: green | failing | running
Work: <one sentence>
Blocker: none | <one sentence>
Next command: Check AI-CAS | Continue AI-CAS | Plan AI-CAS: <decision>
```

## Permanent approval boundaries

`Continue AI-CAS` never authorizes merge, deployment, GitHub/Vercel rename,
production-setting changes, paid services, authentication, customer-data
backend work, destructive actions, real sensitive data, external publication,
or another controlled action. Those boundaries remain explicit product-owner
decisions. A green result stops for `Check AI-CAS`.

The manual Foreman workflow is `workflow_dispatch` only. It may bootstrap a
selected milestone only when no active implementation PR exists. It is not the
repair path for an existing PR and may not create a parallel repair branch or
duplicate PR. Once a PR exists, local Codex must use `Continue AI-CAS` on that
same branch. Foreman uses only the dedicated non-production
`AI_CAS_FOREMAN_OPENAI_API_KEY`. Draft-PR publication remains separately
approval-gated by `ai-cas-publish-approval` and the external repository-
protection attestation. Repository files cannot prove that branch protection
or environment reviewers are configured.
