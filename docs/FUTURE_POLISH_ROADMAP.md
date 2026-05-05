# Refab Connect Future Polish Roadmap

This document captures future polish ideas for Refab Connect / AI-WOC that should not be implemented during the current locked milestone unless explicitly approved.

---

## M17 or Later — Splash Screen / Launch Experience Polish

### Status

Future polish note only. Do not implement during M16.

### Idea

Add a polished launch / splash screen as part of the owner-demo visual experience.

### Purpose

Make Refab Connect feel more like a finished product when opened from the iOS Home Screen or Safari, without slowing down shop-floor use.

### Splash Screen Direction

- Dark premium Refab Connect background
- REFAB CONNECT title or logo
- Work Order Correction System subtitle
- Powered by Applied Intelligence Framework
- Small status text such as:
  - Initializing secure workflow...
- After the short splash, route normally:
  - If no user is saved, route to Login screen
  - If user is already logged in, route to Home screen

### Rules

- Keep splash short, around 1–1.5 seconds
- Do not slow down shop-floor use
- Do not block functionality
- Do not add new workflow steps
- Do not interfere with:
  - persistent user login
  - Setup/Admin master-code lock
  - 4-digit Send PIN
  - AI extraction
  - email send behavior
  - drafts/history persistence
  - print/export behavior

### Acceptance Direction for Future Milestone

- App opens with a polished launch feel
- Splash is brief and non-blocking
- Existing login routing still works
- Existing Home routing still works for saved users
- No workflow, gate, send, setup, or extraction behavior changes
