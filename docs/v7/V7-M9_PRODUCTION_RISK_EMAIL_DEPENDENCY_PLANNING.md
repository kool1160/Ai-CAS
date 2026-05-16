# V7-M9 — Production Risk / Email Payload / Dependency Planning

## Purpose

Create a documentation-only planning record for larger production-readiness risks identified by the Data Analyst project handoff and V7 audits on `feature/v4-m13-structured-corrective-action`.

This milestone does not implement any production-hardening changes. It records known planning areas so they can be evaluated in a future controlled track without reopening locked V6 PDF/email behavior.

## Verification Boundary

- Documentation-only planning record.
- No runtime behavior changed.
- No API routes were modified.
- No email body behavior was modified.
- No PDF generation, PDF attachment, generated-package, final-review, Send PIN, or Resend behavior was changed.
- No dependencies were upgraded or added.
- No lockfile was added, regenerated, or removed.
- No tests were added or modified.
- `/api/send` was not removed.
- Environment variable names were not renamed.
- V6 remains locked.
- V6 closeout/source-of-truth docs remain untouched.

## Do Now

The only V7-M9 action is this planning document:

1. Record production-readiness risks and decisions needed later.
2. Preserve the current V6 PDF/email gates and Send PIN gate.
3. Separate future implementation candidates from current milestone scope.
4. Recommend a future V8-or-later production-hardening track if the product is moving toward production use.

## Explicitly Out of Scope for V7-M9

- Runtime code changes.
- Dependency upgrades.
- `package-lock.json` generation, deletion, or regeneration.
- API route rewrites.
- Email body payload changes.
- `/api/send` removal.
- Test additions.
- PDF/email gate changes.
- Send PIN behavior changes.
- Environment variable renames.
- V6 closeout document edits.

## Current Observations

### 1. Email Payload Completeness

Current active controlled-send behavior uses `/api/send-correction` for the workflow PDF email path. The route accepts `reportText`, `emailDraftText`, subject/work-order metadata, a Send PIN, and optional PDF attachment fields.

Planning observations:

- The route currently validates that generated report text, email draft text, and subject line are present before sending.
- The route sends a controlled PDF attachment when a valid PDF payload is provided.
- The plain text email body is currently a concise summary that points the recipient to the attached Corrective Action Report rather than embedding the complete generated report or email draft text.
- A future production review should decide whether the plain email body must also include the full generated report/draft text for auditability, deliverability, accessibility, or attachment-loss scenarios.
- Any future change must preserve the V6 controlled PDF attachment gate, generated-package gate, final human review gate, and Send PIN gate.

V7-M9 planning position:

- Do not modify email body behavior now.
- Do not alter the PDF attachment requirement or validation now.
- Treat full-body email content as a future implementation candidate only.

### 2. Legacy/Stale Email Route

`/api/send/route.ts` remains present as a separate email route from the controlled workflow send route.

Planning observations:

- Current workflow send calls found during this planning pass target `/api/send-correction`.
- `/api/send/route.ts` uses different environment variable names than the active controlled workflow route.
- The route should be considered a legacy/stale-route risk until ownership and usage are confirmed.
- A future review should determine whether `/api/send` is unused, intentionally retained for a separate integration, or deprecated.

V7-M9 planning position:

- Do not remove `/api/send` now.
- Do not repoint callers now.
- Do not rename its environment variables now.
- Plan future removal, archival, or explicit documentation after usage is verified.

### 3. Dependency / Package Stability

Planning observations:

- The app currently declares Next.js, React, React DOM, Resend, and TypeScript dependencies in `package.json`.
- A `package-lock.json` is present in the repository at the time of this planning milestone.
- A future production-readiness task should review the Next.js version and dependency support posture before release.
- Any dependency review should decide whether the current lockfile is authoritative, whether it needs controlled regeneration, and whether package-manager policy should be documented.
- `npm audit` may be useful, but it should be run as a future controlled dependency/security task with expected remediation time, not as part of V7-M9.

V7-M9 planning position:

- Do not upgrade Next.js or other packages now.
- Do not add, delete, or regenerate the lockfile now.
- Do not run dependency remediation now.
- Track dependency stability as a future controlled production-hardening task.

### 4. Backend Persistence

`/api/correction-records` currently behaves as a validation/sync stub rather than a durable persistence layer.

Planning observations:

- The route validates normalized correction record payloads and returns `persisted: false` responses.
- Draft and history behavior remains local-first in the client workflow.
- This is acceptable for the current branch boundary, but it is a production-readiness risk if records must be queryable, auditable, shared across devices, retained after browser storage loss, or integrated with compliance workflows.

V7-M9 planning position:

- Do not add a database/storage layer now.
- Do not change draft/history persistence now.
- Plan a future database/storage decision covering schema ownership, retention, migration, authentication/authorization, and sync conflict behavior.

### 5. Test Coverage Planning

Future automated coverage should be planned around the locked gates and production-risk seams rather than added opportunistically in V7-M9.

Planning areas:

- **Gates:** generated-package availability, final human review, controlled PDF creation, controlled PDF attachment validation, and send readiness.
- **Send PIN behavior:** missing configured PIN, malformed submitted PIN, incorrect submitted PIN, and correct PIN path.
- **Generated package creation:** subject/report/email draft completeness, required work-order fields, reset behavior when upstream data changes, and copy/download/send readiness.
- **Correction record validation:** empty payload, invalid JSON, oversized batch, accepted/rejected counts, validation error shape, and `persisted: false` stub response.
- **Send route validation:** `/api/send-correction` payload requirements, PDF attachment rejection cases, Resend error handling, and legacy `/api/send` route behavior if retained.

V7-M9 planning position:

- Do not add tests now.
- Preserve V6 behavior while planning future coverage.
- Add tests in a controlled future implementation milestone with clear pass/fail expectations.

### 6. Production Resend Configuration

Planning observations:

- Production email sending should use a verified Resend domain and approved sender address before production use.
- Required environment variables must be configured in the target hosting environment before live sending.
- Current environment variable names should remain stable in this milestone to avoid accidental deployment breakage.
- Any future environment-variable rename should be handled as a migration with compatibility planning, deployment documentation, and rollback notes.

V7-M9 planning position:

- Do not rename environment variables now.
- Do not change sender defaults now.
- Do not alter Resend API behavior now.
- Plan future deployment documentation for verified sender/domain setup and environment-variable configuration.

## Future Implementation Candidates

These are candidates for V8 or later production-hardening work. They are not V7-M9 implementation scope.

1. **Email payload hardening**
   - Decide whether plain text emails should embed the full generated report and/or draft in addition to the controlled PDF attachment.
   - If implemented, preserve generated-package, final-review, controlled-PDF, and Send PIN gates.

2. **Legacy email route disposition**
   - Verify whether `/api/send` has any callers, external integrations, tests, or deployment dependencies.
   - Remove it, document it as intentionally retained, or migrate it into the controlled send path.

3. **Dependency stability track**
   - Review Next.js and related package versions.
   - Confirm package-manager and lockfile policy.
   - Run `npm audit` only as part of a controlled security/dependency task with planned remediation.

4. **Persistent backend decision**
   - Choose database/storage architecture for correction records, drafts, history, and audit trails.
   - Define retention, export, authentication, authorization, and migration requirements.

5. **Automated coverage expansion**
   - Add tests for gates, Send PIN, generated package creation, correction record validation, `/api/send-correction`, and `/api/send` if retained.

6. **Production Resend readiness**
   - Document verified domain/sender setup.
   - Document required environment variables and deployment checklist.
   - Consider sender/from fallback policy only in a dedicated implementation milestone.

## Recommended Track

If this branch is moving toward production use, create a future **V8 or later Production Hardening** track that handles these risks as controlled implementation milestones. That track should keep V6 locked unless a specific approved milestone intentionally replaces a locked behavior with documented tests, migration notes, and rollback expectations.

## V7-M9 Closeout Notes

- V7-M9 produced this planning record only.
- V6 remains locked.
- No runtime behavior changed.
- No API routes changed.
- No dependencies changed.
- No tests changed.
- Production-readiness risks were recorded for future controlled implementation rather than resolved in this milestone.
