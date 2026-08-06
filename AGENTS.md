# AI-CAS Agent Instructions

AI-CAS is a guided corrective-action system for manufacturing and operations.
It is not an ERP, an unattended release system, or a replacement for human
engineering, quality, or production judgment.

## Authority order

Agents must read and follow these sources in order:

1. Explicit product-owner instruction for the current task
2. `AI-CAS_PROJECT_SUMMARY.md`
3. `OPERATOR_PROTOCOL.md`
4. `AGENTS.md`
5. `docs/status/CURRENT.md`
6. The sole selected milestone document in `docs/milestones/`
7. The active GitHub issue or tracked gate contract
8. The active pull request, exact head, review threads, and required CI
9. `docs/PRODUCT_DIRECTION.md`
10. `docs/PRODUCT_CONSTITUTION.md`
11. `docs/ARCHITECTURE.md`
12. `docs/PRODUCT_TEAM.md`
13. `BACKLOG.md`
14. `DECISIONS.md`
15. `GLOSSARY.md`
16. Historical documents under `docs/`

The project summary is the primary product source of truth. Repository
evidence that conflicts with it must be recorded in the result and in
`DECISIONS.md`; it must not be silently resolved. Update the summary only with
evidence and explicit product-owner approval.

## Command contract

The seven commands and their permissions are defined in
`OPERATOR_PROTOCOL.md`:

- `Plan AI-CAS: <idea>` - discuss only;
- `Lock that into AI-CAS` - record an accepted decision only;
- `Continue AI-CAS` - Codex implements or repairs the active gate, then stops;
- `Check AI-CAS` - independently review the exact head;
- `Advance AI-CAS` - merge and activate the next gate only after READY and an
  explicit product-owner command;
- `Status AI-CAS` - read-only status;
- `Hold AI-CAS` - pause while preserving state.

Only `Continue AI-CAS` authorizes normal implementation. It never authorizes
merge, issue closure, milestone completion, next-gate selection, deployment,
hosted rename, destructive action, product redesign, or scope expansion.

Only `Advance AI-CAS` may authorize merge and gate advancement, and only after
the exact reviewed head, required CI, review threads, acceptance criteria,
rollback, and product boundaries are reverified. Advancement stops after the
next gate is selected; it does not implement that gate.

## Operating rules

- Keep one repository, one selected milestone, one active implementation pull
  request, and one next valid command.
- Work on one selected milestone at a time.
- Produce one reviewable pull request per milestone unless the product owner
  explicitly changes the gate contract and the decision is recorded.
- Never push directly to `main`.
- Never force-push or rewrite published history.
- Never merge, deploy, rename GitHub or Vercel, or change production settings
  automatically.
- The AI-CAS Foreman implementation workflow is manual `workflow_dispatch` only and is the repository implementation path for the exact `Continue AI-CAS` command.
- CI may run automatically on pull requests and explicitly configured pushes,
  but CI validation is not implementation, review approval, merge, publishing,
  advancement, or deployment.
- Review approval applies only to the exact pushed SHA that was checked.
- Blocking review findings are repaired before new scope. CI failures are
  repaired before new implementation. A green PR stops for `Check AI-CAS`.
- Block instead of guessing when scope, authority, repository truth, or an
  approval boundary is unclear.
- Do not perform destructive Git or file-system actions.
- Do not place real customer or employer data in tests, prompts, fixtures,
  logs, or CI.
- Never commit secrets or API keys.
- Foreman execution uses only the dedicated
  `AI_CAS_FOREMAN_OPENAI_API_KEY`; it must be non-production, separately
  limited and rotated, and unable to access production data or systems.
  Missing credentials stop execution safely.
- CI must not call OpenAI, Resend, Supabase, Vercel, or another live provider.
- Human approval is required before sending, saving an authoritative record,
  releasing, deleting, publishing, deploying, or performing an externally
  visible action.
- Do not redesign the existing product shell without an approved product
  decision.
- Do not expand AI-CAS into an ERP.
- Do not let FXD-specific or LaserX-specific product material redefine
  AI-CAS. Only the command discipline is shared.
- Record disagreements, assumptions, conflicts, and unresolved risks.
- Evidence is required before a milestone may be marked complete.

Repository branch protection and the `ai-cas-publish-approval` environment are
external GitHub settings documented in `docs/GITHUB_REPOSITORY_SETUP.md`.
Repository files cannot prove that required reviewers or protections exist.

## Continue AI-CAS execution order

1. Read the authority files and `docs/status/CURRENT.md`.
2. Inspect the real repository, selected milestone, active PR, exact head,
   review threads, and required CI.
3. Stop if the project is held or the gate is missing or contradictory.
4. Repair unresolved blocking review findings first.
5. Repair required CI failures second.
6. If the same PR is green and unblocked, refresh evidence and stop in
   `AWAITING_REVIEW`.
7. Only when no implementation PR exists, implement the smallest complete
   selected-gate vertical slice and open one draft PR.
8. Run repository contract checks and risk-appropriate tests.
9. Update the same handoff and draft PR with exact evidence.
10. Stop at the next command boundary.

The planning/review Foreman integrates the project but cannot override the
project summary, `OPERATOR_PROTOCOL.md`, the Product Constitution,
deterministic validation, human confirmation, or an approval boundary.
