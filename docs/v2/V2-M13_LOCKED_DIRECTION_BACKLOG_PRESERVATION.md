# V2-M13 — V2 Locked Direction / Backlog Preservation Document

## 1. Title

**V2-M13 — V2 Locked Direction / Backlog Preservation Document**

---

## 2. Purpose

V2-M13 documents the locked Refab Connect V2 direction and preserves future backlog ideas for later controlled planning or V3 without interrupting the current V2 closeout path.

This milestone exists to keep the larger shop-floor routing, evidence, analytics, and continuous improvement ideas from being lost while clearly separating them from current V2 runtime execution.

V2-M13 is documentation/source-of-truth only. It does not add runtime features, routes, dashboard behavior, feedback behavior, analytics, purchasing routing, backend behavior, authentication, database behavior, or cloud sync.

---

## 3. Current V2 Status

Current V2 status:

- **V2-M1 through V2-M12 are locked / passed**.
- The V2 tablet operating layer is stabilized for this V2 stage.
- V2 scope is closed.
- Remaining V2 work is closeout / QA / documentation only.

Recently locked runtime stabilization milestone:

- **V2-M12 — Tablet Visual QA / iPad Operating Layer Stabilization**
- Commit reviewed: `6c0b1192acd2859ec7e6969f50febb9f27980883`
- Deployment passed.
- iPad / Safari verification passed.
- Home, Capture, Review / Send, Drafts, History, More / Setup / Admin, and bottom navigation were verified stable.
- Regression not found.

---

## 4. Locked V2 Direction

Refab Connect V2 is locked around a practical shop-floor operating direction.

Locked V2 direction:

- iPad-first shop-floor operating layer.
- Phone remains supported as a fast guided workflow.
- Risk-based testing.
- Route by failure point and owner.
- Router / BOM / component awareness.
- Photo evidence support because customer prints vary.
- “Drop a Connect” shop-floor culture.
- Reduce wasted motion, walking, interruptions, communication delay, lost context, and tribal reminder loops.
- Continuous improvement participation across departments.
- Future ranked issue analytics/dashboard direction preserved as backlog.

V2 should continue closing around the stabilized iPad-first correction workflow foundation rather than reopening broad scope.

---

## 5. Current Runtime Accomplishments

Current V2 runtime accomplishments through V2-M12:

- Responsive tablet shell foundation.
- iPad split-view foundation.
- Review / Send side-by-side behavior.
- Drafts / History side-by-side behavior.
- More / Setup / Admin tablet stabilization.
- Tablet polish and visual QA.
- Bottom navigation stabilized.
- Phone behavior preserved.

These accomplishments expand Refab Connect from a phone-first correction reporting workflow toward a stronger iPad operating layer without breaking the existing V1 pilot-ready correction foundation.

---

## 6. Backlog / Future Candidate Concepts

The following concepts are preserved as backlog only.

They are **not active V2-M13 implementation items** and should not be built unless later approved in a controlled planning milestone or moved into V3.

### V2-CAND-001 — Router Operation Stack / Exception Routing Model

**Purpose:**
Support operation-level issue capture from full router data, not just work order header.

Future value:

- Capture the exact router operation tied to the issue.
- Separate material, labor, outside process, QC, and Engineering-related failures.
- Help route correction requests to the owner responsible for the failure point.

### V2-CAND-002 — Purchasing / Missing Component Request Routing

**Purpose:**
Route missing components, material shortages, weld studs/nuts, PEM hardware, purchased hardware, and lead-time issues to Purchasing / Material Control instead of forcing everything through Engineering.

Future value:

- Reduce Engineering noise when the issue is actually material availability or purchased component control.
- Help Purchasing / Material Control see shortages and lead-time risks sooner.
- Make missing hardware and purchased components easier to act on.

### V2-CAND-003 — Router Line Selection / Owner-Based Routing

**Purpose:**
Let users select the exact router line, material line, labor operation, or print BOM component tied to the issue, then auto-suggest routing destination.

Future value:

- Make issue ownership clearer.
- Reduce manual guessing during correction routing.
- Support cleaner Engineering, Purchasing, Quality, Supervisor, and department-owner handoffs.

### V2-CAND-004 — Ranked Issue Analytics / Current Top Problems Dashboard

**Purpose:**
Show simple bar-graph/ranked issue spread so supervisors and leadership can see where most current issues point.

Future value:

- Show current highest-frequency or highest-impact issue areas.
- Make direction obvious with simple ranked visuals.
- Help leadership and supervisors see whether most issues point toward Engineering, Purchasing, Laser, Welding, QC, PEMing, Powder Coat, or another owner/process.

---

## 7. Routing Rules To Preserve

Routing rules to preserve for future controlled planning:

- **M line = purchased material/component/hardware ownership**.
- **L line = labor/operation/department ownership**.
- **Print BOM = component/output expectation**.
- Raw material shortage routes to Purchasing / Material Control.
- Missing laser-cut component routes based on cause.
- Missing purchased hardware routes to Purchasing / Material Control.
- Wrong router/BOM/print/spec routes to Engineering.
- Operation missed routes to department owner / Supervisor.
- Defect/rejection routes to Quality plus owner.
- Outside process/plating routes to Purchasing / Vendor Coordination.
- Powder coat `PT10` routes internally to Powder Coat/Paint because the company owns powder coat.
- `QC10` can report unsigned operations / first-piece / last-piece process control breakdowns.

These rules should support future owner-based routing without turning Refab Connect into an ERP system.

---

## 8. Evidence Rules To Preserve

Evidence rules to preserve for future controlled planning:

- Customer prints vary.
- Print BOMs are not always structured consistently.
- Photo evidence should support router line, print BOM callout, missing component area, physical shortage, installed hardware defect, or failed process condition.
- Evidence protects the request when documents vary.

Future evidence support should make correction requests easier to verify when work orders, routers, customer prints, and BOMs are inconsistent or incomplete.

---

## 9. Continuous Improvement Principle

Refab Connect V2 should make it normal for operators, welders, machinists, laser, forming, PEMing, powder coat, QC, supervisors, Purchasing, Engineering, and leadership to surface issues and route them to the right owner.

Core shop-floor principle:

**“I’ll drop a Connect.”**

This means a worker can capture the issue, attach context, route it to the right owner, and make the next action visible instead of relying on walking, interrupting, tribal reminders, or hoping someone remembers before the next run.

---

## 10. Scope Guardrail

V2-M13 preserves backlog ideas but does not implement them.

Guardrails:

- Do not implement these backlog items in V2-M13.
- Do not add runtime features.
- Do not add new lanes.
- Do not add dashboard or analytics.
- Do not add purchasing routing runtime.
- Do not add database/auth/backend.
- Preserve these ideas for later controlled planning or V3.

V2 scope and broad direction are closed. New major expansion belongs in V3 if needed.

---

## 11. Acceptance Checks

V2-M13 is accepted when the following checks are true:

- V2-M13 document exists.
- Locked V2 direction is documented.
- Current runtime accomplishments are summarized.
- Future candidate backlog items are preserved.
- Routing rules are documented.
- Evidence rules are documented.
- Continuous improvement / “drop a Connect” principle is documented.
- Scope guardrails are clear.
- No runtime files are changed.
- No routes are changed.
- No app features are added.
- No V1 records are modified.

---

## 12. Next Recommended Milestone

**V2-M14 — V2 Final QA / Regression Review**

The next milestone should perform a controlled final QA/regression review before V2 closeout documentation begins.
