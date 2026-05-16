# V7-M1 — Audit Intake / Live Branch Reality Check

## Purpose

This tracker converts Claude's V7 whole-app audit categories into a live-branch intake plan for `feature/v4-m13-structured-corrective-action`. The goal is to separate stale/already-fixed notes from verified remaining cleanup work before any V7 runtime changes begin.

## Verification Boundary

- Documentation-only intake tracker.
- No runtime files were patched.
- No app behavior was changed.
- V6 closeout/source-of-truth docs remain untouched.
- V6 PDF/email gates, Send PIN gates, generated-package requirements, final review gates, and Simple Mode flow remain locked.

## Live Branch Audit Intake Tracker

| Claude Finding ID | Finding Summary | Live Branch Status | Severity | V7 Milestone Assignment | Action |
|---|---|---|---|---|---|
| H1 | LaunchSplash branding still using stale/non-AI-CAS language. | No Action / Already Fixed — launch splash now presents AI-CAS, Corrective Action System, and Applied Intelligence Framework wording. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed. Keep as verification evidence only. |
| H2 | `app/layout` metadata/app-shell branding still using stale/non-AI-CAS language. | No Action / Already Fixed — metadata title, description, icons, and Apple web app title are AI-CAS/Corrective Action System aligned. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed. Keep as verification evidence only. |
| H3 | `correctionRecordTypes` source branding still stale. | No Action / Already Fixed — correction record source constant is `AI-CAS`; remaining schema version name is separately tracked under L7. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed for source branding. Do not reopen records for branding alone. |
| H4 | `GenerateScreen` still contains V4 wording in the main operator flow. | No Action / Already Fixed — primary Generate screen copy is AI-CAS/corrective-action language. Remaining V4 references are version strings/log tags or More-screen build-status copy tracked separately. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed. Preserve Simple Mode flow during later cleanup. |
| M1 | Setup config sender default still uses stale sender branding. | No Action / Already Fixed — `defaultSetupConfig.senderDisplayName` is `AI-CAS`; remaining `REFAB_CONNECT_*` environment names are config keys and not runtime copy. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed. Do not rename environment variables during V7 cleanup unless planned as a compatibility migration. |
| M2 | More screen placeholder/status copy remains stale or confusing. | Real Remaining Finding — More screen still shows `V4 corrective action workflow active.` and the setup sender placeholder still says `REFAB Connect`. | Medium | V7-M7 More / Setup Screen Polish | Plan a copy-only cleanup milestone for More/Setup wording. Avoid behavior changes and avoid changing setup storage semantics. |
| M3 | `CAPTURE_CONTEXT_STORAGE_KEY` is duplicated instead of centralized. | Real Remaining Finding — capture context key is declared in both Capture screen and AI draft input wiring. | Medium | V7-M3 Storage Key Deduplication | Centralize the capture-context session key in a shared logic module in V7-M3 with backward-compatible key value preservation. |
| M4 | `PHOTO_EVIDENCE_STORAGE_KEY` is duplicated instead of centralized. | Real Remaining Finding — photo evidence key exists in evidence preparation plus duplicate local declarations in Capture and print-report logic, with a re-export from the data model. | Medium | V7-M3 Storage Key Deduplication | Consolidate photo-evidence storage key imports in V7-M3 without changing the literal key or session-storage behavior. |
| M5 | `AgentConsoleShell` appears to be a dead component. | Real Remaining Finding — component exports exist, but no live app import references were found. | Medium | V7-M4 Dead Component Cleanup | Confirm no hidden route/import usage, then remove or archive the component in V7-M4. Do not touch active `WocApp` flow. |
| M6 | `CorrectiveActionBuilderShell` appears to be a dead component. | Real Remaining Finding — component exports exist, but no live app import references were found. | Medium | V7-M4 Dead Component Cleanup | Confirm no hidden route/import usage, then remove or archive the component in V7-M4. Do not touch active corrective-action builder/review flow. |
| M7 | `/api/send-correction` branding needs verification. | Real Remaining Finding — route is mostly AI-CAS aligned, but email body still says `Engineering Correction Report`; `REFAB_CONNECT_*` environment names remain. | Medium | V7-M2 Remaining Runtime Branding Cleanup | Decide whether `Engineering Correction Report` is intentional legacy wording or should become controlled corrective-action wording. Preserve email/PDF gates. |
| M8 | `/print-report` branding needs verification. | No Action / Already Fixed — print report surface uses AI-CAS, Corrective Action System, Corrective Action Report, and Applied Intelligence Framework wording. | No Action / Keep Locked | V7-M10 V7 Closeout | No Action / Already Fixed. Keep print route out of V7 unless a separate PDF serializer quality milestone requires review. |
| L1 | Storage key prefix migration planning is needed because local/session keys still use `refab-connect-*`. | Real Remaining Finding — setup, capture context, photo evidence, print report, record storage, and user storage keys still preserve `refab-connect` prefixes. | Low | V7-M3 Storage Key Deduplication | Plan only. Do not rename keys without a migration/compatibility strategy because local/session persistence may depend on existing literals. |
| L2/L3 | Server log tags still contain older milestone labels and should be cleaned up. | Real Remaining Finding — OpenAI Vision route still logs `[V4-M12C]`; this is server-log-only cleanup, not a user-facing issue. | Low | V7-M6 Server Log Tag Cleanup | Replace stale log tags in a dedicated V7-M6 cleanup, preserving logging fields and API behavior. |
| L4 | More screen build status is stale. | Real Remaining Finding — More screen build status says `V4 corrective action workflow active.` | Low | V7-M7 More / Setup Screen Polish | Update More screen status copy during V7-M7 along with M2. Keep it copy-only. |
| L5 | Duplicate PIN field / release PIN placeholder on Review screen. | Real Remaining Finding — active Send PIN exists and a disabled `4-Digit Release PIN Placeholder` remains lower on the screen. | Medium | V7-M5 Review Screen Cleanup | Remove or clarify duplicate disabled review PIN UI in V7-M5 without weakening the active Send PIN gate. |
| L6 | Unused copy props/functions remain around Review screen copy actions. | Real Remaining Finding — Review screen props include `onCopyReport` and `onCopyEmailDraft`, while the component uses its internal enhanced copy flow; app-level handlers still pass them. | Low | V7-M5 Review Screen Cleanup | Remove unused copy props/handlers in V7-M5 after confirming no active UI depends on them. Keep copy behavior intact. |
| L7 | Schema version naming is stale/non-AI-CAS. | Real Remaining Finding — correction record schema version remains `M17-backend-ready-v1`. | Low | V7-M9 PDF Serializer Quality Planning | Plan whether schema naming should remain immutable for record compatibility or receive a versioned migration. Do not rename stored schema without migration planning. |
| L8 | V2 CSS imports remain in app layout. | Real Remaining Finding — `app/layout.tsx` still imports `v2-more-admin-layout.css` and `v2-tablet-polish.css`. | Low | V7-M8 CSS / Mobile Layout Audit | Audit whether files are still active styling, then rename/consolidate only in a CSS/mobile layout milestone. No behavior changes in V7-M1. |

## Recommended V7 Work Queue

1. **V7-M2 Remaining Runtime Branding Cleanup** — resolve verified runtime copy issues such as `/api/send-correction` wording while keeping PDF/email gates locked.
2. **V7-M3 Storage Key Deduplication** — centralize duplicated storage-key literals and plan any prefix migration without changing persisted key values unexpectedly.
3. **V7-M4 Dead Component Cleanup** — remove or archive unused shell components after confirming they are not imported by live routes.
4. **V7-M5 Review Screen Cleanup** — remove confusing duplicate Review controls and unused copy props without altering final-review, PDF, email, or Send PIN gates.
5. **V7-M6 Server Log Tag Cleanup** — update stale server log tags only.
6. **V7-M7 More / Setup Screen Polish** — clean More/Setup copy and placeholders.
7. **V7-M8 CSS / Mobile Layout Audit** — verify legacy CSS filenames/imports and mobile/tablet layout risks.
8. **V7-M9 PDF Serializer Quality Planning** — plan schema/version naming and serializer-quality work without reopening V6 gates.
9. **V7-M10 V7 Closeout** — confirm stale findings stayed resolved and close the V7 cleanup sequence.

## V7-M1 Closeout Notes

- V7-M1 produced the intake tracker only.
- Already-fixed findings were marked `No Action / Already Fixed`.
- Remaining findings were assigned to future V7 milestones.
- Runtime files, app behavior, PDF/email gates, Simple Mode flow, feature code, and V6 docs were intentionally left unchanged.
