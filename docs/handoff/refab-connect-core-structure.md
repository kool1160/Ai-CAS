# REFAB CONNECT CORE STRUCTURE — CLEAN APP SOURCE

## Status

This document defines the intended structure and behavior of the clean Refab Connect / AI-WOC rebuild.

It should be treated as the source of truth for workflow, gates, screens, and outputs.

It should not be treated as a requirement to copy the old app’s skin, CSS, visual patches, icon work, or broken layout behavior.

---

## KEEP

### Main Screens

1. Home  
2. Capture  
3. Confirm  
4. Generate  
5. Review / Send  

### Bottom Navigation

1. Home  
2. Capture  
3. Drafts  
4. History  
5. More  

### Required Workflow Order

1. Start Correction  
2. Capture Work Order Data  
3. Confirm Extracted Information  
4. Generate Correction Package  
5. Review and Send  

### Required Gates Before Sending

1. Work Order Data Confirmed  
2. Part Number Confirmed  
3. Correction Type Selected  
4. Issue Details Entered  
5. Final Review Confirmed  

### Required Outputs

1. Engineering Report  
2. Email Draft  
3. History Record  

---

## INTERPRETATION RULE

The clean app should preserve the behavior and process, not the old app’s broken implementation.

Use the old app only as loose reference if absolutely necessary.

Do not copy old visual patch files, icon hacks, stacked CSS overrides, broken PWA layers, or debunked skin behavior.

---

## CORE APP PURPOSE

Refab Connect / AI-WOC is a controlled Engineering Work Order Correction system.

It helps a shop-floor user capture work order/router/header information, confirm the data, describe a required correction, generate a structured Engineering report, generate an Engineering email draft, and send or copy the correction package only after confirmation gates are satisfied.

---

## NON-NEGOTIABLE BEHAVIOR

- User must not be able to send without required confirmation.
- Work order and part number must be reviewed.
- Correction type must be selected.
- Issue details must be entered.
- Report and email must be reviewed before final send/copy.
- Manual fallback must exist if OCR / AI Vision extraction fails.
- The process must remain fast enough for shop-floor use.

---

## BUILD PRIORITY

1. Build the screen flow.
2. Build the state/data model.
3. Build the gates.
4. Build report/email generation.
5. Build draft/history behavior.
6. Add clean UI skin after structure works.

---

## DO NOT BRING FORWARD

- Old polish CSS
- Icon patch CSS
- Nav stability hacks
- Overscroll hacks
- Horizontal lock hacks
- Locked color theme patches
- Broken image/icon/PWA fixes
- Any old visual override layers
- Any layout behavior that caused side-scroll, broken icons, shifting nav, or blank hero marks

---

## MUST IMPROVE

- Make the workflow obvious.
- Make Capture → Confirm → Generate → Review / Send feel controlled.
- Reduce the chance of bad data being sent.
- Improve Engineering report clarity.
- Improve email draft clarity.
- Remove placeholder/incomplete output.
- Preserve history when available.
- Keep the app fast for shop-floor use.
