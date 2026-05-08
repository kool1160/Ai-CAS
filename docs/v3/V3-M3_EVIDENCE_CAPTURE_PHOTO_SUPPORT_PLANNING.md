# Applied Intelligence | Standardize to Optimize
# V3-M3 — Evidence Capture / Photo Support Planning

Project: Refab Connect V3  
Milestone: V3-M3  
Status: Planning Document  
Scope: Documentation Only  
Runtime Changes: None  
Source Files:  
- docs/v3/REFAB_CONNECT_V3_STARTUP_PACKET.md  
- docs/v3/V3-M1_ROUTER_AWARE_EXCEPTION_ROUTING_ARCHITECTURE.md  
- docs/v3/V3-M2_REQUEST_TYPE_ROUTING_DESTINATION_MODEL.md

---

# 1. Purpose

Evidence capture matters because a shop-floor issue should be understandable without forcing someone to walk across the shop to re-explain it.

Photos reduce wasted motion, waiting, interruptions, lost context, and verbal-only reminder loops.

Evidence supports owner-based routing by showing what failed, where it failed, and what owner needs to act next.

Core principle:

> Evidence should make the issue understandable without forcing someone to walk across the shop to re-explain it.

Evidence should support the fix, not create unnecessary friction.

---

# 2. Evidence Types

Supported evidence types for V3 planning:

- Router/header photo.
- Print/BOM photo.
- Missing component photo.
- Physical issue photo.
- Failed/defective part photo.
- Unsigned operation/signoff photo.
- Material/component label photo.
- Work order note/scribble photo.
- Fixture/tooling issue photo.
- Packaging/shipping/receiving issue photo.

---

# 3. Evidence Rules By Request Type

| Request Type | Required Evidence | Helpful Extra Evidence | Why It Matters |
|---|---|---|---|
| Material Shortage | Router/header photo, M-line/material line photo if available | Material label photo, empty bin/rack/location photo, work order note photo | Helps Purchasing / Material Control confirm what material is missing and whether the shortage is a supply, release, or location issue. |
| Purchased Component Shortage | Router/header photo, component line or BOM photo, missing component photo | Vendor/package label photo, count photo, work order scribble/note photo | Confirms the component, expected quantity, actual quantity, and whether Purchasing or Engineering needs to act. |
| Missing Laser-Cut Component | Router/header photo, laser operation or print/BOM component photo, missing component photo | Nest/cut list photo if available, remaining components photo, material/output location photo | Helps Laser / Production determine whether the item was not nested, not cut, lost, miscounted, or missing from source documentation. |
| Wrong Material / Wrong Gauge | Material/component label photo, router M-line photo, physical issue photo | Print/spec photo, comparison photo, receiving/packaging photo | Confirms whether the wrong material was supplied, pulled, labeled, cut, or specified incorrectly. |
| Missing or Wrong Router Operation | Router/header photo, router operation line photo | Print/process requirement photo, work order note/scribble photo | Helps Engineering and Supervisor verify if the router operation is missing, wrong, out of sequence, or unclear. |
| Missing or Wrong BOM / Print Callout | Print/BOM photo, router/header photo | Component/hardware location photo, work order note/scribble photo | Helps Engineering confirm whether source documentation is wrong, missing, or unclear. |
| PEM / Hardware Issue | Hardware/PEM callout photo, physical issue photo | Failed insert photo, hardware label photo, location/scale photo | Helps PEMing / Hardware Insertion, Quality, and Engineering determine if the issue is part condition, hardware, insertion, or source data. |
| Weld Nut / Weld Stud Issue | Hardware callout photo, physical issue photo | Failed weld/stud photo, hardware label photo, location photo | Helps Welding, Quality, and Engineering verify hardware type, location, quantity, and weld/stud failure mode. |
| Powder Coat / Paint Issue | Finish/defect photo, PT10/router operation photo | Finish spec/photo, color label/photo, affected area photo | Helps Powder Coat / Paint and Quality confirm finish, color, damage, missed operation, or rejection. |
| Plating / Outside Processing Issue | Outside processing/router line photo, issue/defect photo | Vendor paperwork/photo, finish spec photo, packaging/receiving photo | Helps Purchasing / Vendor Coordination and Quality confirm outside-process status, vendor issue, plating defect, or rejection. |
| Defect / Rejection | Failed/defective part photo, router/header photo | Inspection evidence, defect location photo, scale/context photo | Helps Quality and the owning department understand the defect without needing immediate re-explanation. |
| First Piece Not Signed Off | Unsigned first-piece/signoff photo, router operation photo | Part/work order photo, operator note photo | Shows Quality / Supervisor where the process-control gap exists and what operation needs review. |
| Last Piece Not Signed Off | Unsigned last-piece/signoff photo, router operation photo | Part/work order photo, operator note photo | Shows Quality / Supervisor whether completion control was missed and which owner must verify. |
| Operation Not Signed Off | Unsigned operation/signoff photo, router/header photo | Prior/next operation photo, work order note photo | Helps Quality / Supervisor verify whether the operation was performed, skipped, or simply not signed off. |
| Process Control Breakdown | Photo evidence of missed control point, router/signoff photo | Repeat issue context, physical issue photo, work order note/scribble photo | Helps Supervisor, Quality, and the owning department identify recurring control failures and stabilize the workflow. |

---

# 4. Minimum Evidence Standard

Minimum evidence standard:

- At least one photo should be attached when possible.
- Router/work order context should be captured when available.
- Defect/shortage photos should show the actual issue.
- Label photos should show readable part/material/component data when available.
- Evidence should support routing, not create unnecessary friction.

Evidence should be useful enough to route the issue and understand the next action.

Perfect evidence is not required to submit a Connect.

---

# 5. Operator Simplicity Rules

Floor input should stay simple.

Preferred operator flow:

1. Snap the issue.
2. Snap the router/WO if needed.
3. Add short note.
4. Select request type if known.
5. Submit/drop the Connect.

The operator should not be forced to complete a complex report before the issue can be routed.

The goal is fast capture with enough context to act.

---

# 6. Evidence Quality Guidance

Helpful photo guidance:

- Make text readable.
- Include part/work order number when possible.
- Photograph the missing/defective area clearly.
- Avoid blurry closeups.
- Include scale/context when helpful.
- Do not require perfect photos to submit.

Good evidence should make the issue clear enough for the routed owner to begin review.

---

# 7. Evidence Privacy / Safety Guardrails

Evidence should support the fix, not blame people.

Guardrails:

- Do not include personal/private employee information unless necessary.
- Do not take photos in unsafe situations.
- Do not delay urgent production action just to get perfect evidence.
- Do not use evidence as a blame tool.
- Capture only what helps explain the issue, owner, impact, or next action.

Safety and production response come before perfect documentation.

---

# 8. Routing Support

Evidence helps each owner act faster:

## Purchasing / Material Control

Evidence helps confirm shortage, component data, material line, actual quantity, label information, and whether purchasing action is needed.

## Engineering

Evidence helps verify print, BOM, router, callout, quantity, or specification issues without requiring immediate physical re-check.

## Quality / QC

Evidence helps understand defects, rejections, unsigned operations, inspection gaps, and process-control breakdowns.

## Supervisor / Production

Evidence helps see missed operations, production blockers, repeat issues, and flow impact.

## Laser / Production

Evidence helps confirm missing cut output, nesting/cut quantity issues, lost components, and whether raw material exists but the laser output is missing.

## Powder Coat / Paint

Evidence helps confirm finish defects, wrong color, damage, missed PT10 operation, or rework needs.

## Outside Processing

Evidence helps confirm vendor/plating issue, outside process status, finish defect, paperwork, packaging, or receiving issue.

---

# 9. Future Runtime Direction

Future runtime support should preserve the following options:

- Multiple photos per Connect.
- Photo labels/categories.
- Required vs optional evidence prompts.
- Evidence preview before submit.
- Attach evidence to history record.
- Evidence visible in owner review screen.
- Future analytics based on evidence/request type.

These are future runtime directions only.

V3-M3 does not implement camera, upload, storage, or preview behavior.

---

# 10. Non-Goals

V3-M3 does not include:

- Runtime implementation.
- Camera/upload code.
- Cloud storage.
- Backend/database work.
- AI vision automation.
- Complex evidence approval workflow.
- Dashboard build.
- New app routes.
- Production feature implementation.

This milestone defines evidence and photo support planning only.

---

# 11. Acceptance Criteria

This document passes if:

- Evidence types are defined.
- Request type evidence expectations are mapped.
- Operator workflow remains simple.
- Evidence supports routing by failure point and owner.
- Future runtime direction is preserved.
- No runtime work is added.

---

# 12. Final Statement

V3-M3 defines evidence capture and photo support rules for Refab Connect V3.

Evidence exists to make the issue clear, preserve context, support routing, and reduce wasted motion.

Runtime implementation remains blocked until Planning approves a future implementation milestone.
