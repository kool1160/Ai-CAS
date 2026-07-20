#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// Hashes keep removed fixture identifiers out of the checker source while
// retaining a narrow, deterministic denylist for public-data regressions.
export const PROHIBITED_FIXTURE_HASHES = new Set([
  '810d34379cd27883cb227816fedfc6ae3c258fd6f0fd66cd2af6253c36d88d79',
  '400a8f75b75c9322d593feb25603d4919b8fad6d52b703c8a1d61267280ba99f',
  '26e5430352e2002a04f83631e86999ab5bf72a665a3a1132c4d351cfa8ccd21e',
  '97a7c6e958b19242894fed2c01cfa554e4bbc959ae75b38857ce74c24fb91df8',
  '122a45c6b83caf832d5ad5d0abf90b549e59b006948c33179c24f8f866c8e116',
  '182931e9432c1880f5c37935630491266a0b759588a54d6c803d525826d80a26',
]);

const GENERATED_SEGMENTS = new Set(['.git', 'node_modules', '.next', '.ai-cas', 'coverage', 'dist', 'artifacts', 'tmp', 'logs', '.vercel']);
const ACTIVE_ROOT_DOCUMENTS = new Set([
  'AI-CAS_PROJECT_SUMMARY.md',
  'AGENTS.md',
  'BACKLOG.md',
  'DECISIONS.md',
  'GLOSSARY.md',
]);

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hash(value) {
  return crypto.createHash('sha256').update(normalize(value)).digest('hex');
}

function isGenerated(relativePath) {
  return relativePath.split('/').some((segment) => GENERATED_SEGMENTS.has(segment));
}

function isScanTarget(relativePath) {
  const normalizedPath = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalizedPath || isGenerated(normalizedPath)) return false;
  if (ACTIVE_ROOT_DOCUMENTS.has(normalizedPath)) return true;
  return /^(app|features|public|tests|fixtures|docs)\//.test(normalizedPath);
}

function candidatePhrases(content) {
  const words = normalize(content).match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [];
  const phrases = new Set(words);
  for (let size = 2; size <= 3; size += 1) {
    for (let index = 0; index <= words.length - size; index += 1) {
      phrases.add(words.slice(index, index + size).join(' '));
    }
  }
  return phrases;
}

export function isProhibitedText(content, prohibitedHashes = PROHIBITED_FIXTURE_HASHES) {
  return [...candidatePhrases(content)].some((phrase) => prohibitedHashes.has(hash(phrase)));
}

export function scanEntries(entries, readFile, prohibitedHashes = PROHIBITED_FIXTURE_HASHES) {
  const violations = [];
  for (const relativePath of entries.map((entry) => entry.replaceAll('\\', '/'))) {
    if (!isScanTarget(relativePath)) continue;
    const content = readFile(relativePath);
    if (isProhibitedText(content, prohibitedHashes)) violations.push(relativePath);
  }
  return violations;
}

export function scanTrackedFiles() {
  const entries = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  return scanEntries(entries, (relativePath) => fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const violations = scanTrackedFiles();
  if (violations.length) {
    console.error(`Privacy fixture check failed in ${violations.length} tracked file(s):`);
    for (const violation of violations) console.error(`- ${violation}`);
    process.exit(1);
  }
  console.log('Privacy fixture check passed: tracked public surfaces contain no prohibited fixture values.');
}
