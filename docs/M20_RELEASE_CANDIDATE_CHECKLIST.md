# M20 Release Candidate Stability / Final Regression Pass

Repo: `kool1160/refab-connect-core-reskin`

Status: Release-candidate checkpoint documentation.

M20 is a stability milestone only. It does not add major features, change workflow order, replace storage, modify security intent, or redesign the app.

---

## Locked Milestone Context

Current locked status entering M20:

- M1 — Clean Screen Flow: PASSED
- M2 — State / Data Model + Required Gates: PASSED
- M3 — Engineering Report + Email Draft Generation: PASSED
- M4 — Review Copy Controls: PASSED
- M5 — Save Draft + Drafts Behavior: PASSED
- M6 — History Behavior: PASSED
- M7 — Component Cleanup / Structure Split: PASSED
- M8 — Upload / Manual Capture Foundation: PASSED
- M9 — OCR / AI Vision Extraction from Uploaded Image: PASSED
- M10 — Real Email Send: PASSED
- M11 — LocalStorage Persistence: PASSED
- M12 — Send / Resume Saved Draft: PASSED
- M13 — Setup Panel / Master Code / Email Routing Config: PASSED
- M14 — Visual Polish / Owner Demo Pass: PASSED
- M15 — PDF Export / Print-Ready Correction Report: PASSED
- M16 — User Identity / App Access PIN / Send PIN: PASSED
- M17 — Backend Persistence Foundation: PASSED
- M18 — Backend API Stub / Record Sync Preparation: PASSED
- M19 — Engineering Analytics Preview / Local Records Dashboard: PASSED

---

## M20 Scope

M20 is a release-candidate stability checkpoint.

Allowed:

- light text cleanup
- light spacing cleanup
- safe-area fixes
- obvious mobile layout fixes
- broken label fixes
- regression fixes
- documentation of checked behavior

Not allowed:

- database implementation
- cloud sync
- camera capture
- full authentication
- role permissions
- audit logs
- new dashboard
- new bottom nav item
- major redesign
- workflow rewrite

---

## Release-Candidate Regression Checklist

Use this list for live mobile verification before locking M20 as PASSED.

| # | Check | Expected Result | Status |
|---:|---|---|---|
| 1 | App opens | App loads cleanly without crash | Pending live check |
| 2 | App Access PIN | Correct PIN unlocks app; wrong PIN blocks app | Pending live check |
| 3 | Upload image | User can select image/file from device | Pending live check |
| 4 | AI Vision extraction | Uploaded image can extract work order data | Pending live check |
| 5 | Confirm gates | Work Order and Part Number confirmation gates work | Pending live check |
| 6 | Generate Draft | Generate Draft creates report and email draft | Pending live check |
| 7 | Copy Report | Copies only report text | Pending live check |
| 8 | Copy Email Draft | Copies only email draft text | Pending live check |
| 9 | Save Draft | Saves generated correction package as Draft | Pending live check |
| 10 | Draft refresh persistence | Draft remains after refresh/reopen | Pending live check |
| 11 | Open saved Draft | Saved draft opens with report/email text | Pending live check |
| 12 | Saved Draft send | Saved draft sends only after Final Review + Send PIN | Pending live check |
| 13 | Review / Send send | Review / Send sends only after Final Review + Send PIN | Pending live check |
| 14 | Sent History record | Successful send creates History record with Sent status | Pending live check |
| 15 | History refresh persistence | History remains after refresh/reopen | Pending live check |
| 16 | Setup/Admin lock | Master code required; Setup relocks after save/navigation | Pending live check |
| 17 | Engineering recipient config | Configured recipient is used for send route payload | Pending live check |
| 18 | Export / Print Report | Opens isolated print route with report content | Pending live check |
| 19 | Print layout | Report prints cleanly and one page when possible | Pending live check |
| 20 | Engineering Analytics Preview | More screen shows local analytics from Draft/History records | Pending live check |
| 21 | Bottom nav stability | Bottom nav fully visible and stable | Pending live check |
| 22 | Horizontal drift | No horizontal scroll, zoom, or right-side clipping | Pending live check |
| 23 | Nav clearance | No content hidden behind bottom nav | Pending live check |
| 24 | Stale placeholder text | No obsolete inactive/placeholder text for working features | Pending live check |
| 25 | Vercel build/deploy | Production deployment passes | Pending deployment check |

---

## Code Inspection Notes

M20 code inspection focused on these active areas:

- `features/woc/components/WocApp.tsx`
- `features/woc/components/MoreScreen.tsx`
- `features/woc/components/EngineeringAnalyticsPreview.tsx`
- `app/print-report/page.tsx`
- `app/api/send-correction/route.ts`
- `app/globals.css`
- `features/woc/persistence/`

No new feature scope was added during this checkpoint.

---

## Known Limitations to Preserve Until Future Milestones

These are not M20 failures:

- Drafts and History are still localStorage-only.
- Backend sync route is a stub and does not persist records.
- Engineering Analytics Preview is local-only.
- App Access PIN is a local accidental-use lock, not enterprise authentication.
- Send PIN is a server-side email-send confirmation layer, not full role-based authorization.
- Setup/Admin master code is a local configuration lock, not enterprise admin auth.
- No camera capture yet.
- No cloud audit log yet.
- No admin reporting dashboard yet.

---

## M20 Release Candidate Rule

M20 should be locked only after live mobile regression confirms:

- no workflow regression
- no security-gate regression
- no print/export regression
- no local persistence regression
- no mobile layout regression
- Vercel deployment passes

Once verified, create the M16–M20 documentation package checkpoint.
