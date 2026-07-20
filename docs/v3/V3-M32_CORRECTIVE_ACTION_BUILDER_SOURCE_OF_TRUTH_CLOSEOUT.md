# Refab Connect V3 — Corrective Action Builder Foundation Source of Truth

Milestone Range: V3-M19 through V3-M31

Status: Corrective Action Builder foundation locked/passed

Reference Model: synthetic work-order / synthetic-part corrective action sheet

## Purpose

This document preserves the completed Corrective Action Builder foundation for Refab Connect V3.

The foundation is based on synthetic corrective-action fixture data and is intended to support controlled shop-floor corrective action documentation before future PDF export, AI Vision extraction, backend storage, or automation is activated.

## Completed Capabilities

The Corrective Action Builder foundation now includes:

- Corrective Action Builder shell
- WO / PN / routing fields
- Photo evidence slots
- Requirements / containment / pass-fail sections
- Operator checklist / release approval
- PDF export planning section
- Draft preview
- Router capture planning
- Mock extraction preview
- Human verification gate
- AI Vision backend boundary planning
- Runtime QA on iPad/Safari

## Locked Functional Direction

Corrective Action Builder is the active V3 build path for controlled corrective action documentation.

The builder supports the current frontend foundation for capturing, reviewing, and preparing corrective action data, including:

- Work order and part context
- Routing and operation context
- Key feature and inspection method
- Cleaning, hole-check, and stacking requirements
- Photo evidence categories
- Checklist verification
- Release approval fields
- Draft preview review
- Future PDF structure planning
- Future router capture and AI extraction planning

## Locked Rule

AI can populate fields in the future, but human confirmation is required before release.

No extracted router/work-order data should feed release-ready preview or future PDF output unless the user has reviewed and confirmed it.

## Explicit Exclusions

The V3 Corrective Action Builder foundation does not include:

- No real PDF export yet
- No real AI Vision yet
- No backend/API/OpenAI automation yet
- No real file parsing yet
- No GitHub automation
- No runtime agent execution
- No Agent Console
- No V2 changes

## Agent Console Status

Agent Console was removed from the active V3 workflow before the Corrective Action Builder foundation was continued.

Agent Console is not part of the current active V3 build path.

## AI Vision Status

AI Vision is planning-only.

The current build includes only frontend planning/preview sections for:

- Router/work-order capture
- Mock extracted router data
- Human verification gate
- Backend boundary rules
- Future structured extraction output

No real AI Vision calls, OpenAI API calls, backend routes, or file parsing are active.

## PDF Export Status

PDF export is not active yet.

The current build includes only:

- PDF export planning layout
- Future PDF section structure
- Disabled PDF export controls
- Draft preview for human review

No PDF generation, download, server rendering, or export pipeline is active.

## Runtime QA Note

V3-M31 completed runtime QA on iPad/Safari for the Corrective Action Builder foundation.

The foundation is considered ready for Planning to either continue toward controlled PDF export planning or close V3 depending on the next approved direction.

## Next Recommended Future Milestone

Planning should choose one of the following paths:

1. V3-M33 — Corrective Action PDF Export Implementation Planning
2. V3 closeout

Decision belongs to Chat 1 Planning.

## Closeout Statement

V3-M32 locks the Corrective Action Builder foundation source of truth only.

Runtime implementation beyond the current foundation must wait for the next approved Planning handoff.
