# Claude V7 Whole-App Audit Package

## Purpose

This package is a text-only handoff for a Claude whole-app audit supporting V7 planning.

V7 starts after V6 closeout. V6 is locked as the controlled PDF/email baseline for AI-CAS corrective action packages. This audit is for V7 cleanup candidates only.

## Files

- `CLAUDE_V7_AUDIT_HANDOFF.md` — Claude-facing audit instructions, scope, hard rules, focus areas, and expected return format.

## Audit Boundary

Claude should evaluate cleanup opportunities for V7 without recommending changes to the locked V6 baseline unless a critical gate or security issue is found.

## Required Claude Return

Claude should return:

- `PASS`, `PASS WITH NOTES`, or `FAIL`
- Cleanup candidates grouped by severity
- Recommended V7 milestone list
- What not to touch

## Do Not Modify

This package is documentation-only. It must not change runtime code, app logic, features, or V6 closeout docs.
