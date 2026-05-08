# Applied Intelligence | Standardize to Optimize
# Refab Connect V3 — Startup Packet

Project: Refab Connect V3  
Repo: kool1160/refab-connect-core-reskin  
Status: Started  
Baseline: Refab Connect V2 closed cleanly at V2-M15  
Runtime Scope: Not started  
Primary Rule: Route by failure point and owner  
Shop-Floor Culture Line: "I’ll drop a Connect."

---

## 1. Purpose

Refab Connect V3 expands the prior work-order correction layer into a shop-floor exception routing and visibility system.

The purpose of V3 is to help shop-floor users quickly capture exceptions, route problems to the right owner, preserve supporting evidence, reduce wasted walking and communication loops, and make recurring problems visible for continuous improvement.

V3 is not a restart of V2. V2 remains closed. V3 begins from the stable V2 foundation and adds structured routing architecture before any runtime implementation begins.

---

## 2. V2 Baseline

Refab Connect V2 is closed cleanly at V2-M15.

V2 established the iPad-first operating layer, stable navigation, layout polish, risk-based testing direction, documentation recovery, and closeout package.

V3 must not reopen V2, modify V2 closure docs, or change V2 scope unless explicitly instructed by Planning.

---

## 3. V3 Core Purpose

Refab Connect V3 exists to:

- Route problems to the correct owner.
- Reduce wasted motion and communication delays.
- Preserve photo/document evidence.
- Support shop-floor exception capture.
- Create clearer visibility into recurring issues.
- Help the next run go smoother.

The operating mindset is simple:

> Capture the exception. Route it by failure point. Preserve the evidence. Make the pattern visible.

---

## 4. Core Routing Principle

The core V3 routing principle is:

> Route by failure point and owner.

A problem should not automatically go to Engineering just because it is documented. The system must identify where the failure occurred and who owns the next action.

Examples:

- Raw material missing, short, wrong grade, or lead-time constrained → Purchasing / Material Control.
- Missing laser-cut component caused by not being cut, nested, counted, or found → Laser / Production / Supervisor.
- Router, BOM, print, callout, quantity, or operation is wrong or missing → Engineering.
- Failed inspection, finish defect, rejection, or escaped issue → Quality plus owning department.
- Outside operation issue such as plating/vendor processing → Purchasing / Vendor Coordination, with Quality if finish or rejection related.
- Unsigned first-piece, last-piece, or prior operation → Quality / Supervisor / owning department.

---

## 5. Shop-Floor Culture Line

The phrase for V3 behavior is:

> "I’ll drop a Connect."

This means a shop-floor employee can quickly capture the issue, attach context/evidence, route it to the correct owner, and make the next action visible without chasing people, walking around the building, or relying on memory/verbal reminders.

---

## 6. V3 Work Areas

V3 may expand into these areas only through approved Planning handoffs:

- Router/BOM/component awareness.
- Owner-based exception routing.
- Material and purchased component shortages.
- Laser-cut component routing.
- PEM/self-clinching hardware issues.
- Weld nut, weld stud, and hardware routing.
- QC unsigned operation and process-control reporting.
- Photo evidence and document evidence support.
- Future ranked issue analytics and bar-graph dashboards.

These are direction areas, not automatic implementation permission.

---

## 7. Runtime Guardrail

Do not start runtime implementation until V3 routing architecture is locked by Planning.

Do not add:

- New UI routes.
- Dashboard features.
- Backend/database work.
- Authentication changes.
- Analytics/bar graphs.
- Production routing features.
- Router parsing implementation.

Runtime changes require a specific approved Planning handoff.

---

## 8. Chat Role Separation

V3 uses separate chat roles to reduce drift:

- Planning / Source of Truth decides scope, order, acceptance checks, and handoffs.
- Implementation / Task Runner executes one approved handoff at a time.
- Testing / Bug Report observes app behavior and reports pass/fail evidence.
- Documentation / Binder creates milestone records and polished documentation packages.

Implementation does not decide scope. Testing does not implement. Documentation does not change runtime.

---

## 9. Current First Milestone

Current milestone:

V3-M1 — Router-Aware Exception Routing Architecture

Expected documentation files:

- docs/v3/REFAB_CONNECT_V3_STARTUP_PACKET.md
- docs/v3/V3-M1_ROUTER_AWARE_EXCEPTION_ROUTING_ARCHITECTURE.md

Scope:

Documentation and architecture only.
