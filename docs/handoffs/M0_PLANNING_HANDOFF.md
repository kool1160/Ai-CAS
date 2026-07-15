# AI-CAS Milestone 0 Planning Handoff

This is the human-readable handoff companion to the machine-readable
Foreman result. The JSON schemas under `.github/codex/schemas/` are the
validation contract.

## Status

`approval_required`

## Milestone

Milestone 0 - Establish AI-CAS Governance and Foreman Automation

## Summary

Establish governance, team boundaries, structured Foreman artifacts, local
contract checks, and separated manual automation without changing product
runtime behavior.

## Files and checks

The implementation result must list every changed file and every validation
command. Application build/test checks are unavailable while the dependency
lockfile and installed dependencies are absent.

## Specialist review

All eleven Product Team roles are materially affected. Each must challenge the
scope using the ownership and evidence rules in `docs/PRODUCT_TEAM.md`.

## Conflicts and assumptions

- The project summary remains primary.
- Historical documents remain lower authority.
- Vercel production state is not locally verified.
- The current product shell remains unchanged.
- No live provider calls are part of CI.

## Approval required

Human approval is required before publishing a branch or draft PR. Merge,
deployment, rename, production settings, external data, and destructive
actions remain separately gated.

## Machine-readable handoff

```json
{
  "status": "approval_required",
  "milestone_number": 0,
  "milestone_name": "Establish AI-CAS Governance and Foreman Automation",
  "summary": "Governance and Foreman automation are implemented and require independent review before publishing.",
  "runtime_impact": "No application runtime files changed.",
  "data_persistence_impact": "No persistence behavior changed.",
  "security_impact": "Foreman uses a dedicated non-production credential and publishing attestation.",
  "privacy_ip_impact": "No real customer, employer, personal, or proprietary data is used.",
  "deployment_impact": "No deployment occurred; repository protection and publishing reviewers require external verification.",
  "files_changed": ["AGENTS.md", "BACKLOG.md", "DECISIONS.md", "GLOSSARY.md", "docs/GITHUB_REPOSITORY_SETUP.md"],
  "tests": ["bash scripts/ci-contract.sh", "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1"],
  "approval_required": "Human approval and independent GitHub settings verification before publishing.",
  "unresolved_items": ["Verify main branch protection and required reviewers for ai-cas-publish-approval."],
  "recommended_next_action": "Perform independent review, then decide whether to publish one draft PR."
}
```
