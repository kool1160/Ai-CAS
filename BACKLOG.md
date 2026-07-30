# AI-CAS Milestone Backlog

The Foreman selects one milestone at a time. A milestone is eligible only when
its status is not Complete, Blocked, Waiting, or Paused. A milestone is not
complete until its evidence and structured handoff exist.

## Foreman queue behavior

The GitHub `AI-CAS Foreman` workflow uses this file as the ordered queue.
When the workflow milestone input is blank, `scripts/select-milestone.mjs`
selects the first eligible milestone in document order. An explicit milestone
number may select a later eligible milestone, but only one tracked milestone
may have `Selected: Yes` at a time.

Current executable queue:

1. Milestone 2 - Human Confirmation Gate Integrity
2. Milestone 3 - AI Extraction Contract and Confidence Safety
3. Milestone 4 - Browser Record Integrity and Recovery

## Milestone 0 - Establish AI-CAS Governance and Foreman Automation

**Status:** Complete

**Selected:** No

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
- CI runs local governance checks without live provider calls.
- Planning, result, and handoff artifacts pass the repository's documented deterministic schema subset validation.
- The selected milestone declares explicit allowed and forbidden paths; scope checks include new and deleted files.
- Foreman patches are staged and exported from the index so validated additions and deletions are included.
- Publication identity is the immutable milestone number, independent of editable milestone names.
- The complete diff contains no application runtime changes or dependency changes.
- Repository-summary conflicts, assumptions, risks, and unavailable checks are recorded.

## Milestone 1 - External-Action Containment and Public-Data Safety

**Status:** Complete

**Selected:** No

Contain unsafe email-release paths, make provider sending fail closed by
default at the server boundary, carry final-review evidence into every active
send request, include the complete reviewed content in the outgoing message,
and replace unverified realistic sample identifiers with synthetic values.

Merge evidence:

- Pull request: `#69`
- Squash merge commit: `487d619f85d74a29df3f4b623850161aff29013c`

Acceptance evidence:

- `app/api/send/route.ts` is deleted and no active caller uses `/api/send`.
- `/api/send-correction` requires the exact server flag
  `AI_CAS_EMAIL_RELEASE_ENABLED=true`, server-configured sender and recipient,
  the configured PIN, and literal `finalReviewConfirmed: true` before one
  provider call is possible.
- Browser-provided recipient values are ignored; missing or unsafe server
  addresses fail closed without provider calls.
- The outgoing message contains the approved email draft and complete report.
- Employee IDs remain bounded submitted-by attribution and cannot control headers.
- Public sample values are synthetic and tracked-file privacy checks run in CI.
- Lockfile-backed test, typecheck, build, governance, and application CI passed.
- No provider call, production environment change, release enablement, or deployment occurred.
- Authentication and durable persistence remain unresolved.

## Milestone 2 - Human Confirmation Gate Integrity

**Status:** Complete

**Selected:** No

Make the locked product rule true everywhere: draft first, confirm accuracy,
then save, print, export, send, or release. Add browser-local review metadata
without claiming authentication or durable auditability.

Merge evidence:

- Pull request: `#72`
- Squash merge commit: `697b84c2be8884e13d6e8a8c25a8504cc33687cf`

Acceptance evidence:

- Initial Save Draft is disabled and handler-rejected until final review is literal `true`.
- Newly saved drafts store confirmed review status, timestamp, reviewer label, and local user ID when available.
- Existing drafts without review metadata load as `legacy-unconfirmed` and are never silently upgraded.
- Saved-draft print/export requires fresh final-review confirmation.
- Reconfirmation updates review metadata without deleting original content or creation time.
- Print handoff and `/print-report` reject missing, false, string, numeric, or malformed confirmation evidence.
- Print errors use active AI-CAS wording and browser print-to-PDF is not described as server PDF generation.
- Existing Milestone 1 email controls remain unchanged and all provider tests stay offline.
- Automated tests, typecheck, build, privacy, scope, governance, and handoff validation pass.

## Milestone 3 - AI Extraction Contract and Confidence Safety

**Status:** In Progress

**Selected:** Yes

Make AI extraction and drafting outputs structurally validated, attributable,
and safely fall back when provider output is malformed, unsupported, uncertain,
or unavailable. Preserve mandatory human confirmation.

Acceptance criteria:

- Vision and drafting responses are validated against explicit runtime schemas before use.
- Malformed, partial, oversized, or contradictory provider responses fail clearly without becoming accepted data.
- Source notes are bounded and do not leak user-derived text into server logs.
- Provider error details are normalized before returning to the client.
- Extraction uncertainty and missing fields remain visible and require human confirmation.
- Manual entry remains available when AI is unavailable or rejected.
- Timeouts and abort handling prevent indefinitely hanging provider requests.
- Deterministic tests use synthetic inputs and mocked provider calls only.
- Existing confirmation, email, privacy, and CI boundaries remain intact.

## Milestone 4 - Browser Record Integrity and Recovery

**Status:** Queued

**Selected:** No

Strengthen the current browser-local record model so drafts and history are
versioned, validated, recoverable, and portable without claiming durable cloud
persistence or activating a backend.

Acceptance criteria:

- Draft and history records use a documented local schema version.
- Stable collision-resistant record IDs replace array-length-derived IDs.
- Malformed records are quarantined or reported instead of silently disappearing.
- Local export produces a clearly labeled, validated AI-CAS backup file.
- Local import validates version, record shape, review metadata, and duplicates before writing.
- Import is previewed and explicitly confirmed; no destructive overwrite occurs by default.
- Existing storage keys remain readable through a tested compatibility path.
- Clear-all behavior remains separately confirmed and does not masquerade as migration.
- No database, authentication, Supabase, cloud sync, or customer-data backend is added.
- Deterministic round-trip, malformed-data, duplicate, migration, and rollback tests pass.

## Future candidates - not yet executable

These are product directions, not queued milestones. They require fresh
repository evidence and explicit selection before the Foreman may execute them:

- active AI-CAS identity alignment without hosted rename;
- company onboarding and bounded routing configuration;
- controlled report/PDF release;
- beta tester instructions, smoke tests, feedback, and support package;
- authentication and durable persistence decision;
- GitHub/Vercel hosted identity migration.
