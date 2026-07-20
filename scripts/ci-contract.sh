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
  docs/GITHUB_REPOSITORY_SETUP.md
  .gitignore
)
for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing required governance file: $file" >&2; exit 1; }
done

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
node scripts/validate-governance.mjs --check
if [[ -n "${AI_CAS_MILESTONE_NUMBER:-}" ]]; then
  milestone_number="$AI_CAS_MILESTONE_NUMBER"
else
  milestone_number="$(node scripts/select-milestone.mjs --selected | sed -n 's/^Selected Milestone \([0-9][0-9]*\):.*$/\1/p')"
  [[ -n "$milestone_number" ]] || { echo 'Unable to determine the selected milestone.' >&2; exit 1; }
fi
scope_args=(--milestone "$milestone_number")
scope_context="${AI_CAS_SELECTED_MILESTONE:-}"
if [[ -n "$scope_context" ]]; then
  [[ -f "$scope_context" ]] || { echo "Selected milestone context is missing: $scope_context" >&2; exit 1; }
  scope_args+=(--context "$scope_context")
fi
node scripts/validate-scope.mjs "${scope_args[@]}"
node scripts/governance-regression.mjs
bash -n scripts/ci-contract.sh
if command -v powershell.exe >/dev/null 2>&1; then powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1 >/dev/null; else echo 'PowerShell unavailable; PowerShell contract not run.'; fi
git diff --check

if scan_file '^\s+(push|pull_request):|secrets\.OPENAI_API_KEY' '.github/workflows/ai-cas-foreman.yml'; then
  echo 'Foreman trigger or generic credential boundary violated.' >&2
  exit 1
fi
scan_file '^\s+pull_request:' .github/workflows/ci.yml >/dev/null || { echo 'CI pull_request trigger missing.' >&2; exit 1; }

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
  echo 'Dependency lockfile present; application checks may be enabled by a later milestone.'
else
  echo 'Application build and test checks unavailable: no dependency lockfile.'
fi
echo 'AI-CAS governance contract checks passed.'
