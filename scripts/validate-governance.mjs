#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`AI-CAS governance validation error: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`Missing file: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

function typeMatches(value, type) {
  if (type === 'null') return value === null;
  if (type === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === type;
}

function validateValue(value, schema, location) {
  if (schema.enum && !schema.enum.some((allowed) => Object.is(allowed, value))) fail(`${location} is not allowed`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) fail(`${location} has the wrong type`);
  }
  if (typeof value === 'string' && schema.minLength !== undefined && value.length < schema.minLength) fail(`${location} is too short`);
  if (Array.isArray(value) && schema.minItems !== undefined && value.length < schema.minItems) fail(`${location} has too few items`);
  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    const properties = schema.properties ?? {};
    for (const required of schema.required ?? []) if (!Object.prototype.hasOwnProperty.call(value, required)) fail(`${location}.${required} is required`);
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!Object.prototype.hasOwnProperty.call(properties, key)) fail(`${location}.${key} is unexpected`);
    }
    for (const [key, childSchema] of Object.entries(properties)) if (Object.prototype.hasOwnProperty.call(value, key)) validateValue(value[key], childSchema, `${location}.${key}`);
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items) value.forEach((item, index) => validateValue(item, schema.items, `${location}[${index}]`));
}

function validateInstance(schemaPath, instance, expectedMilestone) {
  const schema = readJson(schemaPath);
  validateValue(instance, schema, schemaPath);
  if (expectedMilestone !== undefined && instance.milestone_number !== expectedMilestone) fail(`${schemaPath} has unexpected milestone identity`);
}

function handoffJson(markdown) {
  const match = markdown.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!match) fail('Planning handoff has no JSON block');
  try { return JSON.parse(match[1]); } catch (error) { fail(`Planning handoff JSON is invalid: ${error.message}`); }
}

function representativePlanning() {
  return { status: 'planned', milestone_number: 0, milestone_name: 'Establish AI-CAS Governance and Foreman Automation', goal: 'Establish governance.', authority_files: ['AI-CAS_PROJECT_SUMMARY.md'], affected_roles: ['AI-CAS Foreman'], scope_in: ['Governance'], scope_out: ['Runtime code'], acceptance_criteria: ['Checks pass'], assumptions: [], conflicts: [], risks: [], approval_boundaries: ['Publishing'], checks: ['contract'] };
}

function representativeResult() {
  return { status: 'approval_required', milestone_number: 0, milestone_name: 'Establish AI-CAS Governance and Foreman Automation', summary: 'Ready for review.', files_changed: ['AGENTS.md'], application_files_changed: [], tests: ['contract'], validation_results: ['pass'], specialist_reviews: ['Roles reviewed'], assumptions: [], conflicts: [], unresolved_risks: ['External verification required'], approval_required: 'Human approval', merge_allowed: false, deploy_allowed: false, recommended_next_action: 'Review.' };
}

function checkWorkflowPolicy() {
  const foreman = read('.github/workflows/ai-cas-foreman.yml');
  const ci = read('.github/workflows/ci.yml');
  const setup = read('docs/GITHUB_REPOSITORY_SETUP.md');
  if (!/^\s+workflow_dispatch:/m.test(foreman)) fail('Foreman must have workflow_dispatch');
  if (/^\s+(push|pull_request):/m.test(foreman)) fail('Foreman must not have automatic triggers');
  if (!foreman.includes('AI_CAS_FOREMAN_OPENAI_API_KEY')) fail('Dedicated Foreman secret is missing');
  if (/secrets\.OPENAI_API_KEY/.test(foreman)) fail('Generic OPENAI_API_KEY is injected into Foreman');
  if (!foreman.includes('repository_protections_verified') || !foreman.includes('default: false')) fail('Publishing attestation is not false-by-default');
  if (!foreman.includes('environment: ai-cas-publish-approval')) fail('Publishing environment is missing');
  if (!foreman.includes('git ls-remote --exit-code --heads origin "$branch"')) fail('Stable milestone branch collision check is missing');
  if (!foreman.includes('gh pr list --repo "$GITHUB_REPOSITORY" --state open --head "$branch"')) fail('Open milestone PR check is missing');
  if (!foreman.includes('gh pr list --repo "$GITHUB_REPOSITORY" --state all --head "$branch"')) fail('Historical milestone PR check is missing');
  if (!/^\s+pull_request:/m.test(ci)) fail('CI must retain pull_request validation');
  if (!/AI-CAS Foreman implementation workflow is manual `workflow_dispatch` only/.test(read('AGENTS.md'))) fail('Trigger policy is undocumented');
  if (!/main`? is currently unprotected/i.test(setup) || !/require pull requests before merging/i.test(setup)) fail('Branch protection prerequisite is incomplete');
  if (!read('.gitignore').split(/\r?\n/).includes('.ai-cas/')) fail('.ai-cas/ is not ignored');
}

function checkMilestone() {
  const backlog = read('BACKLOG.md');
  if ((backlog.match(/^## Milestone\s+0\s+-\s+.+$/gm) ?? []).length !== 1) fail('Exactly one Milestone 0 heading is required');
  if (!/\*\*Status:\*\*\s+Complete/.test(backlog)) fail('Milestone 0 status is not explicit');
  validateInstance('.github/codex/schemas/planning-handoff.schema.json', handoffJson(read('docs/handoffs/M0_PLANNING_HANDOFF.md')), 0);
}

function checkAll() {
  checkWorkflowPolicy();
  checkMilestone();
  for (const schema of ['foreman-planning.schema.json', 'foreman-result.schema.json', 'planning-handoff.schema.json']) readJson(`.github/codex/schemas/${schema}`);
  validateInstance('.github/codex/schemas/foreman-planning.schema.json', representativePlanning(), 0);
  validateInstance('.github/codex/schemas/foreman-result.schema.json', representativeResult(), 0);
  console.log('AI-CAS governance schema subset and workflow policy checks passed.');
}

const argv = process.argv.slice(2);
const mode = argv[0] ?? '--check';
if (mode === '--check') checkAll();
else if (['--planning', '--result', '--handoff'].includes(mode)) {
  const file = argv[1];
  const index = argv.indexOf('--milestone');
  const expected = index >= 0 ? Number(argv[index + 1]) : undefined;
  if (!file) fail(`${mode} requires a file path`);
  const instance = mode === '--handoff' ? handoffJson(read(file)) : readJson(file);
  const schema = mode === '--planning' ? '.github/codex/schemas/foreman-planning.schema.json' : mode === '--result' ? '.github/codex/schemas/foreman-result.schema.json' : '.github/codex/schemas/planning-handoff.schema.json';
  validateInstance(schema, instance, expected);
  console.log(`${mode} validated against ${schema}.`);
} else fail(`Unknown mode ${mode}`);
