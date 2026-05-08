# Applied Intelligence | Standardize to Optimize
# V3-M2 — Request Type / Routing Destination Model

Project: Refab Connect V3  
Milestone: V3-M2  
Status: Planning Document  
Scope: Documentation Only  
Runtime Changes: None  
Source Files:  
- docs/v3/REFAB_CONNECT_V3_STARTUP_PACKET.md  
- docs/v3/V3-M1_ROUTER_AWARE_EXCEPTION_ROUTING_ARCHITECTURE.md

---

# 1. Purpose

The V3 request type model defines the first controlled list of shop-floor exception categories and maps each request type to the correct routing destination.

Request types are needed before runtime implementation because the app must know what kind of issue is being reported before it can route the issue clearly.

Without request types, shop-floor issues become vague, unowned, and easy to lose in verbal follow-up loops.

The goal of V3-M2 is to create a simple routing model that helps a floor user drop a Connect, attach evidence, and move the issue toward the owner responsible for the next action.

Core principle:

> Route by failure point and owner.

Culture line:

> "I’ll drop a Connect."

---

# 2. Request Type Categories

Initial V3 request type categories:

- Material Shortage.
- Purchased Component Shortage.
- Missing Laser-Cut Component.
- Wrong Material / Wrong Gauge.
- Missing or Wrong Router Operation.
- Missing or Wrong BOM / Print Callout.
- PEM / Hardware Issue.
- Weld Nut / Weld Stud Issue.
- Powder Coat / Paint Issue.
- Plating / Outside Processing Issue.
- Defect / Rejection.
- First Piece Not Signed Off.
- Last Piece Not Signed Off.
- Operation Not Signed Off.
- Process Control Breakdown.
- General Supervisor Review.

---

# 3. Owner Map

Supported routing owners:

- Engineering.
- Purchasing / Material Control.
- Laser / Cutting.
- Welding.
- Forming.
- Machining.
- PEMing / Hardware Insertion.
- Powder Coat / Paint.
- Plating / Outside Processing.
- Quality / QC.
- Supervisor / Production.
- Leadership / Management.

---

# 4. Request Type Table

| Request Type | Failure Point | Primary Owner | Secondary Visibility | Required Evidence | Typical Next Action |
|---|---|---|---|---|---|
| Material Shortage | Raw material missing, unavailable, short, or not released | Purchasing / Material Control | Supervisor / Production | Router/header photo, M-line/material line photo, material label if available, physical shortage photo | Confirm material status, locate material, order/release material, update production plan |
| Purchased Component Shortage | Purchased component or hardware is missing/short | Purchasing / Material Control | Supervisor / Production, Engineering if BOM quantity is wrong | Router/header photo, M-line/component line photo, print/BOM photo, missing component photo | Confirm order quantity, expedite/order component, verify BOM/router quantity |
| Missing Laser-Cut Component | Expected cut component is missing, short, lost, or not nested/cut | Laser / Cutting | Supervisor / Production, Engineering if print/BOM/router is wrong | Router/header photo, laser operation line, print/BOM component photo, missing component photo | Confirm whether component was cut, nested, counted, or lost; recut or correct routing source |
| Wrong Material / Wrong Gauge | Wrong grade, gauge, finish, or material type used or supplied | Purchasing / Material Control | Quality / QC, Supervisor / Production, Engineering if spec/source is wrong | Material label photo, router M-line, print/spec photo, physical issue photo | Quarantine/verify material, determine replacement, correct source data if needed |
| Missing or Wrong Router Operation | Router operation missing, wrong, out of sequence, or unclear | Engineering | Supervisor / Production, affected department | Router/header photo, router L-line photo, print/process evidence | Correct router operation, add missing step, clarify sequence or department ownership |
| Missing or Wrong BOM / Print Callout | BOM, drawing, hardware callout, quantity, or specification is missing/wrong | Engineering | Purchasing / Material Control if purchasing impact exists, Quality if inspection impact exists | Print/BOM photo, router/header photo, component/hardware evidence | Correct print/BOM/spec, clarify required component or process |
| PEM / Hardware Issue | PEM/self-clinching hardware missing, wrong, failed, loose, spinning, or inserted incorrectly | PEMing / Hardware Insertion | Quality / QC, Supervisor / Production, Engineering if callout/spec is wrong | Hardware line/photo, print callout photo, failed insert photo, location photo | Inspect issue, replace/correct hardware, repair part, update callout if needed |
| Weld Nut / Weld Stud Issue | Weld nut/stud missing, wrong, failed, or incorrectly applied | Welding | Quality / QC, Supervisor / Production, Engineering if callout/spec is wrong | Hardware callout photo, router/header photo, failed weld/stud photo, location photo | Verify hardware type/quantity, correct weld/stud process, repair or rework part |
| Powder Coat / Paint Issue | PT10 powder coat/paint operation missed, wrong color, wrong finish, damage, or rejection | Powder Coat / Paint | Quality / QC, Supervisor / Production, Purchasing / Material Control if powder/material unavailable | PT10 operation photo, finish/spec photo, defect photo, part photo | Verify finish requirement, rework/recoat, correct material/color issue |
| Plating / Outside Processing Issue | Outside operation delayed, wrong, damaged, rejected, or unclear | Plating / Outside Processing | Purchasing / Vendor Coordination, Quality / QC, Supervisor / Production | Outside processing line/photo, finish/spec photo, defect/rejection photo | Contact vendor/process owner, verify status, correct or expedite outside operation |
| Defect / Rejection | Part failed inspection, has defect, or escaped process control | Quality / QC | Producing/owning department, Supervisor / Production | Failed/defective part photo, inspection evidence, router/header photo | Contain issue, identify owner, determine rework/reject/corrective action |
| First Piece Not Signed Off | First-piece check missing or unsigned | Quality / QC | Supervisor / Production, owning department | Signoff/status photo, router operation photo, part/work order photo | Hold/review work, verify first-piece requirement, complete signoff or escalate |
| Last Piece Not Signed Off | Last-piece check missing or unsigned | Quality / QC | Supervisor / Production, owning department | Signoff/status photo, router operation photo, part/work order photo | Verify completion, complete signoff, review process control breakdown |
| Operation Not Signed Off | Required prior/current operation not signed off | Quality / QC | Supervisor / Production, owning department | Router operation/signoff photo, work order header photo | Confirm operation completion, update signoff or route back to owner |
| Process Control Breakdown | Repeated bypass, missed checks, unsigned controls, or unstable workflow | Supervisor / Production | Quality / QC, owning department, Leadership / Management if severe/repeating | Router/signoff evidence, photos, repeated issue context | Review process, assign owner, stabilize control point, escalate if recurring |
| General Supervisor Review | Issue does not fit a defined type or needs production decision | Supervisor / Production | Affected owner, Quality / QC if defect-related | Work order/header photo, physical issue photo, notes explaining blocker | Triage issue, assign owner, determine next action |

---

# 5. Routing Destination Rules

For each request type, the system should define:

- Primary owner.
- Secondary visibility.
- When Engineering is involved.
- When Quality is involved.
- Required evidence.
- Typical next action.

## Engineering Involvement

Engineering is involved when:

- Router operation is missing or wrong.
- BOM is missing, wrong, or unclear.
- Print/spec/callout is wrong.
- Quantity requirements are wrong.
- A department cannot act because source data is incorrect.

## Quality Involvement

Quality is involved when:

- A defect/rejection occurs.
- Inspection fails.
- First-piece or last-piece signoff is missing.
- A prior operation is unsigned.
- Process control has broken down.
- Finish, plating, hardware, or weld quality is rejected.

## Supervisor / Production Involvement

Supervisor / Production visibility is needed when:

- Flow is blocked.
- A missed operation affects schedule.
- Ownership is unclear.
- The issue repeats.
- Production impact or urgency is high.

## Leadership / Management Involvement

Leadership / Management visibility should be reserved for:

- Severe production impact.
- Repeat systemic issues.
- High-cost failures.
- Cross-department escalation.
- Aging unresolved blockers.

---

# 6. Routing Logic Rules

- M line issues route to Purchasing / Material Control unless the spec/source data is wrong.
- L line issues route to the owning department / Supervisor unless the operation itself is missing/wrong.
- Print BOM mismatches route to Engineering.
- Defects route to Quality plus the producing/owning department.
- Outside processing routes to Purchasing / Vendor Coordination.
- PT10 powder coat routes internally to Powder Coat / Paint.
- Unsigned first/last piece routes to Quality / Supervisor / owning department.
- Repeated or high-impact issues receive Supervisor visibility.
- Severe production impact may receive Leadership / Management visibility.

---

# 7. Operator Input Guardrails

The floor input should stay simple.

Operators should not be forced into too many technical fields too early.

Simple input prompts:

- What happened?
- What work order / part?
- What router line / BOM item if known?
- What evidence is attached?
- Who should see it if known?

The system should support structured routing without making the operator feel like they are filling out an engineering report.

---

# 8. Status Flow

Default V3 status flow:

New → Routed → In Review → Waiting → Corrected → Verified → Closed

Additional allowed statuses:

- Escalated.
- Rejected / Not an Issue.

Status should make ownership and next action visible without creating unnecessary complexity.

---

# 9. Analytics Tags

Future analytics should preserve simple tags:

- Owner.
- Department.
- Request type.
- Failure point.
- Part number.
- Work order.
- Urgency.
- Production impact.
- Repeat issue.
- Aging/open time.

These tags support future ranked issue analytics, owner views, department views, and bar-graph signals.

---

# 10. Non-Goals

V3-M2 does not include:

- Runtime implementation.
- Dashboard build.
- Backend/auth/database work.
- Automatic AI routing.
- Complex permission model.
- New app routes.
- Production feature implementation.

This milestone defines the request type and routing destination model only.

---

# 11. Acceptance Criteria

This document passes if:

- Request types are clearly defined.
- Each request type has a primary owner.
- Evidence needs are defined.
- Routing logic follows V3-M1.
- Operator flow remains simple.
- Future analytics tags are preserved.
- No runtime work is added.

---

# 12. Final Statement

V3-M2 creates the first controlled request type and routing destination model for Refab Connect V3.

It preserves the V3-M1 architecture rule:

> Route by failure point and owner.

Runtime implementation remains blocked until Planning approves a future implementation milestone.
