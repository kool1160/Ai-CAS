# AI-CAS Architecture

## Current evidence

AI-CAS is a mixed Next.js App Router application. The client-heavy workflow
is under `features/woc/`; server routes are under `app/api/`; the print route
is under `app/print-report/`. The current repository has no database client,
authentication framework, server session layer, middleware, test suite,
lockfile, or CI workflow.

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
              +-- Resend email sending
              +-- setup unlock
              +-- non-persisting record validation stub
```

## Target governance boundaries

- The product workflow owns capture, confirmation, correction, drafting,
  review, and controlled actions.
- Extraction owns source interpretation and uncertainty, never approval.
- Records own schemas, attribution, persistence claims, and recovery.
- Security owns identity, secrets, access gates, and external-action gates.
- Deployment owns build, environment, preview, rollback, and production
  readiness without performing deployment automatically.
- CI owns repeatable technical evidence and never calls live providers.
- The Foreman owns coordination and integration, not specialist truth.
- Foreman execution uses a dedicated non-production `AI_CAS_FOREMAN_OPENAI_API_KEY`
  with separate usage limits and rotation; it must not access production data or systems.
- Publishing requires both the approval-gated `ai-cas-publish-approval` environment
  and the operator attestation `repository_protections_verified=true`; GitHub branch
  protection remains an external prerequisite documented in `docs/GITHUB_REPOSITORY_SETUP.md`.

## Architecture constraints

- Preserve the working product shell during governance work.
- Keep browser-local behavior clearly labeled until durable persistence exists.
- Keep provider calls behind server boundaries and environment variables.
- Keep AI outputs editable, traceable, and subordinate to human review.
- Keep historical Refab Connect and AI-WOC compatibility visible but bounded.
- Record conflicts between repository evidence and
  `AI-CAS_PROJECT_SUMMARY.md`.

## Known open decisions

Authentication, durable persistence, Supabase or another backend, record
ownership, photo retention, PDF generation, and hosted identity migration are
not established by Milestone 0. They require later milestones and explicit
approval.
