# Milestone 0 - Establish AI-CAS Governance and Foreman Automation

**Status:** Complete
**Selected:** Yes
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

## Acceptance evidence

- Required files exist and are readable.
- JSON files parse and schemas contain required properties.
- Planning, representative result, and handoff artifacts pass the documented deterministic schema subset validator.
- Milestone format validates and exactly one milestone is selected.
- Shell and PowerShell contract scripts parse.
- Secret and sensitive-fixture checks pass.
- YAML is structurally reviewed and uses manual dispatch/least privilege.
- Publishing requires both `ai-cas-publish-approval` environment approval and the false-by-default `repository_protections_verified` operator attestation.
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
