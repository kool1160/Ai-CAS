# CLAUDE V7 Whole-App Audit Handoff

## Milestone

V7-M1 — Create Whole-App Audit Package for Claude

## Audit Purpose

Perform a whole-app audit to identify V7 cleanup candidates only.

V7 begins after V6 closeout. V6 is locked as the controlled PDF/email baseline for AI-CAS corrective action packages. The audit should help plan V7 cleanup work without destabilizing the locked V6 controlled baseline.

## Baseline Context

V6 is closed and locked as the controlled PDF/email baseline. Treat the following as locked V6 behavior unless a critical gate or security issue is discovered:

- Controlled PDF generation
- Controlled review PDF download
- Controlled email delivery with the generated PDF package
- Final human review gating
- Email send gating, including generated package requirement and Send PIN requirement
- Text-only evidence photo handling in PDF/email outputs
- Simple Mode preservation
- AI-CAS-only closeout branding along the controlled PDF/email path

## Hard Rule

Do not recommend reopening V6 unless there is a critical gate or security issue.

If a concern is a polish issue, naming inconsistency, dead code concern, cleanup candidate, quality limitation, or maintainability issue, classify it as V7 work instead of V6 reopen work.

## Audit Scope

Audit the current application and documentation surface for V7 cleanup planning. Focus on risks, stale artifacts, and maintainability problems that can be addressed after the V6 closeout lock.

### Required Focus Areas

1. **Stale branding strings**
   - Search for and classify remaining references to:
     - `Refab`
     - `Refab Connect`
     - `AI-WOC`
     - `Work Order Correction System`
     - `Engineering Correction Report`
   - Distinguish between runtime/user-facing strings, internal comments, historical documentation, and intentional legacy references.

2. **Simple Mode drift risk**
   - Identify areas where full-mode changes could unintentionally affect Simple Mode.
   - Flag shared components, props, storage keys, review flows, and conditional rendering risks.

3. **Duplicate disabled placeholders**
   - Identify repeated disabled buttons, placeholder UI, duplicated status cards, or redundant “coming soon” elements.
   - Recommend whether each duplicate should be consolidated, removed, or kept.

4. **Unused props or dead code**
   - Identify props, state, functions, helpers, constants, or branches that appear unused or obsolete.
   - Prioritize findings that create confusion around review, PDF, email, or Simple Mode behavior.

5. **Review screen cleanup opportunities**
   - Inspect the review/final review experience for redundant controls, confusing labels, unclear disabled states, and cleanup opportunities.
   - Do not propose behavior changes unless clearly framed as V7 planning candidates.

6. **PDF serializer quality limitations**
   - Identify limitations of the current PDF serialization approach.
   - Separate quality/library upgrade candidates from correctness, security, or gating issues.
   - Do not reopen V6 for serializer quality limitations unless the limitation breaks a critical controlled-output gate.

7. **API route risks**
   - Audit API routes for input validation, gate enforcement, error handling, logging, environment assumptions, and sensitive data exposure risks.
   - Flag any critical gate/security issue separately from normal V7 cleanup.

8. **Local/session storage risks**
   - Identify risks related to stale local/session storage, key naming, persistence boundaries, sensitive data, reset behavior, Simple Mode drift, and migration/compatibility.

9. **Mobile layout risks**
   - Identify mobile or tablet layout risks such as overlapping badges, horizontal overflow, cramped review controls, fixed-width elements, and touch target problems.

10. **Documentation/source-of-truth consistency**
    - Compare docs and source-of-truth statements for consistency with the locked V6 baseline and intended V7 planning boundary.
    - Do not recommend editing V6 closeout docs unless a critical factual issue would mislead gate/security decisions.

## Severity Guidance

Group cleanup candidates by severity:

- **Critical** — Gate/security issue that may justify reopening V6.
- **High** — V7 cleanup needed soon to reduce user-facing confusion, data risk, or major maintainability risk.
- **Medium** — V7 cleanup that improves consistency, maintainability, or quality but does not threaten locked V6 behavior.
- **Low** — Cosmetic, documentation, naming, or minor code hygiene cleanup.
- **No Action / Keep Locked** — Intentional behavior or historical reference that should not be changed.

## Expected Claude Return Format

Return exactly the following sections:

```md
# CLAUDE V7 WHOLE-APP AUDIT RESULT

## Result

PASS / PASS WITH NOTES / FAIL

## Executive Summary

- ...

## Critical Findings — Potential V6 Reopen Only

- ...

## Cleanup Candidates by Severity

### High

- ...

### Medium

- ...

### Low

- ...

### No Action / Keep Locked

- ...

## Recommended V7 Milestone List

1. ...
2. ...
3. ...

## What Not To Touch

- ...

## Evidence / File References

- ...

## Open Questions

- ...
```

## Result Definitions

- **PASS** — No critical gate/security issue found; V7 cleanup candidates are absent or minimal.
- **PASS WITH NOTES** — No critical gate/security issue found; V7 cleanup candidates exist and should be planned.
- **FAIL** — A critical gate/security issue exists and may require reopening V6.

## What Not To Touch During V7 Cleanup Planning

Unless a critical gate/security issue is found, do not recommend changes that would destabilize or reopen:

- V6 controlled PDF generation gates
- V6 controlled review PDF download gates
- V6 controlled email delivery gates
- Final human review requirement
- Send PIN requirement
- Generated package requirement before email send
- Text-only evidence photo handling in PDFs/emails
- Simple Mode baseline behavior
- V6 closeout documentation

## Audit Notes

- Treat V6 as locked and closed.
- Treat V7 as cleanup/planning work after the V6 baseline.
- Prefer precise file references and concrete cleanup recommendations.
- Separate runtime/user-facing issues from historical docs or intentionally preserved records.
- If no issue is critical enough to reopen V6, explicitly state that V6 should remain closed.
