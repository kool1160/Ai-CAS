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
