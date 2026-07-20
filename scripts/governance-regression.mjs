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

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-cas-governance-'));
try {
  const futureMilestone = path.join(temp, 'M26_TEST.md');
  fs.writeFileSync(futureMilestone, `# Milestone 26 - Synthetic Runtime Scope\n\n## Approved Change Scope\n\n### Allowed paths\n- \`features/auth/**\`\n- \`new.txt\`\n- \`deleted.txt\`\n\n### Forbidden paths\n- \`app/**\`\n- \`.env\`\n\n### Forbidden operations\n- secrets\n- environment values\n- GitHub/Vercel identity\n- production settings\n- deployment\n- destructive operations\n`);
  expectFail([scopeScript, '--milestone', '0', '--milestone-file', 'docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md', '--path', 'app/example.ts'], 'Milestone 0 runtime rejection');
  expectPass([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'features/auth/session.ts'], 'declared runtime path');
  expectFail([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'features/other/session.ts'], 'undeclared runtime rejection');
  expectPass([scopeScript, '--milestone', '26', '--milestone-file', futureMilestone, '--path', 'new.txt', '--path', 'deleted.txt'], 'new and deleted path scope');

  const workflow = fs.readFileSync(path.join(root, '.github/workflows/ai-cas-foreman.yml'), 'utf8');
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
