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
- The selected milestone declares explicit allowed and forbidden paths; scope checks include new and deleted files, while Milestone 0 continues to reject runtime changes.
- Foreman patches are staged and exported from the index so validated additions and deletions are included.
- Publication identity is the immutable milestone number, independent of editable milestone names.
- The complete diff contains no application runtime changes or dependency changes.
- Repository-summary conflicts, assumptions, risks, and unavailable checks are recorded.

## Milestone 1 - External-Action Containment and Public-Data Safety

**Status:** In Progress

**Selected:** Yes

Contain unsafe email-release paths, make provider sending fail closed by
default at the server boundary, carry final-review evidence into every active
send request, include the complete reviewed content in the outgoing message,
and replace unverified realistic sample identifiers with synthetic values.

Acceptance criteria:

- `app/api/send/route.ts` is deleted and no active caller uses `/api/send`.
- `/api/send-correction` requires the exact server flag
  `AI_CAS_EMAIL_RELEASE_ENABLED=true`, server-configured sender and recipient,
  the configured PIN, and literal `finalReviewConfirmed: true` before one
  provider call is possible.
- Browser-provided recipient values are ignored; missing or unsafe server
  addresses fail closed without provider calls.
- The outgoing plain-text message contains the approved email draft, complete
  report, work-order/part context, correction type, affected area, available
  company/submitted-by context, AI-CAS draft/review attribution, and no claim
  that evidence is attached.
- Focused Vitest coverage proves release-flag, confirmation, recipient,
  content, header-injection, and at-most-once provider-call behavior.
- Public sample values are obviously synthetic and no real customer, employer,
  personal, or proprietary data is added to tests or CI.
- A lockfile and test command make the application checks reproducible; CI runs
  tests and a build without live provider calls.
- Authentication, Supabase, durable persistence, billing, PDF release, hosted
  identity migration, and shell redesign remain out of scope.

## Future milestone placeholders

Future milestones must be added only after Milestone 0 is reviewed. Likely
areas include persistence/ownership, authentication, privacy and AI data
handling, controlled report release, routing configuration, and beta readiness.
