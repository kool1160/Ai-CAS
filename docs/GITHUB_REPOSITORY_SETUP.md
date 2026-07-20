# GitHub Repository Setup Prerequisites

This document records external GitHub settings that repository files cannot
prove or configure automatically.

## Current state

As of the Milestone 0 review, `main` is currently unprotected. The GitHub API
must be checked independently before Foreman publishing is considered
production-ready. No governance file may claim that protection exists without
that verification.

Milestone 0 automation does not configure branch protection automatically.
The `repository_protections_verified` workflow input is an operator
attestation only; it is not proof of the GitHub settings.

## Required settings before publishing

Repository administrators must manually verify that the `main` branch:

- require pull requests before merging;
- requires the AI-CAS CI status checks to pass;
- blocks force pushes;
- blocks branch deletion;
- prevents direct pushes to `main`;
- requires conversation resolution where GitHub supports it;
- has the recommended human approval requirements configured.

The publishing environment must be named `ai-cas-publish-approval` and must
have required reviewers configured. It must not contain production
credentials. The publishing job should retain only `contents: write` and
`pull-requests: write` permissions and must never receive application,
OpenAI, Resend, Supabase, or Vercel production credentials.

The Foreman execution credential is separate from publishing:
`AI_CAS_FOREMAN_OPENAI_API_KEY` must be dedicated to Foreman execution, use
separate spending limits and rotation, and have no access to production data
or systems.

Administrators must verify these settings manually and record the verification
outside the repository before setting the workflow attestation to true. No
workflow input, schema, or repository file independently proves protection.
