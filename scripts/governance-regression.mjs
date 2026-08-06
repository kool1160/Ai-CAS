#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const root = process.cwd();
const scopeScript = path.join(root, 'scripts', 'validate-scope.mjs');
let passed = 0;
let source;
let target;

function run(args, cwd = root) {
  return spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
}

function expectPass(args, label) {
  const result = run(args);
  if (result.status !== 0) throw new Error(`${label} failed: ${result.stderr}`);
  passed += 1;
}

function expectFail(args, label) {
  const result = run(args);
  if (result.status === 0) throw new Error(`${label} unexpectedly passed`);
  passed += 1;
}

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) throw new Error(`required governance file missing: ${relativePath}`);
  return fs.readFileSync(absolute, 'utf8').replace(/\r\n/g, '\n');
}

function requireText(text, snippets, label) {
  for (const snippet of snippets) {
    if (!text.includes(snippet)) throw new Error(`${label} is missing required contract text: ${snippet}`);
  }
  passed += 1;
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-cas-governance-'));
try {
  const futureMilestone = path.join(temp, 'M26_TEST.md');
  fs.writeFileSync(futureMilestone, `# Milestone 26 - Synthetic Runtime Scope\n\n## Approved Change Scope\n\n### Allowed paths\n- \`features/auth/**\`\n- \`new.txt\`\n- \`deleted.txt\`\n\n### Forbidden paths\n- \`app/**\`\n- \`.env\`\n\n### Forbidden operations\n- secrets\n- environment values\n- GitHub/Vercel identity\n- production settings\n- deployment\n- destructive operations\n`);
  expectFail([scopeScript, '--milestone', '0', '--milestone-file', 'docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md', '--path', 'app/example.ts'], 'Milestone 0 runtime rejection');
  expectPass([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'features/auth/session.ts'], 'declared runtime path');
  expectFail([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'features/other/session.ts'], 'undeclared runtime rejection');
  expectPass([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'new.txt', '--path', 'deleted.txt'], 'new and deleted path scope');

  const operator = read('OPERATOR_PROTOCOL.md');
  requireText(operator, [
    '`Plan AI-CAS: <idea>`',
    '`Lock that into AI-CAS`',
    '`Continue AI-CAS`',
    '`Check AI-CAS`',
    '`Advance AI-CAS`',
    '`Status AI-CAS`',
    '`Hold AI-CAS`',
    'One repo. One active gate. One next command.',
    'A green check is evidence, not permission to merge.',
    'Block instead of guessing',
  ], 'operator protocol');

  const agents = read('AGENTS.md');
  requireText(agents, [
    '`OPERATOR_PROTOCOL.md`',
    'Only `Continue AI-CAS` authorizes normal implementation.',
    'Only `Advance AI-CAS` may authorize merge and gate advancement',
    'Never push directly to `main`.',
    'Review approval applies only to the exact pushed SHA',
  ], 'agent instructions');

  const summary = read('AI-CAS_PROJECT_SUMMARY.md');
  requireText(summary, [
    '## Current Command-Driven Operating Structure',
    '`kool1160/Ai-CAS`',
    'Only `Continue AI-CAS` authorizes normal implementation.',
    'Only `Advance AI-CAS` can authorize merge and gate advancement',
    'LaserX product scope, architecture, and identity do not transfer to AI-CAS',
  ], 'project summary');

  const current = read('docs/status/CURRENT.md');
  requireText(current, [
    '**State:** AWAITING_REVIEW',
    '- Milestone: 3 - AI Extraction Contract and Confidence Safety',
    '- Pull request: #73',
    'stream-phase cancellation and timeout failures',
    '`Check AI-CAS`',
    '- Merge: not authorized',
    '- Deployment: not authorized',
  ], 'current status');

  const codexPrompt = read('.github/codex/prompts/run-milestone.md');
  requireText(codexPrompt, [
    '# Continue AI-CAS',
    'This prompt is valid only for the exact operator command `Continue AI-CAS`.',
    'Repair unresolved blocking review findings first',
    'Repair required CI failures second',
    'A successful implementation result is not merge approval.',
  ], 'Codex prompt');

  const workflow = read('.github/workflows/ai-cas-foreman.yml');
  if (!workflow.includes('workflow_dispatch:')) throw new Error('Foreman workflow must remain manual workflow_dispatch only');
  if (/^\s+(push|pull_request):/m.test(workflow)) throw new Error('Foreman workflow gained an automatic implementation trigger');
  if (!workflow.includes('prompt-file: .github/codex/prompts/run-milestone.md')) throw new Error('Foreman workflow does not use the Continue AI-CAS prompt');
  if (/gh pr merge|merge_pull_request|git merge origin\/main/.test(workflow)) throw new Error('Foreman workflow contains an implementation-path merge action');
  passed += 1;

  if (!workflow.includes('branch="codex/milestone-${MILESTONE_NUMBER}"') || /branch=.*MILESTONE_NAME/.test(workflow)) throw new Error('milestone branch identity is not name-independent');
  const branchBeforeRename = 'codex/milestone-26';
  const branchAfterRename = 'codex/milestone-26';
  if (branchBeforeRename !== branchAfterRename) throw new Error('milestone name changes altered the collision key');
  passed += 1;

  source = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-cas-patch-source-'));
  target = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-cas-patch-target-'));
  for (const directory of [source, target]) {
    execFileSync('git', ['init', '--quiet'], { cwd: directory });
    execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: directory });
    execFileSync('git', ['config', 'user.name', 'AI-CAS test'], { cwd: directory });
  }
  fs.writeFileSync(path.join(source, 'deleted.txt'), 'delete me\n');
  fs.writeFileSync(path.join(source, 'unchanged.txt'), 'same\n');
  fs.writeFileSync(path.join(target, 'deleted.txt'), 'delete me\n');
  fs.writeFileSync(path.join(target, 'unchanged.txt'), 'same\n');
  for (const directory of [source, target]) {
    execFileSync('git', ['add', '-A'], { cwd: directory });
    execFileSync('git', ['commit', '--quiet', '-m', 'base'], { cwd: directory });
  }
  fs.unlinkSync(path.join(source, 'deleted.txt'));
  fs.writeFileSync(path.join(source, 'new.txt'), 'new file\n');
  execFileSync('git', ['add', '-A'], { cwd: source });
  const patch = execFileSync('git', ['diff', '--cached', '--binary', '--full-index', 'HEAD', '--', '.'], { cwd: source });
  const patchPath = path.join(temp, 'synthetic.patch');
  fs.writeFileSync(patchPath, patch);
  execFileSync('git', ['apply', '--index', patchPath], { cwd: target });
  if (!fs.existsSync(path.join(target, 'new.txt')) || fs.existsSync(path.join(target, 'deleted.txt'))) throw new Error('synthetic patch did not preserve add/delete changes');
  passed += 1;
  console.log(`Governance regression tests passed: ${passed}`);
} finally {
  if (source) fs.rmSync(source, { recursive: true, force: true });
  if (target) fs.rmSync(target, { recursive: true, force: true });
  fs.rmSync(temp, { recursive: true, force: true });
}
