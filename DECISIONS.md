# AI-CAS Decisions

## 2026-07-15 - Establish authority precedence

**Decision:** `AI-CAS_PROJECT_SUMMARY.md` is the primary product source of
truth. Governance files follow the authority order documented in `AGENTS.md`.

**Reason:** The product evolved from Refab Connect / AI-WOC and contains
historical planning material. A fixed order prevents old documents from
silently redefining AI-CAS.

**Evidence:** Approved Milestone 0 audit and project summary.

## 2026-07-15 - Use one selected milestone and one reviewable PR

**Decision:** The Foreman selects exactly one milestone and produces at most
one draft pull request for that milestone. Merge and deployment remain human
approval boundaries.

**Reason:** Small, reviewable outcomes make scope, evidence, disagreement, and
rollback visible.

## 2026-07-15 - Keep Foreman execution separate from publishing

**Decision:** Manual Foreman execution may inspect, plan, implement, validate,
and produce artifacts. A separate publishing job requires explicit approval
before creating a branch or draft PR.

**Reason:** Workspace automation should not imply approval to publish external
changes or modify the protected branch.

## 2026-07-15 - CI is offline and evidence-oriented

**Decision:** CI performs deterministic repository checks and does not call
OpenAI, Resend, Supabase, Vercel, or other live services. Application build
and test checks are reported unavailable until a lockfile and test command
exist.

**Reason:** Public CI must not process sensitive data or spend provider
resources, and the current checkout cannot reproduce an application install.

## 2026-07-15 - Historical identity remains bounded

**Decision:** Refab Connect and AI-WOC references remain documented as
historical or compatibility material. New governance uses AI-CAS.

**Reason:** Renaming is a later controlled migration and must not be performed
as part of governance establishment.

## 2026-07-15 - Record known repository conflicts

**Decision:** The Milestone 0 handoff records that the project summary reports
Vercel production verification, while local evidence contains no Vercel link;
that Save Draft does not enforce final review; and that controlled PDF export
is still disabled while browser print-to-PDF exists.

**Reason:** Conflicts are evidence, not permission to silently change runtime
behavior during a governance milestone.

## 2026-07-15 - Isolate Foreman credentials

**Decision:** Foreman execution may use only `AI_CAS_FOREMAN_OPENAI_API_KEY`.
It is a dedicated non-production credential with separate usage limits and
rotation, must not access production data or systems, and missing credentials
fail closed before Codex execution. CI remains offline.

## 2026-07-15 - Use deterministic milestone publishing identity

**Decision:** A milestone's publishing branch is derived from its stable
milestone identity. The workflow stops if that branch exists or if an open,
closed, or merged PR already exists for it; it never force-pushes or duplicates
completed milestone work.

## 2026-07-15 - Treat repository protection as external setup

**Decision:** Branch protection and publishing-environment reviewers are
external GitHub prerequisites. `repository_protections_verified` is only an
operator attestation and cannot prove settings; publishing requires both that
attestation and the protected `ai-cas-publish-approval` environment.

## 2026-07-15 - Separate Foreman and CI trigger policy

**Decision:** Foreman implementation is manual `workflow_dispatch` only. CI
may run automatically on pull requests and explicitly configured pushes, but
CI validation never authorizes implementation, publishing, merging, or deploy.

## 2026-07-20 - Export validated index-based patches

**Decision:** Foreman execution stages the isolated workspace change set only
after scope, secret, privacy, and governance checks pass, then exports a
binary-capable patch from the index. This includes validated new files and
deletions while excluding ignored runtime context and forbidden files. The
execute job never commits.

## 2026-07-20 - Govern runtime changes by selected milestone scope

**Decision:** The general governance contract does not permanently prohibit
runtime paths. A tracked milestone must explicitly declare allowed and
forbidden paths and protected operations; the generated selected context
carries that scope into Foreman execution. Missing, malformed, broad, or
ambiguous scope fails closed. Milestone 0 remains governance-only.

## 2026-07-20 - Use milestone number as publication identity

**Decision:** Foreman publication uses `codex/milestone-<number>` as the stable
branch and collision key. Editable milestone names remain display metadata and
cannot create a second branch or PR for the same milestone number.

## 2026-07-20 - Contain external email release

**Decision:** Real email release is disabled unless the server explicitly sets
`AI_CAS_EMAIL_RELEASE_ENABLED=true`. The server owns recipient and sender
configuration, requires literal final-review confirmation, and sends the
approved draft plus complete submitted report in one provider request.

**Reason:** Browser-controlled destinations, missing review evidence, summary-
only messages, and the unauthenticated legacy route are unsafe external-action
boundaries.

**Evidence:** Approved Milestone 1 product decisions and route regression tests.

## 2026-07-20 - Use synthetic public sample data

**Decision:** Unverified realistic manufacturing and customer identifiers are
replaced with obviously synthetic values on active and public fixture-like
surfaces. Historical product identity references remain bounded and are not a
hosted rename.

**Reason:** Public source, tests, and CI must not expose customer, employer,
personal, or proprietary data.

**Evidence:** Milestone 1 synthetic-data scan and complete diff review.

## 2026-07-20 - Keep privacy checks tracked-file and denylist based

**Decision:** Public application, test, fixture-like, and active documentation
surfaces are scanned from `git ls-files` using a narrow hashed denylist of
known removed fixture identifiers. Clearly synthetic values and generated
directories are permitted or excluded as documented.

**Reason:** Public-data safety needs deterministic coverage without treating
ordinary manufacturing language or every number as sensitive.

## 2026-07-20 - Separate governance evidence from application evidence

**Decision:** Pull requests run governance contract checks and application
baseline checks as separate jobs. The application job uses fixed Node 22,
`npm ci`, Vitest, TypeScript, build, and the tracked-file privacy checker with
read-only permissions and no provider credentials.

**Reason:** Governance validity and runtime build evidence are different claims
and must fail independently.

## 2026-07-20 - Preserve employee identifiers as attribution text

**Decision:** The active client sends `submittedByIdentifier`, sourced from the
current login identifier with the existing setup attribution fallback. The
server accepts bounded email or employee-ID text only for the plain-text body;
it never uses that value as sender, recipient, reply-to, or another header.

**Reason:** The login contract supports employee IDs, and attribution must not
be confused with server-owned email addressing.

## 2026-07-20 - Require a complete M1 planning handoff

**Decision:** M1 is not ready for merge or deployment without a schema-valid
planning handoff whose machine-readable `files_changed` list exactly matches
the final `main...HEAD` change surface.

**Reason:** Reviewers need one durable record of scope, evidence, rollback, and
approval boundaries.
