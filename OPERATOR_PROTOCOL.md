# AI-CAS Operator Protocol

This file defines the command-driven operating system for AI-CAS.

AI-CAS keeps one repository, one active gate, and one next valid command.
The product owner does not carry implementation instructions between chats or
agents. GitHub holds the durable plan, scope, evidence, review findings, and
status.

> Chat decides. GitHub remembers. Codex executes. Pull requests hold the
> evidence. The product owner receives the verdict and next command.

## Authority order

For product and project work, read and follow these sources in order:

1. Explicit product-owner instruction for the current task
2. `AI-CAS_PROJECT_SUMMARY.md`
3. `OPERATOR_PROTOCOL.md`
4. `AGENTS.md`
5. `docs/status/CURRENT.md`
6. The sole selected milestone document under `docs/milestones/`
7. The active GitHub issue or tracked gate contract
8. The active pull request, exact head, review threads, and required CI
9. `docs/PRODUCT_DIRECTION.md`
10. `docs/PRODUCT_CONSTITUTION.md`
11. `docs/ARCHITECTURE.md`
12. `docs/PRODUCT_TEAM.md`
13. `BACKLOG.md`, `DECISIONS.md`, and `GLOSSARY.md`
14. Historical documents

A lower source cannot silently override a higher source. A conflict is a
blocker: record it, verify the implementation, and stop instead of guessing.
The project summary may be updated only with repository evidence and explicit
product-owner approval.

## The seven commands

### `Plan AI-CAS: <idea>`

**Use:** Planning/review chat.

Discuss product intent, workflow, priority, concern, safety boundary, or
architecture. No repository or runtime change is authorized.

**Result:** A clear decision, question, or rejected idea.

**Normal next command:** `Lock that into AI-CAS`.

### `Lock that into AI-CAS`

**Use:** Planning/review chat.

Write the accepted decision to the correct GitHub issue, selected milestone,
requirement, ADR/decision record, status record, or pull-request finding.
Locking a decision does not authorize implementation.

**Result:** Codex can discover the decision from GitHub without the product
owner carrying a prompt between tools.

**Normal next command:** `Continue AI-CAS`.

### `Continue AI-CAS`

**Use:** Codex or the manual AI-CAS Foreman workflow only.

This is the only normal implementation command. Read repository truth before
changing anything, then follow this order:

1. If AI-CAS is held, stop.
2. If the active pull request has unresolved blocking findings, repair only
   those findings, add regression evidence, update the same draft pull
   request, and stop.
3. If required CI is failing, diagnose and repair only the failure within the
   active gate, update the same draft pull request, and stop.
4. If the pull request is green with no unresolved blocker, refresh evidence
   and stop in `AWAITING_REVIEW`.
5. If no implementation pull request exists, build the smallest complete
   vertical slice allowed by the selected milestone, test it, open one draft
   pull request, and stop.
6. If repository truth conflicts, the selected gate is missing, or the needed
   path or action is outside scope, record `BLOCKED` and stop.

`Continue AI-CAS` never means:

- merge a pull request;
- close the active issue or gate;
- mark a milestone complete;
- select, activate, or begin the next milestone;
- deploy, publish a release, rename hosted resources, or change production;
- redesign unrelated architecture or the product shell;
- expand AI-CAS into an ERP;
- weaken human confirmation, deterministic validation, privacy, or safety;
- create speculative infrastructure;
- force-push, rewrite history, or perform destructive work;
- dump a duplicate project report into chat.

**Result:** The same draft pull request is `AWAITING_REVIEW` or `BLOCKED`.

**Normal next command:** `Check AI-CAS` or `Continue AI-CAS` when a recorded
repair is required.

### `Check AI-CAS`

**Use:** Planning/review chat.

Independently inspect the selected milestone, active issue, exact pull-request
head, complete diff, acceptance criteria, tests, required workflows, review
threads, product boundaries, and safety boundaries. Detailed findings belong
on GitHub.

Return exactly one verdict:

- `READY` — the reviewed exact head satisfies the gate;
- `REPAIR` — a bounded fix is required on the same pull request;
- `BLOCKED` — approval, missing evidence, repository conflict, or an external
  prerequisite prevents a valid review.

A green check is evidence, not permission to merge.

**Normal next command:** `Advance AI-CAS`, `Continue AI-CAS`, or
`Plan AI-CAS: <decision>`.

### `Advance AI-CAS`

**Use:** Planning/review chat after an explicit product-owner command.

Advancement is permitted only when all of the following are true:

- the exact reviewed head has not changed;
- every required GitHub workflow is green on that head or the repository's
  reviewed merge ref;
- no unresolved blocking review thread remains;
- milestone acceptance and exit criteria are satisfied;
- product, safety, privacy, deployment, and approval boundaries remain intact;
- rollback is understood;
- the product owner explicitly issued `Advance AI-CAS`.

Then, and only then:

1. merge using the established repository method and expected head SHA;
2. verify the merge result;
3. close the active issue or gate when applicable;
4. update `docs/status/CURRENT.md` with exact merge and verification evidence;
5. mark the completed milestone and select exactly one approved next gate;
6. stop before implementing that next gate.

`Advance AI-CAS` does not authorize production deployment, hosted rename,
paid services, destructive migration, external sending, or another controlled
action unless the product owner separately approves that action.

**Result:** The next gate is active; implementation has not begun.

**Normal next command:** `Continue AI-CAS`.

### `Status AI-CAS`

**Use:** Planning/review chat.

Read the selected milestone, active issue, active pull request, exact head,
required CI, review state, hold state, approval blockers, and
`docs/status/CURRENT.md` without reviewing, implementing, merging, or changing
anything.

**Result:** A compact status and the next valid command.

### `Hold AI-CAS`

**Use:** Planning/review chat or Codex.

Pause implementation, repair, review completion, merge, and milestone
advancement while preserving the branch, pull request, findings, and evidence.
No parallel implementation gate may be started while AI-CAS is held.

**Result:** `HELD` until the product owner explicitly resumes with a valid
command.

## Role boundaries

### Product owner

The product owner controls product identity, scope, milestone order, material
workflow changes, safety boundaries, commercialization, deployment, and every
explicit approval boundary.

### Planning/review Foreman

The Foreman plans, records accepted decisions, checks repository truth, writes
detailed findings to GitHub, reports the verdict, and advances only after the
exact command and safety check. The Foreman does not use planning authority as
implementation authority and cannot self-authorize merge or deployment.

### Codex / implementation specialist

Codex receives `Continue AI-CAS`, implements or repairs only the active gate,
adds evidence, updates the same draft pull request, and stops. Codex does not
select scope, merge, close, advance, deploy, or reinterpret a conflict.

### Independent reviewer

The reviewer challenges the exact pushed head and acceptance criteria. A review
of an earlier SHA does not transfer to a later SHA.

## Permanent product and safety boundaries

The command system cannot override AI-CAS product safety:

- AI-CAS remains a guided corrective-action system, not an ERP, autonomous
  release system, diagnostic authority, CAM system, or replacement for human
  engineering, quality, or production judgment.
- The operator flow remains simple and the final human confirmation gate
  remains mandatory.
- Draft first. Confirm accuracy. Then save, send, release, or perform another
  controlled action.
- AI output cannot bypass deterministic rules, missing-field handling,
  approval gates, or manual fallback.
- No real customer, employer, personal, or proprietary data belongs in public
  tests, prompts, fixtures, logs, or CI.
- No secrets, live provider calls from CI, production deployment, hosted
  rename, paid service, destructive migration, or external action occurs
  without the required explicit approval.
- No direct push to `main`, force-push, hidden scope expansion, or parallel
  milestone implementation.

## Compact completion formats

### Codex completion

```text
AI-CAS M## - AWAITING_REVIEW | BLOCKED
PR: #__
Head: <short SHA>
CI: green | failing | running
Work: <one sentence>
Blocker: none | <one sentence>
Next command: Check AI-CAS | Continue AI-CAS | Plan AI-CAS: <decision>
```

### Review completion

```text
AI-CAS M## PR #__ - READY | REPAIR | BLOCKED
Head: <short SHA>
CI: green | failing | running
Finding: none | <one or two blocking reasons>
Next command: Advance AI-CAS | Continue AI-CAS | Plan AI-CAS: <decision>
```

### Status completion

```text
AI-CAS M## - ACTIVE | AWAITING_REVIEW | BLOCKED | HELD
PR: none | #__
Head: <short SHA or none>
CI: green | failing | running | none
Blocker: none | <one sentence>
Next command: <one valid command>
```

## Operating loop

```text
Plan AI-CAS: <idea>
        ↓
Lock that into AI-CAS
        ↓
Continue AI-CAS
        ↓
Check AI-CAS
   ↙             ↘
REPAIR           READY
   ↓               ↓
Continue AI-CAS  Advance AI-CAS
                    ↓
               Continue AI-CAS
```

One repo. One active gate. One next command.
