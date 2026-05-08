# Applied Intelligence | Standardize to Optimize
# V3-M1 — Router-Aware Exception Routing Architecture

Project: Refab Connect V3  
Milestone: V3-M1  
Status: Locked Architecture Direction  
Scope: Documentation / Planning Only  
Runtime Changes: None

---

# 1. Purpose

This document defines the foundational routing architecture direction for Refab Connect V3.

V3 expands beyond simple work-order correction and moves toward a structured shop-floor exception routing and visibility system.

The system must:

- Route problems to the correct owner.
- Reduce wasted walking and communication loops.
- Preserve supporting evidence.
- Make recurring issues visible.
- Support continuous improvement participation across departments.

---

# 2. Core Principle

The routing rule for V3 is:

> Route by failure point and owner.

The system should identify:

1. What failed.
2. Where the failure occurred.
3. Who owns the next action.

The default answer is not always Engineering.

---

# 3. Ownership-Based Routing Direction

## Engineering

Engineering ownership applies when:

- Router operation is missing.
- BOM is wrong.
- Print callout is wrong.
- Quantity/specification is wrong.
- Required process step is missing.
- Fixture requirement is missing.
- Weld callout or hardware callout is incorrect.

Examples:

- Missing weld operation.
- Wrong PEM callout.
- Wrong plating specification.
- Router missing laser operation.

---

## Purchasing / Material Control

Purchasing or Material Control ownership applies when:

- Raw material is missing.
- Purchased components are short.
- Wrong material grade/gauge arrives.
- Lead-time constraints block production.
- Outside process coordination is required.

Examples:

- Missing torsion springs.
- Wrong steel grade.
- Delayed plating vendor.
- Powder material unavailable.

---

## Laser / Production

Laser or Production ownership applies when:

- Components were not cut.
- Nesting was missed.
- Parts were lost or miscounted.
- Production failed to complete the expected output.

Examples:

- Missing laser-cut component.
- Wrong quantity cut.
- Component lost after cutting.
- Incorrect material processed at laser.

---

## Quality / QC

Quality ownership applies when:

- Inspection failures occur.
- Prior operations are unsigned.
- Process control breakdowns are discovered.
- Escaped defects are found.

Examples:

- First-piece not signed off.
- Last-piece not signed off.
- QC audit escape.
- Failed plating inspection.

---

## Supervisor / Department Owner

Supervisor visibility should exist whenever:

- Flow risk increases.
- Escalation is needed.
- Repeated issues appear.
- Production impact exists.
- Ownership stalls.

---

# 4. Evidence Preservation Direction

V3 should support preserving:

- Router screenshots.
- Print/BOM photos.
- Missing component photos.
- Work-order evidence.
- Failed hardware/install photos.
- QC signoff evidence.

Evidence supports routing when customer documentation structures vary.

---

# 5. Shop-Floor Workflow Direction

The intended shop-floor workflow is:

Capture → Confirm → Route → Review → Visibility

Operator mindset:

> "I’ll drop a Connect."

The workflow should reduce:

- Walking.
- Interruptions.
- Chasing people.
- Verbal-only communication.
- Lost information.
- Waiting for ownership.

---

# 6. Future Analytics Direction

Future analytics may include:

- Ranked issue categories.
- Repeat problem tracking.
- Department concentration percentages.
- Current top problems.
- Bar-graph visual signals.
- Repeat parts/processes.
- Trend visibility.

Analytics are future backlog direction only.

No analytics implementation belongs in V3-M1.

---

# 7. Runtime Guardrail

V3-M1 does not allow:

- Runtime UI implementation.
- New routes.
- Backend/database work.
- Authentication changes.
- Dashboard implementation.
- Router parsing implementation.
- OCR logic changes.
- Production feature rollout.

This milestone locks architecture direction only.

---

# 8. Expected Next Phase

The next phase after architecture stabilization is expected to focus on:

- Documentation structure.
- Source-of-truth preservation.
- Controlled milestone sequencing.
- Future routing-model preparation.

No runtime implementation should begin until Planning explicitly approves it.
