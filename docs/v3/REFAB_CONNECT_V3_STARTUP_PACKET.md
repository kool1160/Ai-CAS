# Applied Intelligence | Standardize to Optimize
# Refab Connect V3 — Startup Packet

Project: Refab Connect V3  
Repo: kool1160/refab-connect-core-reskin  
Source File: docs/v3/REFAB_CONNECT_V3_STARTUP_PACKET.md  
Baseline: Refab Connect V2 closed cleanly at V2-M15  
V3 Status: Started  
Runtime Implementation: Not started  
Core Principle: Route by failure point and owner  
Shop-Floor Culture Line: "I’ll drop a Connect."

---

## 1. V3 Core Direction

Refab Connect V3 expands from a work-order correction app into a shop-floor exception routing and visibility system.

V3 is built to help shop-floor users capture issues quickly, attach context and evidence, route the issue to the correct owner, show the next action, and make recurring problems visible.

V3 builds from the stable V2 foundation without reopening V2. V2 is closed cleanly at V2-M15 and must remain closed unless explicitly reopened by Planning.

---

## 2. Core Purpose

Refab Connect V3 exists to:

- Route problems to the right owner.
- Reduce wasted motion.
- Preserve evidence.
- Make recurring shop-floor issues visible.
- Support continuous improvement participation across departments.
- Make the next production run smoother.

The operating idea is simple:

> Capture the exception. Route it by failure point. Preserve the evidence. Make the pattern visible.

---

## 3. Core Principle

The V3 routing rule is:

> Route by failure point and owner.

A problem should route to the person, department, or function that owns the next action based on the actual failure point.

The default owner is not always Engineering.

---

## 4. Shop-Floor Culture Line

The V3 culture line is:

> "I’ll drop a Connect."

Meaning:

Anyone on the floor can capture an issue, attach context/evidence, route it to the right owner, and make the next action visible without walking around, chasing people, interrupting departments, or relying on memory and verbal reminders.

---

## 5. V3 Direction Areas

V3 direction includes:

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

These are direction areas only. They do not authorize runtime implementation until Planning issues a specific milestone handoff.

---

## 6. V3 Non-Goals At Start

V3 must not begin by overbuilding.

At the start of V3, do not:

- Code immediately.
- Reopen V2.
- Modify V2 closure docs.
- Build a dashboard before the routing model is defined.
- Add database/auth/backend before the workflow model is locked.
- Overcomplicate the floor input flow.
- Add new runtime routes without an approved Planning handoff.
- Implement production features before architecture and routing rules are accepted.

---

## 7. Router Stack Model

V3 routing should understand a router/document stack as separate but related layers:

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

This stack helps determine both what failed and who owns the next action.

---

## 8. M Line vs L Line Logic

Routing distinction:

- M line = purchased material / component / hardware ownership.
- L line = labor / operation / department ownership.
- Print BOM = component/output expectation.

Example:

A single M line may represent raw sheet material. A related L laser operation may produce several laser-cut components from that material. The individual components may be shown on the print BOM rather than as separate M material lines.

Missing raw material is usually a Purchasing / Material Control issue.

Missing cut output may be a Laser / Production issue when the raw material exists but the component was not cut, nested, counted, or found.

---

## 9. Failure-Point Routing Rules

Initial V3 routing rules:

- Missing raw material → Purchasing / Material Control.
- Missing purchased component → Purchasing / Material Control.
- Missing laser-cut component → Laser / Production based on cause.
- Wrong router/BOM/print/spec → Engineering.
- Missed operation → department owner / Supervisor.
- Defect/rejection → Quality plus owner.
- Plating/outside process → Purchasing / Vendor Coordination.
- Powder coat PT10 → internal Powder Coat / Paint.
- Unsigned first/last piece → Quality / Supervisor / owning department.

---

## 10. Owner Routing Map

Supported owner lanes for V3 planning:

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

## 11. Photo Evidence Rules

V3 should support photo evidence because customer documentation, routers, BOMs, and shop-floor issue types are inconsistent.

Evidence types:

- Router/header photo.
- Print/BOM photo.
- Missing component photo.
- Physical issue photo.
- Failed/defective part photo.
- Unsigned operation/signoff photo.
- Material/component label photo.

Evidence should support routing and review. Evidence does not need to be perfectly structured to be useful.

---

## 12. Drop a Connect Workflow

Basic V3 workflow:

1. Capture issue.
2. Select/request type.
3. Identify work order/part/context.
4. Attach evidence.
5. Route to owner.
6. Show next action.
7. Track status.
8. Feed analytics.

The goal is to reduce walking, waiting, interruptions, lost context, and verbal reminder loops.

---

## 13. Analytics Direction

V3 analytics direction should use simple ranked bar graphs to show where issues point.

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

Analytics are future direction only at V3 start. Do not implement dashboards until Planning approves dashboard scope.

---

## 14. Suggested V3 Milestone Path

Suggested path:

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

Planning may adjust milestone order, but implementation must follow approved Planning handoffs only.

---

## 15. V3 Documentation Gate Rule

Every V3 milestone must produce:

1. Chat 2 implementation/result card.
2. Chat 3 test/result card.
3. Chat 1 planning lock.
4. Chat 4 running documentation tracker update.

A milestone is not fully closed until Chat 4 has updated the running tracker.

---

## 16. Runtime Guardrail

Do not implement:

- Runtime UI.
- Dashboard.
- Backend/database.
- Auth.
- New app routes.
- Production features.

Runtime implementation must wait until the routing model is reviewed and accepted.

---

## 17. Final Lock Statement

V3-M1 locks the routing architecture direction only.

Runtime implementation must wait until the routing model is reviewed and accepted by Planning.
