# VISUAL REFERENCE — REFAB CONNECT CORE RESKIN

## Reference File

`Refab_Connect_Owner_Demonstration_Packet.pdf`

Use this as visual direction, not as an exact layout to copy.

---

## Primary Visual Target

Use the **dark phone UI** shown inside the packet as the app design target.

Do **not** build the app like the full white marketing flyer.

The flyer is owner-facing presentation material.

The in-app screens should look like the black phone mockups.

---

## Core Visual Style

- Dark / black app background
- Clean industrial-tech feel
- Red for primary correction/action buttons
- Blue for capture/navigation/active highlights
- Green for confirmed/system-active status
- White primary text
- Gray secondary helper text
- Thin card borders
- Subtle glow, not messy over-glow
- Rounded mobile cards
- Simple high-contrast shop-floor readability

---

## Brand Language to Preserve

- REFAB CONNECT
- Work Order Correction System
- Powered by Applied Intelligence Framework
- Clear. Guided. Fast.
- Fix bad router data before it becomes waste.

---

## Workflow Shown in Packet

1. Capture Router
2. Extract + Confirm
3. Build Correction
4. Generate Draft
5. Confirm + Send

---

## Clean Rebuild Structure Mapping

The current clean rebuild may structure this as:

```text
Home → Capture → Confirm → Generate → Review / Send
```

Interpretation:

- **Build Correction** means correction type + issue details.
- **Generate Draft** means Engineering report + email draft.
- **Confirm + Send** means final review, copy/send action.

---

## Home Screen Visual Target

- Top status pill: `SYSTEM ACTIVE`, green dot
- Centered REFAB Connect mark
- Title: `Correction System Active`
- Subtitle: `Clear. Guided. Fast.`
- Primary CTA: `Start Capture`
- Below: workflow preview cards

---

## Capture Screen Visual Target

- Dark card layout
- Photo/upload choices
- Clear work order/header field structure
- Obvious manual fallback
- Primary button: `Capture Router`

---

## Confirm Screen Visual Target

- Extracted fields shown clearly
- Green checks for confirmed fields
- Obvious confirm action
- Do not allow proceeding until required fields are confirmed

---

## Build / Generate Screen Visual Target

- Correction type selector
- Process affected selector
- Issue details
- Requested correction/action
- Primary red button: `Generate Draft`

---

## Review / Send Screen Visual Target

- Draft/report preview
- Status: `Draft Ready` or `Ready to Send`
- `Copy Report`
- `Copy Email Draft`
- `Send / Confirm Send`
- `Save Draft` if implemented

---

## Bottom Navigation Target

- Dark translucent dock
- Home, Capture, Drafts, History, More
- Active item blue
- Inactive items gray/white
- Stable fixed bottom position
- No white boxes
- No side-to-side drift

---

## Do Not Bring Forward

- Old broken icon CSS
- Old polish patch files
- Old PWA hacks
- Old oversized/glitchy nav
- Old hero icon render bug

---

## Acceptance Check

The app should feel like the black phone mockups inside the owner packet:

Clean, dark, controlled, guided, and shop-floor usable.
