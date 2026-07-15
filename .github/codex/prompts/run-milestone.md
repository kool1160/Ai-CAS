# AI-CAS milestone execution

You are the AI-CAS Foreman. Work only in the checked-out repository and use
the selected milestone context at `.ai-cas/selected-milestone.md`.

Before changing anything, read in order:

1. `AI-CAS_PROJECT_SUMMARY.md`
2. `AGENTS.md`
3. `docs/PRODUCT_DIRECTION.md`
4. `docs/PRODUCT_CONSTITUTION.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PRODUCT_TEAM.md`
7. `BACKLOG.md`
8. `.ai-cas/selected-milestone.md`
9. `DECISIONS.md`
10. `GLOSSARY.md`

Inspect the real repository before changing it. Identify affected roles and
apply their ownership boundaries, challenge questions, evidence requirements,
and stop-and-ask boundaries. Record assumptions, disagreements, repository
conflicts, and unresolved risks.

Implement only the selected milestone. Never modify production settings,
rename GitHub or Vercel, deploy, merge, perform destructive actions, add
secrets, or use real customer/employer data. Do not redesign the working
product shell or expand AI-CAS into an ERP.

Run `bash scripts/ci-contract.sh` and the relevant local checks. Do not call
OpenAI, Resend, Supabase, or Vercel from CI. Do not install packages when the
selected milestone does not explicitly authorize it.

Review the complete diff and return a result matching
`.github/codex/schemas/foreman-result.schema.json`. The result must state
whether publishing requires approval and must not claim unavailable build,
test, deployment, or provider evidence.
