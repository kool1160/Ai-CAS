#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

function fail(message) {
  console.error(`AI-CAS scope validation error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const result = { milestone: '', milestoneFile: '', context: '', paths: [], print: false };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === '--print') { result.print = true; continue; }
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) fail(`invalid argument near ${key ?? '<end>'}`);
    if (key === '--milestone') result.milestone = value;
    else if (key === '--milestone-file') result.milestoneFile = value;
    else if (key === '--context') result.context = value;
    else if (key === '--path') result.paths.push(value);
    else fail(`unknown option ${key}`);
    index += 1;
  }
  return result;
}

function read(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`missing file: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8').replace(/\r\n/g, '\n');
}

function findMilestoneFile(number) {
  const directory = path.resolve(root, 'docs/milestones');
  const matches = fs.readdirSync(directory).filter((name) => new RegExp(`^M${number}_.+\\.md$`).test(name));
  if (matches.length !== 1) fail(`expected exactly one tracked milestone file for ${number}`);
  return path.join('docs/milestones', matches[0]);
}

function section(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) fail(`missing ${heading}`);
  const end = lines.slice(start + 1).findIndex((line) => /^##\s+/.test(line));
  return lines.slice(start + 1, end < 0 ? lines.length : start + 1 + end).join('\n');
}

function listUnder(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) fail(`missing ${heading}`);
  const values = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^###\s+/.test(lines[index])) break;
    const match = lines[index].match(/^\s*-\s+`?([^`]+?)`?\s*$/);
    if (match) values.push(match[1].trim());
  }
  if (!values.length) fail(`${heading} must contain at least one item`);
  return values;
}

function validatePattern(pattern, label) {
  if (!pattern || pattern.startsWith('/') || pattern.includes('..') || pattern.includes('\\')) fail(`${label} has an unsafe path pattern: ${pattern}`);
  const wildcard = pattern.indexOf('*');
  if (wildcard >= 0 && (!pattern.endsWith('/**') || wildcard !== pattern.length - 2)) fail(`${label} has an unsupported wildcard: ${pattern}`);
  if (pattern === '/**' || pattern === '**') fail(`${label} is too broad: ${pattern}`);
}

function matches(pattern, candidate) {
  return pattern.endsWith('/**') ? candidate === pattern.slice(0, -3) || candidate.startsWith(pattern.slice(0, -2)) : candidate === pattern;
}

function gitStatusPaths() {
  const output = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root, encoding: 'utf8' });
  const paths = [];
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const value = line.slice(3);
    if (/^[RC]/.test(line.slice(0, 2)) && value.includes(' -> ')) paths.push(...value.split(' -> '));
    else paths.push(value);
  }
  const ignored = execFileSync('git', ['status', '--porcelain=v1', '--ignored', '-uall'], { cwd: root, encoding: 'utf8' });
  for (const line of ignored.split(/\r?\n/).filter((value) => value.startsWith('!! '))) {
    const value = line.slice(3);
    if (!value.startsWith('.ai-cas/')) fail(`ignored file outside .ai-cas is present: ${value}`);
  }
  return paths;
}

function loadScope(options) {
  if (!options.milestone || !/^\d+$/.test(options.milestone)) fail('a numeric --milestone is required');
  const milestoneFile = options.milestoneFile || findMilestoneFile(options.milestone);
  const markdown = read(milestoneFile);
  const heading = markdown.match(new RegExp(`^# Milestone ${options.milestone} - (.+)$`, 'm'));
  if (!heading) fail(`milestone file identity does not match ${options.milestone}`);
  const scope = section(markdown, '## Approved Change Scope');
  const allowed = listUnder(scope, '### Allowed paths');
  const forbidden = listUnder(scope, '### Forbidden paths');
  const operations = listUnder(scope, '### Forbidden operations');
  [...allowed, ...forbidden].forEach((pattern) => validatePattern(pattern, 'scope'));
  const requiredOperations = ['secrets', 'environment values', 'GitHub/Vercel identity', 'production settings', 'deployment', 'destructive operations'];
  for (const required of requiredOperations) if (!operations.some((item) => item.toLowerCase().includes(required.toLowerCase()))) fail(`forbidden operation is not declared: ${required}`);
  if (options.context) {
    const context = read(options.context);
    if (!context.includes(`- Number: ${options.milestone}`) || !context.includes('## Authoritative milestone excerpt') || !context.includes('## Approved Change Scope')) fail('generated selected-milestone context does not carry the approved scope');
  }
  return { number: Number(options.milestone), name: heading[1].trim(), milestoneFile, allowed, forbidden, operations };
}

function validatePaths(scope, candidates) {
  for (const raw of candidates) {
    const candidate = raw.replace(/\\/g, '/').replace(/^\.\//, '');
    if (!candidate || candidate.startsWith('.ai-cas/') || /(^|\/)(\.env(?:\..*)?|vercel\.json|\.vercel)(\/|$)/i.test(candidate)) fail(`protected or generated path is not allowed: ${candidate}`);
    if (scope.forbidden.some((pattern) => matches(pattern, candidate))) fail(`path is forbidden by milestone ${scope.number}: ${candidate}`);
    if (!scope.allowed.some((pattern) => matches(pattern, candidate))) fail(`path is outside the selected milestone scope: ${candidate}`);
  }
}

const options = parseArgs(process.argv.slice(2));
const scope = loadScope(options);
const candidates = options.paths.length ? options.paths : gitStatusPaths();
validatePaths(scope, candidates);
if (options.print) console.log(JSON.stringify({ milestone_number: scope.number, milestone_name: scope.name, allowed_paths: scope.allowed, forbidden_paths: scope.forbidden, forbidden_operations: scope.operations }));
else console.log(`Selected milestone scope passed for ${candidates.length} changed path(s).`);
