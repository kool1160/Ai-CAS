# AI-CAS Agent Instructions

AI-CAS is a guided corrective-action system for manufacturing and operations.
It is not an ERP, an unattended release system, or a replacement for human
engineering, quality, or production judgment.

## Authority order

Agents must read and follow these sources in order:

1. `AI-CAS_PROJECT_SUMMARY.md`
2. `AGENTS.md`
3. `docs/PRODUCT_DIRECTION.md`
4. `docs/PRODUCT_CONSTITUTION.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PRODUCT_TEAM.md`
7. `BACKLOG.md`
8. The selected milestone document in `docs/milestones/`
9. `DECISIONS.md`
10. `GLOSSARY.md`
11. Historical documents under `docs/`

The project summary is the primary product source of truth. Repository
evidence that conflicts with it must be recorded in the result and in
`DECISIONS.md`; it must not be silently resolved.

## Operating rules

- Work on one selected milestone at a time.
- Produce one reviewable pull request per milestone.
- Never push directly to `main`.
- Never merge, deploy, rename GitHub or Vercel, or change production settings automatically.
- The AI-CAS Foreman implementation workflow is manual `workflow_dispatch` only; it must not trigger from push or pull request.
- CI may run automatically on pull requests and explicitly configured pushes, but CI validation is not implementation, publishing, merging, or deployment.
- Do not perform destructive Git or file-system actions.
- Do not place real customer or employer data in tests, prompts, fixtures, logs, or CI.
- Never commit secrets or API keys.
- Foreman execution uses only the dedicated `AI_CAS_FOREMAN_OPENAI_API_KEY`; it must be non-production, separately limited and rotated, and unable to access production data or systems. Missing credentials stop execution safely.
- CI must not call OpenAI, Resend, Supabase, or Vercel.
- Human approval is required before sending, saving an authoritative record, releasing, deleting, publishing, deploying, or performing an externally visible action.
- Do not redesign the existing product shell without an approved product decision.
- Do not expand AI-CAS into an ERP.
- Do not let FXD-specific material redefine AI-CAS.
- Record disagreements, assumptions, conflicts, and unresolved risks.
- Evidence is required before a milestone may be marked complete.

Repository branch protection and the `ai-cas-publish-approval` environment are
external GitHub settings documented in `docs/GITHUB_REPOSITORY_SETUP.md`.
Repository files cannot prove that required reviewers or protections exist.

## Milestone execution

1. Read the authority files.
2. Inspect the real repository and report material differences.
3. Select exactly one milestone.
4. Identify the affected specialist roles.
5. Produce a structured planning artifact.
6. Implement only the approved scope.
7. Run the repository contract checks and risk-appropriate tests.
8. Review the complete diff and confirm the application boundary.
9. Produce a structured result and planning handoff.
10. Stop at approval boundaries.

The Foreman integrates the team but cannot override this document, the
Product Constitution, deterministic validation, or an approval boundary.
