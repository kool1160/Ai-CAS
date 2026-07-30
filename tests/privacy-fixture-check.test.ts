import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';

let PROHIBITED_FIXTURE_HASHES: Set<string>;
let scanEntries: (entries: string[], readFile: (relativePath: string) => string) => string[];

describe('privacy fixture checker', () => {
  beforeAll(async () => {
    const source = fs.readFileSync(new URL('../scripts/privacy-fixture-check.mjs', import.meta.url), 'utf8')
      .replace(/^#![^\r\n]*(?:\r?\n|$)/, '');
    const checker = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
    PROHIBITED_FIXTURE_HASHES = checker.PROHIBITED_FIXTURE_HASHES;
    scanEntries = checker.scanEntries;
  });

  const knownProhibitedValue = ['00', '8604'].join('');

  it('rejects a known prohibited legacy identifier', () => {
    const violations = scanEntries(
      ['tests/fixture.txt'],
      () => `Work order ${knownProhibitedValue}`,
    );

    expect(violations).toEqual(['tests/fixture.txt']);
  });

  it('permits clearly synthetic values and reserved example domains', () => {
    const violations = scanEntries(
      ['features/example.ts', 'docs/example.md'],
      () => 'SYNTHETIC-WO-001 DEMO-PART-001 operator@example.invalid',
    );

    expect(violations).toEqual([]);
  });

  it('does not scan generated or ignored directories', () => {
    const violations = scanEntries(
      ['.next/generated.txt', '.ai-cas/selected-milestone.md', 'coverage/report.txt'],
      () => knownProhibitedValue,
    );

    expect(violations).toEqual([]);
  });

  it('uses the supplied tracked-file list and does not inspect untracked paths', () => {
    const readPaths: string[] = [];
    const violations = scanEntries(
      ['tests/tracked-fixture.txt'],
      (relativePath: string) => {
        readPaths.push(relativePath);
        return 'SYNTHETIC-ACCOUNT';
      },
    );

    expect(readPaths).toEqual(['tests/tracked-fixture.txt']);
    expect(violations).toEqual([]);
    expect(PROHIBITED_FIXTURE_HASHES.size).toBeGreaterThan(0);
  });
});
