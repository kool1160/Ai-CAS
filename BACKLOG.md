# AI-CAS Milestone Backlog

The Foreman selects one milestone at a time. A milestone is eligible only
when its status is not Complete, Blocked, Waiting, or Paused. A milestone is
not complete until its evidence and structured handoff exist.

## Milestone 0 - Establish AI-CAS Governance and Foreman Automation

**Status:** Complete

Create the product governance layer, eleven-role team charter, selected
milestone record, structured planning/result schemas, local contract checks,
and separated manual Foreman/CI workflows. Preserve the existing product
shell and application behavior.

Acceptance criteria:

- The authority order is explicit and names `AI-CAS_PROJECT_SUMMARY.md` as primary.
- Product direction, constitution, architecture, team, backlog, decisions, and glossary exist.
- All eleven roles define ownership, challenge, evidence, stop boundaries, and Foreman relationship.
- The authoritative selected milestone is tracked in `docs/milestones/`.
- Planning, result, and handoff schemas parse and validate representative examples.
- The Foreman workflow is manual, isolated, approval-gated for publishing, and cannot merge or deploy.
- Foreman execution fails closed without the dedicated non-production `AI_CAS_FOREMAN_OPENAI_API_KEY`; publishing uses a stable milestone branch and stops when any branch or historical PR already exists.
- Publishing requires both the approval-gated environment and the false-by-default `repository_protections_verified` operator attestation; branch protection remains an external prerequisite.
- CI runs local governance checks without package installation or live provider calls.
- Planning, result, and handoff artifacts pass the repository's documented deterministic schema subset validation.
- The complete diff contains no application runtime changes or dependency changes.
- Repository-summary conflicts, assumptions, risks, and unavailable checks are recorded.

## Future milestone placeholders

Future milestones must be added only after Milestone 0 is reviewed. Likely
areas include persistence/ownership, authentication, privacy and AI data
handling, controlled report release, routing configuration, and beta readiness.
