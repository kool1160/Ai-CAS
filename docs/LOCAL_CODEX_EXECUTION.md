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
node scripts/select-milestone.mjs --number 0 --context .ai-cas/selected-milestone.md
bash scripts/ci-contract.sh
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1
node scripts/validate-governance.mjs --check
node scripts/validate-scope.mjs --milestone 0
node scripts/governance-regression.mjs
git diff --check
git diff --stat
git diff --name-only
```

The generated `.ai-cas/selected-milestone.md` is runtime context only. The
tracked milestone document under `docs/milestones/` is authoritative.

## Application checks

The current repository has no dependency lockfile, no installed dependencies,
and no test script. Do not install packages during governance checks. Report
`npm run build` and application tests as unavailable until a later approved
change establishes reproducible dependency state and a test command.

When those prerequisites exist, the expected commands are:

```text
npm ci
npm run build
npm test
```

Do not provide production environment values to local checks. Use synthetic
inputs and mocked provider boundaries. Never send real documents to OpenAI or
real emails through Resend during repository validation.

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
