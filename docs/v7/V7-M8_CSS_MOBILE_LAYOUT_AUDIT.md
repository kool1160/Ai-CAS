# V7-M8 — CSS / Mobile Layout Audit

## Purpose

Document the live-branch status of the legacy V2 CSS imports and mobile/tablet layout risk for `feature/v4-m13-structured-corrective-action`.

## Verification Boundary

- Documentation-only audit record.
- No runtime CSS behavior was changed.
- No CSS files were deleted, renamed, or consolidated.
- No app logic, PDF/email gates, Send PIN gates, generated-package gates, final-review gates, or Simple Mode flow was changed.
- V6 closeout/source-of-truth docs remain untouched.

## Files Reviewed

- `app/layout.tsx`
- `app/globals.css`
- `app/v2-more-admin-layout.css`
- `app/v2-tablet-polish.css`
- `features/woc/components/CaptureScreen.tsx`
- `features/woc/components/ConfirmScreen.tsx`
- `features/woc/components/GenerateScreen.tsx`
- `features/woc/components/ReviewSendScreen.tsx`
- `features/woc/components/MoreScreen.tsx`
- Supporting active shell/navigation/list screens where shared selectors are applied:
  - `features/woc/components/WocApp.tsx`
  - `features/woc/components/BottomNav.tsx`
  - `features/woc/components/HomeScreen.tsx`
  - `features/woc/components/DraftsScreen.tsx`
  - `features/woc/components/HistoryScreen.tsx`
  - `features/woc/components/ControlledPdfPreviewRenderer.tsx`
  - `features/woc/components/EngineeringAnalyticsPreview.tsx`

## Import Status

Both legacy V2 CSS files are still loaded globally by the root layout:

- `app/v2-more-admin-layout.css`
- `app/v2-tablet-polish.css`

Import order is currently:

1. `app/globals.css`
2. `app/v2-more-admin-layout.css`
3. `app/v2-tablet-polish.css`

Because `v2-tablet-polish.css` loads after `v2-more-admin-layout.css`, any equal-specificity desktop More-screen rules in `v2-tablet-polish.css` win over earlier More-layout rules.

## Selector Match Audit

### `app/v2-more-admin-layout.css`

| Selector | Active match status | Notes |
|---|---|---|
| `.more-admin-screen` | Active | `MoreScreen` renders `stack more-admin-screen`. Equal-specificity grid rules are later superseded by `v2-tablet-polish.css` at `min-width: 1024px`. |
| `.more-admin-screen > .screen-title` | Active | `MoreScreen` has a direct `.screen-title` child. This selector is duplicated in `v2-tablet-polish.css`. |
| `.more-user-panel` | Active | Rendered by `MoreScreen`. |
| `.more-settings-panel` | Active | Rendered by `MoreScreen`. |
| `.more-setup-panel` | Active | Rendered by `MoreScreen`. Sticky positioning in this file is later overridden to `position: static` by `v2-tablet-polish.css` at the same breakpoint. |
| `.more-setup-panel .form-grid` | Active | Matches both locked and unlocked setup forms in `MoreScreen`. Grid-column rule remains active unless superseded by later shorthand/individual rules; later file only changes gap. |
| `.more-analytics-panel` | No active component match found | The class appears only in the CSS files during this audit. It appears obsolete/dead unless planned for a future More analytics card. |
| `.more-analytics-panel > .card` | No active component match found | No active `.more-analytics-panel` wrapper was found. |
| `.more-records-panel` | No active component match found | The class appears only in the CSS files during this audit. It appears obsolete/dead unless planned for a future More records card. |

### `app/v2-tablet-polish.css`

| Selector | Active match status | Notes |
|---|---|---|
| `:root --nav-clearance` | Active | Adjusts shared shell/nav clearance at desktop breakpoint. |
| `.app-shell` | Active | Rendered by `WocApp` and `LoginScreen`. |
| `.app-frame` | Active | Rendered by `WocApp` and `LoginScreen`. |
| `.screen-title`, `.screen-title h1`, `.screen-title p` | Active | Used across the shell and all primary workflow screens. |
| `.card-grid` | Active | Used by home/workflow preview. |
| `.stack` | Active | Used across Capture, Confirm, Generate, Review, More, History, Drafts, and support previews. |
| `.form-grid` | Active | Used across login, capture, generate, review, drafts, and More setup forms. |
| `.placeholder-list` | Active | Used across More, Generate, Review, Drafts, History, analytics, and PDF preview renderer. |
| `.card` | Active | Widely used by primary screens and panels. |
| `.placeholder-item` | Active | Used by list rows/cards across More, Generate, Review, Drafts, History, analytics, and PDF preview renderer. |
| `.preview-box` | Active | Used by Review, Drafts, History, and controlled PDF preview renderer. |
| `.home-screen` | Active | Used by `HomeScreen` and `LoginScreen`. |
| `.home-screen .hero` | Active | Used by `HomeScreen` and `LoginScreen` hero sections. |
| `.workflow-preview` | Active | Used by `HomeScreen`. |
| `.review-panel-screen` | Active | Used by `ReviewSendScreen`. |
| `.record-review-screen` | Active | Used by `DraftsScreen` and `HistoryScreen`. |
| `.record-list-panel` | Active | Used by `DraftsScreen` and `HistoryScreen`. |
| `.record-detail-panel` | Active | Used by `DraftsScreen` and `HistoryScreen`. |
| `.review-report-panel` | Active | Used by `ReviewSendScreen`. |
| `.review-action-panel` | Active | Used by `ReviewSendScreen`. |
| `.more-admin-screen` | Active | Used by `MoreScreen`; overrides some earlier More layout rules due import order. |
| `.more-admin-screen > .screen-title` | Active | Used by `MoreScreen`; duplicates earlier rule. |
| `.more-left-column` | Active | Used by `MoreScreen`. |
| `.more-right-column` | Active | Used by `MoreScreen`. |
| `.more-user-panel` | Active | Used by `MoreScreen`. |
| `.more-settings-panel` | Active | Used by `MoreScreen`. |
| `.more-setup-panel` | Active | Used by `MoreScreen`; later file explicitly disables earlier sticky behavior. |
| `.more-setup-panel .form-grid` | Active | Used by `MoreScreen`. |
| `.more-admin-screen .button.full-width` | Active | Matches More-screen full-width buttons. Desktop-only rule makes them auto-width with a minimum cap. |
| `.more-admin-screen .action-row` | Active | Matches More current-operator action row. |
| `.review-panel-screen .action-row` | Active | Matches Review action groups. |
| `.record-review-screen .action-row` | Active | Matches Drafts and History action groups. |
| `.review-panel-screen .button` | Active | Matches Review buttons. |
| `.record-review-screen .button` | Active | Matches Drafts and History buttons. |
| `.more-admin-screen .button` | Active | Matches More buttons. |
| `.nav-dock` | Active | Rendered by `BottomNav`. |
| `.more-analytics-panel` | No active component match found | Appears obsolete/dead unless a future More analytics panel is restored. |
| `.more-records-panel` | No active component match found | Appears obsolete/dead unless a future More records panel is restored. |

## Mobile / Tablet Layout Risk Review

### Horizontal overflow

Current mitigations:

- Global `box-sizing` plus `min-width: 0` is applied to all elements.
- `html`, `body`, `.app-shell`, and `.app-frame` restrict horizontal overflow.
- `.card`, `.placeholder-item`, `.preview-box`, `.screen-title`, `.card-header`, and text-heavy blocks use max-width/min-width/overflow-wrap safeguards.

Residual risk:

- Low. Long work-order IDs, subject lines, generated draft text, or user-entered values should wrap rather than force page overflow.
- The main risk is not the audited V2 files themselves; it is future additions that introduce unwrapped inline content or fixed-width controls inside cards.

### Fixed-width elements

Current mitigations:

- Most frame and nav widths use `min()` or `calc()` rather than hard fixed widths.
- Desktop grid column floors only start at `min-width: 1024px`, where the combined minimums should fit within the available frame.

Residual risk:

- Low to medium. Desktop-only grid minimums such as More's `minmax(300px, ...)` plus `minmax(390px, ...)` and Home's column floors should remain acceptable at the configured breakpoints, but they should be rechecked if desktop shell padding, frame max-width, or the breakpoint changes.

### Cramped badge rows

Current mitigations:

- Shared pill/status selectors allow wrapping.
- Review badge rows wrap by default and become a vertical stack on narrow screens.

Residual risk:

- Low. Dense Review status/badge combinations can still become visually tall on iPhone widths, but the current CSS favors readability over single-line compression.

### Bottom navigation / safe-area issues

Current mitigations:

- `viewportFit: 'cover'` is set in the viewport metadata.
- App shell/frame padding and nav positioning include `env(safe-area-inset-bottom)`.
- The nav uses `minmax(0, 1fr)` columns and reduced text sizing at narrow widths.

Residual risk:

- Low to medium. The nav is sticky rather than fixed, so it should avoid covering content in normal scroll flow. It still needs device testing on iPhones with home indicators because sticky bottom navigation plus dynamic browser chrome can vary between Safari/PWA modes.

### Card/header overflow

Current mitigations:

- Card headers wrap, and narrow screens convert the card header layout to a single-column grid.
- Card title/body text uses `overflow-wrap: anywhere`.

Residual risk:

- Low. The current CSS is intentionally defensive for long headings and status pills.

### iPhone readability

Current mitigations:

- Primary text sizes are generally 13px–16px, headings use larger sizes, buttons meet a comfortable tap height, and narrow-screen card padding/radii are reduced.
- Text-heavy preview boxes preserve line breaks and wrap long content.

Residual risk:

- Medium. Generated report/email preview text at 13px is dense on iPhone widths. This is acceptable for an audit/no-runtime-change milestone, but a later readability pass could consider a mobile-only preview font-size/line-height adjustment after visual QA.

## Findings

1. Both legacy V2 CSS files are still used because they are imported by `app/layout.tsx` and therefore included globally.
2. `v2-tablet-polish.css` is broadly active across the current shell, navigation, primary workflow screens, More, Drafts, History, and preview components.
3. `v2-more-admin-layout.css` is partially active, but several More desktop rules are duplicated or effectively overridden by `v2-tablet-polish.css` because `v2-tablet-polish.css` loads later.
4. `.more-analytics-panel` and `.more-records-panel` appear obsolete/dead in active components. They may reflect an older More screen layout or planned-but-not-rendered panels.
5. No urgent mobile overflow issue was found in the audited CSS. Existing global and component-level rules are generally defensive.
6. The highest remaining mobile/tablet risk is visual/readability QA, not a clear runtime defect: dense preview text, possible bottom-nav differences between mobile browser/PWA modes, and future fixed-width additions inside cards.

## Recommendations

1. Keep both CSS files as-is for V7-M8 because this milestone is documentation-only and the files still contain active selectors.
2. Do not remove `v2-tablet-polish.css`; it is active and provides current tablet/desktop layout behavior.
3. Do not remove `v2-more-admin-layout.css` yet; it still has matching selectors, and removing it would be a runtime CSS behavior change.
4. Plan a later CSS consolidation milestone to merge the still-useful More/admin rules into a better-named responsive layout file or into `globals.css` sections.
5. During consolidation, remove or archive obsolete selectors only after visual/device QA confirms no hidden route or future panel depends on `.more-analytics-panel` or `.more-records-panel`.
6. Consider renaming the legacy V2 CSS files later only as a dedicated no-behavior-drift cleanup with before/after screenshots at mobile, tablet, and desktop widths.
7. Add future visual QA coverage for iPhone-width Review/Drafts/History preview content and sticky bottom nav behavior in Safari/PWA contexts.

## Closeout Notes

- V7-M8 created this audit record only.
- No CSS, TypeScript, app flow, gates, or V6 docs were modified.
