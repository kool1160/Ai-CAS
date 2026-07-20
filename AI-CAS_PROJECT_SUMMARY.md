# AI-CAS Project Summary

## Product Identity

**Product name:** AI-CAS  
**Full name:** Corrective Action System  
**Parent framework:** Applied Intelligence Framework  
**Core principle:** Standardize to Optimize  
**Product rule:** Simple in front. Powerful underneath.

AI-CAS is a guided corrective-action system for manufacturing and operations. It helps a user capture an issue, extract or confirm source information, describe the problem, organize the correction, generate professional corrective-action documentation, and preserve the record for review and future use.

AI-CAS began as **Refab Connect / AI-WOC**, a work-order correction tool designed around a specific manufacturing environment. It has since evolved into a broader, reusable corrective-action product. Refab Connect and AI-WOC are historical identities. AI-CAS is the active product identity.

---

## Product Purpose

AI-CAS exists to make production problems easier to capture, understand, route, document, review, and correct.

The operator should not need to become a clerk, engineer, or professional report writer. The operator identifies the issue. AI-CAS handles structure, wording, routing logic, evidence organization, and professional output.

The intended result is a corrective-action workflow that is:

- fast enough for real shop-floor use;
- structured enough for engineering and management;
- controlled enough to prevent accidental release or bad information;
- clear enough to preserve evidence and ownership;
- flexible enough to support multiple companies, departments, processes, and correction categories.

---

## Primary Users

AI-CAS is intended for:

- shop-floor operators;
- welders and fabricators;
- supervisors and leads;
- manufacturing and process engineers;
- quality personnel;
- maintenance personnel;
- production coordinators;
- companies that need a simple corrective-action intake and documentation process.

The product must work well on iPad, phone, and desktop, with an emphasis on fast floor-side use.

---

## Core Workflow

Current intended workflow:

1. **Capture Issue**  
   Take a photo, upload a file, or enter the issue manually.

2. **Extract + Confirm**  
   Use AI Vision or manual entry to identify work-order, router, part, process, or issue context. The user confirms the information before it moves forward.

3. **Build Correction**  
   Select the correction type, add issue details, include evidence, and define what needs to change.

4. **Generate Draft**  
   Create the corrective-action report, correction package, and draft language.

5. **Confirm + Save**  
   Review the complete package before saving, sending, releasing, or triggering any future controlled action.

Core safety rule:

> Draft first. Confirm accuracy. Then save, send, or release.

---

## Current Known Capabilities

Based on the current application, repository state, screenshots, deployment state, and project documents, AI-CAS currently includes or is designed around:

- AI-CAS branded home screen;
- guided five-step corrective-action workflow;
- photo capture and file upload;
- OpenAI Vision extraction path;
- manual-entry fallback;
- short issue description and evidence context;
- optional supporting photo evidence;
- corrective-action draft generation;
- saved drafts;
- local history and analytics preview;
- current-user identity;
- lightweight app-access PIN;
- separate setup/admin gate;
- controlled-action philosophy;
- mobile/iPad-first navigation;
- local browser storage for at least some records;
- Vercel production deployment;
- GitHub-connected source repository.

---

## Current Repository and Deployment State

**Local project folder:**  
`C:\Users\kool1\OneDrive-Personal\OneDrive\Documents\GitHub\ai-cas`

**Current GitHub repository:**  
`kool1160/refab-connect-core-reskin`

**Current branch:**  
`main`

**Verified commit during local inspection:**  
`47f5bdbf2e62b62b22f266d7fab0859757e2a71c`

**Current Vercel project:**  
`refab-connect-core-reskin`

**Current production state:**  
The Vercel production deployment was verified as ready and tied to the same main-branch commit during inspection.

**Important identity note:**  
The local folder is already named `ai-cas`, but GitHub and Vercel still use the historical `refab-connect-core-reskin` name. Hosted renaming should happen later as a controlled migration after product governance, build verification, and rollback planning are established.

---

## Historical Evolution

### Original concept

Refab Connect / AI-WOC began as a controlled work-order correction system:

- capture a router or work order;
- extract the source information;
- confirm accuracy;
- identify the correction;
- generate an engineering report and email draft;
- confirm before sending.

### Current product

AI-CAS has expanded beyond a single work-order correction flow into a broader corrective-action system with:

- issue capture;
- evidence handling;
- draft and history management;
- user identity;
- setup controls;
- analytics direction;
- future controlled release actions;
- company and routing configuration direction.

The product should preserve the simplicity of the original workflow while supporting broader corrective-action use.

---

## Existing Beta 1 Operating Structure

The current uploaded Beta 1 structure uses:

- Chat 1 — Planning / Source of Truth;
- Chat 2 — Task Runner / Implementation Support;
- Chat 3 — Testing / QA;
- Codex as the preferred implementation tool.

Its workflow is:

> Plan the work. Pass the work. Verify the work. Lock the work.

This remains a useful discipline, but the project is now ready to evolve from a manual multi-chat workflow into a governed **Foreman + specialist-agent system** similar to FXD.

The old structure should be preserved as historical process documentation, not treated as the permanent final operating model.

---

## Locked Product Principles

AI-CAS must preserve the following:

- simple operator experience;
- capture → confirm → correction context → generate → review;
- final human review gate;
- no automatic sending or external release without confirmation;
- no unnecessary debug interface in production;
- no giant ERP-style expansion;
- no forcing operators to perform excessive clerical work;
- no uncontrolled feature growth;
- no customer or employer data in public tests or public CI;
- no secrets or API keys committed to the repository;
- no production deployment or hosted rename without explicit approval;
- no claim that AI output is correct without confirmation and evidence;
- no redesign of the working shell unless a real product or usability problem requires it.

---

## Product Quality Standard

AI-CAS should be built to a minimum **9/10 product-quality standard**.

Speed is useful only when it does not reduce:

- reliability;
- clarity;
- safety;
- maintainability;
- scalability;
- usability;
- security;
- evidence quality.

The product must not become a stack of patches, duplicate styles, tangled logic, or undocumented decisions.

---

## Development Philosophy

AI-CAS follows the same general operating philosophy used across the Applied Intelligence portfolio:

- understand the real problem first;
- standardize the workflow;
- reduce human error;
- automate repeatable work;
- preserve human judgment at important boundaries;
- keep one clear source of truth;
- use small, reviewable milestones;
- require evidence before calling work complete;
- continually ask whether the current method is still the best safe method available.

Core development principle:

> Do not merely complete the task. Improve the system used to complete the task.

---

## Proposed AI-CAS Foreman and Agent Team

### AI-CAS Foreman

Owns milestone selection, scope control, architecture consistency, specialist coordination, validation orchestration, pull-request integration, and structured handoff.

Required question:

> Have the right product and engineering disciplines challenged this result, and is the evidence strong enough to proceed?

### Corrective Action Workflow Engineer

Owns the end-to-end capture, confirmation, correction, draft, save, and controlled-release workflow.

Required question:

> Can a real user complete the correction correctly without confusion, unnecessary work, or skipped confirmation?

### Manufacturing Operations Engineer

Owns practical floor-side fit, department routing, correction categories, handoffs, and production usability.

Required question:

> Does this solve a real manufacturing problem in a way operators and leadership will actually use?

### AI Extraction Engineer

Owns AI Vision, OCR, structured extraction, confidence handling, fallback behavior, and resistance to invented source data.

Required question:

> Is the extracted information supported by the source, and does uncertainty trigger confirmation or fallback instead of guessing?

### Data and Records Engineer

Owns schemas, drafts, history, ownership, persistence, recovery, migration, and future backend synchronization.

Required question:

> Will this record remain complete, attributable, recoverable, and understandable later?

### Security and Access Engineer

Owns identity, access gates, admin controls, secrets, permissions, session behavior, and controlled actions.

Required question:

> Can an unauthorized, accidental, or confused user perform an action they should not be able to perform?

### UX and Mobile Workflow Engineer

Owns iPad, phone, and desktop usability, speed, clarity, accessibility, error recovery, and visual consistency.

Required question:

> Can the user understand what to do next and complete it quickly in the real environment?

### Validation Engineer

Owns unit, integration, workflow, regression, build, browser, and release evidence.

Required question:

> What evidence proves this works, and what could still make it fail?

### Deployment Engineer

Owns Vercel configuration, environment variables, build behavior, previews, production protection, rollback, and deployment verification.

Required question:

> Can this change be deployed and reversed safely without breaking the live product?

### Product and Commercial Engineer

Owns value proposition, V1 boundaries, marketability, pricing logic, support burden, onboarding, and scale direction.

Required question:

> Does this create enough practical value that a company would adopt and pay for it?

### Privacy and IP Guardian

Owns customer and employer data boundaries, document retention, image handling, public/private separation, licensing, and disclosure safety.

Required question:

> Can this be safely stored, tested, published, deployed, and commercialized?

---

## Proposed Foreman Operating Model

For each milestone:

1. Read the governing documents.
2. Inspect the real repository before making decisions.
3. Select one milestone with clear acceptance criteria.
4. Identify materially affected specialists.
5. Record assumptions, disagreements, risks, and approval boundaries.
6. Implement only the approved scope.
7. Run exact build and test checks.
8. Fix failures caused by the milestone.
9. Review the final diff.
10. Open one reviewable pull request.
11. Produce a structured result card and planning handoff.
12. Stop before merge, production deployment, hosted rename, destructive action, paid service, or sensitive-data boundary unless explicitly approved.

---

## Immediate Project Priorities

### Priority 1 — Establish current source of truth

Create and approve:

- `AI-CAS_PROJECT_SUMMARY.md`;
- `AGENTS.md`;
- `docs/PRODUCT_DIRECTION.md`;
- `docs/PRODUCT_CONSTITUTION.md`;
- `docs/ARCHITECTURE.md`;
- `docs/PRODUCT_TEAM.md`;
- `BACKLOG.md`;
- `DECISIONS.md`;
- `GLOSSARY.md`.

### Priority 2 — Verify current application architecture

Codex should verify:

- framework and runtime structure;
- package and dependency state;
- build commands;
- test coverage;
- OpenAI Vision integration;
- storage model;
- access-control implementation;
- Vercel configuration;
- environment-variable needs;
- current production behavior.

### Priority 3 — Establish Foreman automation

Create:

- selected-milestone record;
- Foreman planning schema;
- Foreman result schema;
- GitHub Actions Foreman workflow;
- CI/build/test workflow;
- structured planning handoff;
- local Codex execution instructions.

### Priority 4 — Identity alignment

After governance and verification:

- remove unintended stale Refab Connect / AI-WOC active branding;
- preserve historical references where useful;
- rename GitHub repository to `ai-cas` or an approved final name;
- rename Vercel project to `ai-cas`;
- verify URLs, remotes, deployments, and rollback.

### Priority 5 — Finish beta readiness

Likely remaining beta work includes:

- company onboarding/setup;
- routing configuration;
- department, operation, and equipment setup;
- beta tester instructions;
- security positioning;
- feedback and bug process;
- final smoke-test checklist;
- beta-ready documentation package;
- persistence, ownership, and recovery verification if not already complete.

---

## Current Risks and Gaps

The following require repository verification before they are treated as final facts:

- exact current beta/version designation;
- whether the live app is static, framework-based, or mixed;
- exact package manager and dependency state;
- exact build command;
- exact automated test coverage;
- exact OpenAI API implementation and secret handling;
- whether local storage is the only active persistence layer;
- whether Supabase or another backend is implemented, partial, or only planned;
- whether authentication is implemented, partial, or only planned;
- current PDF, email, report, and send behavior;
- current routing configuration behavior;
- current Vercel environment variables;
- current production rollback procedure;
- which older planning documents remain authoritative and which are historical.

These unknowns should be resolved by Codex through direct repository inspection and documented evidence.

---

## Stop-and-Ask Boundaries

Explicit approval is required before:

- merging a pull request;
- deploying to production;
- renaming the GitHub repository;
- renaming the Vercel project;
- changing production domains or URLs;
- enabling a paid service;
- adding authentication, billing, or a customer-data backend;
- sending email or performing another external action automatically;
- deleting or migrating production data;
- processing real employer or customer documents in public CI;
- publishing private correction logic, company routing rules, or proprietary data;
- making destructive Git or file-system changes;
- changing the product into a large ERP or unrelated platform.

---

## Recommended Next Action

Use Codex Desktop in the local AI-CAS repository to perform an **audit-only comparison** between the current AI-CAS repository and the proven FXD governance structure.

Codex should verify the uncertain technical facts in this summary, propose the exact governance and Foreman files, and return a controlled implementation plan for:

> **Milestone 0 — Establish AI-CAS Governance and Foreman Automation**

No production code, hosted names, deployment settings, or live environment should change until the audit is reviewed and approved.

---

## Positioning Statement

AI-CAS is a guided corrective-action system built for real manufacturing and operational problems. It keeps the operator experience simple while using AI and controlled workflow logic to structure issues, preserve evidence, improve routing, generate professional documentation, and require human confirmation before important actions.

**Standardize to Optimize.**
