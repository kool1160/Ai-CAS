# REFAB Connect Core Reskin

Clean rebuild shell for the REFAB Connect / AI-WOC application.

## Purpose

This repo is intended to preserve the working core app logic while removing the stacked visual patch layers from the previous app.

## Build Rule

Core first. Skin second.

Do not bring over old theme overrides, icon hacks, or experimental CSS layers.

## Preserved Core Targets

- Capture workflow
- OCR / AI Vision flow
- Work order data extraction
- Confirmation gates
- Report generation
- Email draft / send behavior
- History behavior
- Five-item bottom navigation

## Fresh Reskin Targets

- One clean design system
- One theme file
- One icon system
- One app shell
- Mobile/iPad-first layout
- No stacked override patches

## Folder Map

```text
app/
  api/
  globals.css
  layout.tsx
  page.tsx

features/
  woc/
    components/
    logic/
    state/

public/
  brand/
  icons/

docs/
  handoff/
  build-notes/
```
