# Applied Intelligence | Standardize to Optimize
# V3-M1 — Router-Aware Exception Routing Architecture

Project: Refab Connect V3  
Milestone: V3-M1  
Status: Architecture Direction Locked  
Scope: Documentation / Planning Only  
Runtime Changes: None

---

# 1. V3 Purpose

Refab Connect V3 expands from a work-order correction application into a shop-floor exception routing and visibility system.

V3 exists to:

- Route problems to the right owner.
- Reduce wasted motion.
- Preserve evidence.
- Make recurring issues visible.
- Improve continuous improvement participation across departments.
- Reduce dependency on verbal reminders and physical interruption loops.

V3 builds from the stable V2 foundation without reopening V2.

Refab Connect V2 remains closed cleanly at V2-M15.

---

# 2. V3 Goals

The V3 architecture direction supports:

- Router / BOM / component awareness.
- Owner-based routing by failure point.
- Purchasing / material shortage routing.
- Laser-cut component exception routing.
- PEM / weld nut / weld stud / hardware routing.
- QC unsigned operation / first-piece / last-piece reporting.
- Photo evidence support.
- "I’ll drop a Connect" shop-floor culture.
- Ranked issue analytics direction.
- Continuous improvement participation across departments.

---

# 3. V3 Non-Goals At Start

At the start of V3:

Do not:

- Code immediately.
- Reopen V2.
- Build dashboards before the routing model is defined.
- Add database/auth/backend before the workflow model is locked.
- Overcomplicate floor input flow.
- Implement production runtime features before Planning approval.

The first phase of V3 is architecture stabilization and routing-model definition.

---

# 4. Router Stack Model

The V3 routing architecture should understand a layered router/document stack.

## Stack Layers

- Work order header.
- Router M lines.
- Router L operation lines.
- Print BOM components.
- Purchased material.
- Purchased components.
- Laser-cut component outputs.
- Hardware / PEM / weld nut / weld stud items.
- Outside processing.
- Inspection/signoff status.
- Evidence photos.

The system should use these layers to determine:

1. What failed.
2. Where the failure occurred.
3. Who owns the next action.

---

# 5. M Line vs L Line Logic

## M Line Logic

M line = purchased material / component / hardware ownership.

Examples:

- Raw steel.
- Stainless sheet.
- Weld nuts.
- PEM hardware.
- Springs.
- Purchased components.

M-line failures typically route toward:

- Purchasing.
- Material Control.
- Vendor coordination.

---

## L Line Logic

L line = labor / operation / department ownership.

Examples:

- Laser cut.
- Forming.
- Welding.
- PEM insertion.
- Powder coat.
- Inspection.

L-line failures typically route toward:

- Department owner.
- Production.
- Supervisor.
- Quality.

---

## Print BOM Logic

Print BOM = component/output expectation.

The BOM may define components that are outputs of operations rather than individually purchased items.

Example:

A single M-line raw sheet material may feed one laser operation that creates multiple cut components shown only on the print BOM.

Missing cut components may therefore route to Laser/Production even if the raw material M-line exists and is correct.

---

# 6. Failure-Point Routing Rules

## Purchasing / Material Control

Route to Purchasing / Material Control when:

- Raw material is missing.
- Purchased components are short.
- Wrong material arrives.
- Lead-time constraints exist.
- Purchased hardware/components are unavailable.

Examples:

- Missing raw material.
- Missing purchased component.
- Wrong steel gauge.
- Missing weld studs.

---

## Laser / Production

Route to Laser / Production when:

- Components were not cut.
- Nesting was missed.
- Laser output quantity is short.
- Components were lost/miscounted.

Examples:

- Missing laser-cut component.
- Wrong quantity cut.
- Lost laser-cut output.

---

## Engineering

Route to Engineering when:

- Router is wrong.
- BOM is wrong.
- Print/specification is wrong.
- Required operation is missing.
- Callouts are missing or incorrect.

Examples:

- Wrong router/BOM/print/spec.
- Missing weld operation.
- Wrong PEM callout.
- Missing hardware quantity.

---

## Department Owner / Supervisor

Route to department owner or Supervisor when:

- Required operations were skipped.
- Signoffs were missed.
- Process flow broke down.
- Escalation or production visibility is required.

Examples:

- Missed operation.
- Production bypass.
- Repeat process-control issue.

---

## Quality / QC

Route to Quality plus owner when:

- Defects/rejections occur.
- Failed inspections occur.
- Escaped issues are found.
- Unsigned process controls are discovered.

Examples:

- Defect/rejection.
- QC audit escape.
- Failed inspection.
- Unsigned first-piece.
- Unsigned last-piece.

---

## Outside Processing

Route to Purchasing / Vendor Coordination when:

- Plating/outside process issues occur.
- Outside vendors block flow.

Examples:

- Plating issue.
- Outside process delay.
- Vendor processing error.

---

## Powder Coat / Paint

Internal PT10 powder coat or paint issues should route toward:

- Powder Coat / Paint.
- Quality if rejection/finish issue exists.

---

# 7. Owner Routing Map

Initial V3 owner routing map:

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

# 8. Photo Evidence Rules

V3 should support multiple evidence types because routers, BOMs, and customer documents vary.

Supported evidence types:

- Router/header photo.
- Print/BOM photo.
- Missing component photo.
- Physical issue photo.
- Failed/defective part photo.
- Unsigned operation/signoff photo.
- Material/component label photo.

Evidence should support review, routing, ownership clarification, and future analytics.

---

# 9. “Drop a Connect” Workflow

The V3 workflow direction is:

1. Capture issue.
2. Select/request type.
3. Identify work order/part/context.
4. Attach evidence.
5. Route to owner.
6. Show next action.
7. Track status.
8. Feed analytics.

The purpose is to reduce:

- Walking.
- Waiting.
- Communication delays.
- Lost context.
- Interruptions.
- Verbal reminder dependency.

The intended shop-floor phrase is:

> "I’ll drop a Connect."

---

# 10. Analytics Direction

Future analytics should use simple ranked bar graphs and directional concentration visuals.

Dashboard goal:

> Make the dominant problem obvious fast.

Example:

> 70% of current issues point toward Purchasing / Material Shortages.

Future dashboard views may include:

- Top current signal.
- Issues by department.
- Issues by owner.
- Issues by type.
- Repeat parts.
- Repeat work orders.
- Open items by owner.
- Aging unresolved items.
- Production impact / urgency.

Analytics remain future planning direction only.

No analytics implementation belongs in V3-M1.

---

# 11. Suggested V3 Milestone Path

Suggested milestone sequence:

- V3-M1 — Router-Aware Exception Routing Architecture.
- V3-M2 — Request Type / Routing Destination Model.
- V3-M3 — Evidence Capture / Photo Support Planning.
- V3-M4 — Purchasing / Material Shortage Routing Planning.
- V3-M5 — Laser / BOM Component Routing Planning.
- V3-M6 — QC Unsigned Operation / Process Control Planning.
- V3-M7 — Router Line Selection UI Planning.
- V3-M8 — Runtime Implementation Ticket Breakdown.
- V3-M9 — First Controlled Routing UI Implementation.
- V3-M10 — Ranked Issue Analytics Dashboard Planning.

---

# 12. V3 Documentation Gate Rule

Every V3 milestone must produce:

1. Chat 2 implementation/result card.
2. Chat 3 test/result card.
3. Chat 1 planning lock.
4. Chat 4 running documentation tracker update.

A milestone is not fully closed until Chat 4 has updated the running tracker.

---

# 13. Final Lock Statement

V3-M1 locks the routing architecture direction only.

Runtime implementation must wait until the routing model is reviewed and accepted.

Do not implement:

- Runtime UI.
- Dashboard.
- Backend/database.
- Auth.
- New app routes.
- Production features.
