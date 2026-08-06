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

## 2026-07-20 - Use a rolling three-milestone Foreman queue

**Decision:** The executable Foreman queue contains Milestones 2, 3, and 4 in
that order. A blank workflow milestone input selects the first eligible item in
`BACKLOG.md`. Only the current milestone carries `Selected: Yes`; each completed
milestone may switch the marker to the next queued milestone within its approved
scope.

**Reason:** A short rolling queue gives the GitHub workflow enough prepared work
to operate while avoiding detailed long-range scopes that could become stale as
the repository changes.

**Evidence:** M1 merge evidence, current repository audit, ordered backlog, and
tracked default-deny scope documents for M2 through M4.

## 2026-07-20 - Stop the queue after Milestone 4 for revalidation

**Decision:** Milestone 4 is the final currently executable queue item. After it
completes, the Foreman must stop and request a product-owner queue refill based
on fresh repository evidence rather than inventing later scope.

**Reason:** Identity alignment, routing, beta readiness, authentication, durable
persistence, and hosted migration contain decisions or external boundaries that
should not be pre-authorized too far in advance.

## 2026-07-22 - Require literal human confirmation before browser-local actions

**Decision:** Milestone 2 keeps initial Save Draft and saved-draft print/export
behind literal boolean final-review confirmation. New and reconfirmed drafts
carry browser-local review status, timestamp, reviewer label, and optional local
user ID. Missing or malformed legacy metadata remains `legacy-unconfirmed`.

**Reason:** The product rule is draft first, confirm accuracy, then save, print,
export, send, or release. Browser-local metadata improves gate integrity but
does not establish authentication, durable persistence, or authoritative audit.

**Evidence:** M2 review-gate, storage migration, and print-handoff tests.

## 2026-07-22 - Keep M2 selected until post-merge closeout

**Decision:** Milestone 2 remains `In Progress` and `Selected: Yes` throughout
its implementation pull request. A separate post-merge closeout may advance the
queue to M3.

**Conflict recorded:** The tracked M2 milestone document contains pre-merge
queue-transition wording that says to mark M2 complete and select M3 on
successful completion. The current lifecycle rule requires human review and
merge before that transition, so this handoff follows the lifecycle rule
without silently rewriting the milestone document.

## 2026-07-30 - Close Milestone 2 and select Milestone 3

**Decision:** PR `#72` was reviewed and squash-merged into `main` as
`697b84c2be8884e13d6e8a8c25a8504cc33687cf`. Milestone 2 is now recorded as
`Complete` and `Selected: No` in `docs/milestones/
M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md`, `BACKLOG.md`, and
`docs/handoffs/M2_PLANNING_HANDOFF.md`. Milestone 3 - AI Extraction Contract
and Confidence Safety is now the sole selected milestone.

**Reason:** This is the post-merge closeout recorded as pending in the
2026-07-22 decision above; the M2 lifecycle conflict is now resolved by
recording the merge evidence rather than by inventing a status ahead of
review.

**Evidence:** GitHub PR `#72` merged state, `git log`/`git diff` verification
of the squash-merge commit against the recorded base commit
`4bd4af9cbef6ffaae8a5012c6d9aafe9bdc570fb`, and `node scripts/select-milestone.mjs
--validate`/`--selected` reporting Milestone 3 as the sole selected milestone.

## 2026-07-30 - Bound and validate AI provider contracts instead of trusting raw output

**Decision:** Milestone 3 adds explicit runtime validation for OpenAI Vision
extraction and AI corrective-action drafting output in
`features/woc/state/aiContracts.ts`. A parsed provider payload that is not a
plain object is rejected with a clear error instead of silently becoming an
accepted all-blank result. Every accepted field, including field-source
notes, is length-bounded and stripped of unsafe control characters. Provider
HTTP failures and network/timeout failures are normalized into generic
messages; raw provider error text is never forwarded to the client. Provider
requests use a fixed timeout via `AbortSignal.timeout`. Extracted document
text (field-source notes) is no longer written to server logs.

**Reason:** The prior implementation coerced individual fields defensively
but never rejected a structurally malformed top-level payload (for example an
array or string response), which could silently present as a valid but blank
extraction or draft. It also forwarded raw `responseBody.error.message` text
to the client and had no request timeout, and it logged extracted
field-source note values.

**Evidence:** `tests/aiContracts.test.ts`, `tests/extract-work-order.route.test.ts`,
and `tests/draft-corrective-action.route.test.ts` cover valid, malformed,
partial, contradictory, oversized, timeout, and provider-unavailable cases
with mocked provider calls only.
