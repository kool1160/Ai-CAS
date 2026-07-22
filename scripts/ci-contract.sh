#!/usr/bin/env bash
set -euo pipefail

if command -v rg >/dev/null 2>&1; then
  scan_repo() { rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.next/**' --glob '!.ai-cas/**' "$1" .; }
  scan_file() { rg -n "$1" "$2"; }
  scan_directory() { rg -n -i "$1" "$2"; }
else
  if ! command -v grep >/dev/null 2>&1; then
    echo 'Neither ripgrep nor grep is available; governance search checks cannot run.' >&2
    exit 1
  fi
  echo 'ripgrep unavailable; using grep fallback for governance search checks.'
  scan_repo() { grep -RInE -I --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.ai-cas "$1" .; }
  scan_file() { grep -nE "$1" "$2"; }
  scan_directory() { grep -RIniE -I "$1" "$2"; }
fi

required_files=(
  AI-CAS_PROJECT_SUMMARY.md AGENTS.md BACKLOG.md DECISIONS.md GLOSSARY.md
  docs/PRODUCT_DIRECTION.md docs/PRODUCT_CONSTITUTION.md docs/ARCHITECTURE.md
  docs/PRODUCT_TEAM.md docs/LOCAL_CODEX_EXECUTION.md
  docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md
  docs/handoffs/M0_PLANNING_HANDOFF.md
  .github/codex/model-default.txt .github/codex/prompts/run-milestone.md
  .github/codex/schemas/foreman-planning.schema.json
  .github/codex/schemas/foreman-result.schema.json
  .github/codex/schemas/planning-handoff.schema.json
  .github/workflows/ai-cas-foreman.yml .github/workflows/ci.yml
  scripts/select-milestone.mjs scripts/ci-contract.ps1 scripts/ci-contract.sh
  scripts/validate-governance.mjs scripts/validate-scope.mjs scripts/governance-regression.mjs
  scripts/privacy-fixture-check.mjs
  docs/handoffs/M1_PLANNING_HANDOFF.md
  docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md
  docs/handoffs/M2_PLANNING_HANDOFF.md
  docs/GITHUB_REPOSITORY_SETUP.md
  .gitignore
)
for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing required governance file: $file" >&2; exit 1; }
done

node - <<'NODE'
const fs = require('node:fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = { test: 'vitest', 'test:run': 'vitest run', typecheck: 'tsc --noEmit' };
for (const [name, command] of Object.entries(requiredScripts)) {
  if (packageJson.scripts?.[name] !== command) throw new Error(`package.json script contract failed: ${name}`);
}
NODE

node scripts/select-milestone.mjs --validate >/dev/null
for schema in .github/codex/schemas/*.json; do node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" "$schema"; done
node - <<'NODE'
const fs = require('node:fs');
for (const name of fs.readdirSync('.github/codex/schemas').filter((value) => value.endsWith('.json'))) {
  const schema = JSON.parse(fs.readFileSync(`.github/codex/schemas/${name}`, 'utf8'));
  if (schema.type !== 'object' || !schema.properties || !Array.isArray(schema.required) || schema.required.length === 0) {
    throw new Error(`Invalid governance schema contract: ${name}`);
  }
}
NODE
node --check scripts/select-milestone.mjs
node --check scripts/validate-governance.mjs
node --check scripts/validate-scope.mjs
node --check scripts/governance-regression.mjs
node --check scripts/privacy-fixture-check.mjs
node scripts/validate-governance.mjs --check
node scripts/validate-governance.mjs --handoff docs/handoffs/M1_PLANNING_HANDOFF.md --milestone 1
node scripts/validate-governance.mjs --handoff docs/handoffs/M2_PLANNING_HANDOFF.md --milestone 2
node - <<'NODE'
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const handoff = fs.readFileSync('docs/handoffs/M2_PLANNING_HANDOFF.md', 'utf8');
const match = handoff.match(/```json\s*([\s\S]*?)\s*```/i);
if (!match) throw new Error('M2 handoff JSON block is missing.');
const listed = JSON.parse(match[1]).files_changed;
const actualSet = new Set(execFileSync('git', ['diff', '--name-only', 'main...HEAD'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean));
const status = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { encoding: 'utf8' }).replace(/\r?\n$/, '');
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const statusPath = line.slice(3);
  if (/^[RC]/.test(line.slice(0, 2)) && statusPath.includes(' -> ')) {
    actualSet.add(statusPath.split(' -> ')[0]);
    actualSet.add(statusPath.split(' -> ')[1]);
  } else {
    actualSet.add(statusPath);
  }
}
const actual = [...actualSet];
if (JSON.stringify([...listed].sort()) !== JSON.stringify([...actual].sort())) throw new Error('M2 handoff files_changed does not match the current or committed main...HEAD change surface.');
NODE
if [[ -n "${AI_CAS_MILESTONE_NUMBER:-}" ]]; then
  milestone_number="$AI_CAS_MILESTONE_NUMBER"
else
  milestone_number="$(node -e "const { execFileSync } = require('node:child_process'); const output = execFileSync(process.execPath, ['scripts/select-milestone.mjs', '--selected'], { encoding: 'utf8' }); const match = output.match(/^Selected Milestone ([0-9]+):/m); if (!match) process.exit(1); process.stdout.write(match[1]);")"
  [[ -n "$milestone_number" ]] || { echo 'Unable to determine the selected milestone.' >&2; exit 1; }
fi
scope_args=(--milestone "$milestone_number")
scope_context="${AI_CAS_SELECTED_MILESTONE:-}"
if [[ -n "$scope_context" ]]; then
  [[ -f "$scope_context" ]] || { echo "Selected milestone context is missing: $scope_context" >&2; exit 1; }
  scope_args+=(--context "$scope_context")
fi
changed_paths=()
status_output="$(git status --porcelain=v1 -uall)"
while IFS= read -r status_line; do
  [[ -z "$status_line" ]] && continue
  status_path="${status_line:3}"
  if [[ "${status_line:0:2}" =~ [RC] ]] && [[ "$status_path" == *' -> '* ]]; then
    changed_paths+=(--path "${status_path%% -> *}" --path "${status_path##* -> }")
  else
    changed_paths+=(--path "$status_path")
  fi
done <<< "$status_output"
if [[ ${#changed_paths[@]} -eq 0 ]]; then
  while IFS= read -r committed_path; do
    [[ -n "$committed_path" ]] && changed_paths+=(--path "$committed_path")
  done < <(git diff --name-only main...HEAD)
fi
scope_args+=("${changed_paths[@]}")
node scripts/validate-scope.mjs "${scope_args[@]}"
node scripts/governance-regression.mjs
node scripts/privacy-fixture-check.mjs
if [[ "$milestone_number" == "2" ]]; then
  node - <<'NODE'
const fs = require('node:fs');
const m2 = fs.readFileSync('docs/milestones/M2_HUMAN_CONFIRMATION_GATE_INTEGRITY.md', 'utf8');
const m3 = fs.readFileSync('docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md', 'utf8');
if (!/^\*\*Status:\*\* In Progress/m.test(m2) || !/^\*\*Selected:\*\* Yes/m.test(m2)) throw new Error('M2 must remain In Progress and selected until human review and merge.');
if (!/^\*\*Status:\*\* Queued/m.test(m3) || !/^\*\*Selected:\*\* No/m.test(m3)) throw new Error('M3 must remain queued and unselected during M2.');
NODE
fi
if [[ -n "${BASH:-}" && -x "${BASH}" ]]; then
  "${BASH}" -n scripts/ci-contract.sh
else
  echo 'Bash executable path unavailable; Bash syntax check not run.'
fi
if command -v powershell.exe >/dev/null 2>&1; then powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1 >/dev/null; else echo 'PowerShell unavailable; PowerShell contract not run.'; fi
git diff --check

if scan_file '^\s+(push|pull_request):|secrets\.OPENAI_API_KEY' '.github/workflows/ai-cas-foreman.yml'; then
  echo 'Foreman trigger or generic credential boundary violated.' >&2
  exit 1
fi
scan_file '^\s+pull_request:' .github/workflows/ci.yml >/dev/null || { echo 'CI pull_request trigger missing.' >&2; exit 1; }

node - <<'NODE'
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8').replace(/\r\n/g, '\n');
const governanceStart = workflow.indexOf('  governance:');
const applicationStart = workflow.indexOf('  application:');
if (governanceStart < 0 || applicationStart < 0 || applicationStart <= governanceStart) throw new Error('Governance and application CI jobs are required.');
const governance = workflow.slice(governanceStart, applicationStart);
const application = workflow.slice(applicationStart);
if (!governance.includes('name: Governance contract checks')) throw new Error('Governance CI job name is missing.');
if (!application.includes('name: Application baseline checks') || !application.includes('runs-on: ubuntu-latest')) throw new Error('Application CI job structure is incomplete.');
if (!application.includes('permissions:\n      contents: read') || !application.includes('persist-credentials: false')) throw new Error('Application CI permissions or checkout boundary is incomplete.');
if (!application.includes('node-version: 22.14.0') || !application.includes('cache: npm') || !application.includes('cache-dependency-path: package-lock.json')) throw new Error('Fixed Node and npm cache contract is incomplete.');
for (const command of ['npm ci', 'npm run test:run', 'npm run typecheck', 'npm run build', 'node scripts/privacy-fixture-check.mjs']) {
  if (!application.includes(`run: ${command}`)) throw new Error(`Application CI command is missing: ${command}`);
}
if (/npm (ci|run (test:run|typecheck|build))/.test(governance)) throw new Error('Application commands must not run in governance CI.');
if (fs.existsSync('app/api/send/route.ts')) throw new Error('Legacy /api/send route must remain absent.');
const handoff = fs.readFileSync('docs/handoffs/M1_PLANNING_HANDOFF.md', 'utf8');
const match = handoff.match(/```json\s*([\s\S]*?)\s*```/i);
if (!match) throw new Error('M1 handoff JSON block is missing.');
const listed = JSON.parse(match[1]).files_changed;
const baseMatch = handoff.match(/^\*\*Base commit:\*\*\s*`([0-9a-f]{40})`/m);
const headMatch = handoff.match(/^\*\*Reviewed head:\*\*\s*`([0-9a-f]{40})`/m);
if (!baseMatch || !headMatch) throw new Error('M1 handoff reviewed range is missing.');
const [, baseCommit] = baseMatch;
const [, reviewedHead] = headMatch;
for (const commit of [baseCommit, reviewedHead]) {
  execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' });
}
const actual = execFileSync('git', ['diff', '--name-only', `${baseCommit}...${reviewedHead}`], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
if (JSON.stringify([...listed].sort()) !== JSON.stringify([...actual].sort())) throw new Error('M1 handoff files_changed does not match its reviewed commit range.');
NODE

if scan_repo '(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{8,}|RESEND_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{8,})'; then
  echo 'Potential committed secret detected.' >&2
  exit 1
fi

for directory in tests fixtures public/fixtures; do
  if [[ -d "$directory" ]] && scan_directory '(customer|employer|confidential|proprietary|real work order)' "$directory"; then
    echo "Potential real or sensitive fixture content detected in $directory." >&2
    exit 1
  fi
done

if [[ -f package-lock.json || -f pnpm-lock.yaml || -f yarn.lock || -f bun.lock || -f bun.lockb ]]; then
  echo 'Dependency lockfile present; CI application test, typecheck, and build checks are enabled.'
else
  echo 'Application build and test checks unavailable: no dependency lockfile.'
fi
echo 'AI-CAS governance contract checks passed.'
