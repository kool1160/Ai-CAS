import { describe, expect, it } from 'vitest';
import { PROHIBITED_FIXTURE_HASHES, scanEntries } from '../scripts/privacy-fixture-check.mjs';

describe('privacy fixture checker', () => {
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
        return 'SYNTHETIC-CUSTOMER';
      },
    );

    expect(readPaths).toEqual(['tests/tracked-fixture.txt']);
    expect(violations).toEqual([]);
    expect(PROHIBITED_FIXTURE_HASHES.size).toBeGreaterThan(0);
  });
});
