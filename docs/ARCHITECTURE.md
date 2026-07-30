# AI-CAS Architecture

## Current evidence

AI-CAS is a mixed Next.js App Router application. The client-heavy workflow
is under `features/woc/`; server routes are under `app/api/`; the print route
is under `app/print-report/`. The current repository has no database client,
authentication framework, server session layer, or middleware. Milestone 1 adds
a lockfile, a focused Vitest route suite, and CI test/build execution; it does
not establish durable persistence or authentication.

## Current runtime boundaries

```text
Browser shell and workflow state
        |
        +-- localStorage: user, drafts, history, setup configuration
        +-- sessionStorage: capture metadata and print handoff
        |
        +-- Next.js API routes
              |
              +-- OpenAI Vision extraction
              +-- OpenAI corrective-action drafting
              +-- server-controlled Resend email sending (disabled by default)
              +-- setup unlock
              +-- non-persisting record validation stub
```

Milestone 2 adds browser-local review metadata to drafts. New drafts record a
confirmed review timestamp and reviewer attribution only after literal final
confirmation. Older or malformed records load as `legacy-unconfirmed`; this is
not authentication, durable auditability, or a server-owned identity claim.
Saved-draft print/export uses a fresh in-memory confirmation and carries the
validated review metadata through the session-storage print handoff. The
browser print page rejects missing or non-literal confirmation evidence.

Milestone 3 adds `features/woc/state/aiContracts.ts` as the shared runtime
contract for both OpenAI Vision extraction and AI corrective-action drafting.
Parsed provider payloads are validated as a plain-object shape before any
field is trusted; a malformed top-level shape fails clearly instead of
becoming a silently accepted blank result. Every accepted field, including
field-source notes and client-supplied drafting input, is length-bounded and
stripped of unsafe control characters. Provider HTTP failures and
timeout/network failures are normalized into generic messages before
reaching the client; raw provider error text is never forwarded. Provider
requests use a fixed request timeout via `AbortSignal.timeout`, and extracted
document text is no longer written to server logs. Existing missing-field
reporting, manual-entry fallback, and the M1/M2 confirmation and email
boundaries are unchanged.

## Target governance boundaries

- The product workflow owns capture, confirmation, correction, drafting,
  review, and controlled actions.
- Extraction owns source interpretation and uncertainty, never approval.
- Records own schemas, attribution, persistence claims, and recovery.
- Security owns identity, secrets, access gates, and external-action gates.
- Deployment owns build, environment, preview, rollback, and production
  readiness without performing deployment automatically.
- CI owns repeatable technical evidence and never calls live providers.
- CI separates governance contract evidence from the application baseline job.
  The application job uses fixed Node 22, `npm ci`, Vitest, TypeScript, build,
  and the tracked-file privacy checker with read-only permissions.
- The Foreman owns coordination and integration, not specialist truth.
- Foreman execution uses a dedicated non-production `AI_CAS_FOREMAN_OPENAI_API_KEY`
  with separate usage limits and rotation; it must not access production data or systems.
- Publishing requires both the approval-gated `ai-cas-publish-approval` environment
  and the operator attestation `repository_protections_verified=true`; GitHub branch
  protection remains an external prerequisite documented in `docs/GITHUB_REPOSITORY_SETUP.md`.
- Selected milestones carry an explicit, default-deny path scope in the tracked
  milestone document and generated `.ai-cas/selected-milestone.md`. Runtime
  changes are allowed only when that selected scope explicitly permits them;
  Milestone 0 permits governance files only.

## Architecture constraints

- Preserve the working product shell during governance work.
- Keep browser-local behavior clearly labeled until durable persistence exists.
- Keep the workflow rule explicit: draft first, confirm accuracy, then save,
  print, export, send, or release. Initial Save Draft and saved-draft
  print/export are both gated in the active client handlers.
- Keep provider calls behind server boundaries and environment variables.
- Email release requires the exact server value
  `AI_CAS_EMAIL_RELEASE_ENABLED=true`, server-configured sender and recipient,
  configured PIN, and literal `finalReviewConfirmed: true`; browser recipient
  values are ignored.
- The outgoing email contains the approved draft and complete report. Evidence
  files are not attached by the current route.
- Submitted-by attribution accepts the current login's email or employee ID as
  bounded plain text in the message body only; it cannot control email headers.
- Public-data checks use `git ls-files` and a narrow denylist for known removed
  fixture identifiers while allowing clearly synthetic values and excluding
  generated artifacts.
- The legacy unauthenticated `/api/send` route is removed; active callers use
  `/api/send-correction` only.
- Keep AI outputs editable, traceable, and subordinate to human review.
- Keep historical Refab Connect and AI-WOC compatibility visible but bounded.
- Record conflicts between repository evidence and
  `AI-CAS_PROJECT_SUMMARY.md`.

## Known open decisions

Authentication, durable persistence, Supabase or another backend, record
ownership, photo retention, PDF generation, and hosted identity migration are
not established by Milestone 0. They require later milestones and explicit
approval.

Milestone 1 adds a reproducible Vitest command and lockfile-backed CI build/test
baseline without changing those deferred architecture decisions. Email release
remains disabled by default in every local and CI context.
