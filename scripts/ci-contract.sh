#!/usr/bin/env bash
set -euo pipefail

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
  scripts/validate-governance.mjs docs/GITHUB_REPOSITORY_SETUP.md
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
node scripts/validate-governance.mjs --check
bash -n scripts/ci-contract.sh
if command -v powershell.exe >/dev/null 2>&1; then powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1 >/dev/null; else echo 'PowerShell unavailable; PowerShell contract not run.'; fi
git diff --check

if rg -n --glob '.github/workflows/ai-cas-foreman.yml' '^\s+(push|pull_request):|secrets\.OPENAI_API_KEY' .; then
  echo 'Foreman trigger or generic credential boundary violated.' >&2
  exit 1
fi
rg -n '^\s+pull_request:' .github/workflows/ci.yml >/dev/null || { echo 'CI pull_request trigger missing.' >&2; exit 1; }

runtime_files="$( { git diff --name-only; git diff --cached --name-only; } | sort -u | rg '^(app|features|public)/|^package\.json$|^package-lock\.json$|^pnpm-lock\.yaml$|^yarn\.lock$|^bun\.lock' || true )"
[[ -z "$runtime_files" ]] || { echo "Runtime or dependency files changed:\n$runtime_files" >&2; exit 1; }

if rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.next/**' --glob '!.ai-cas/**' '(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{8,}|RESEND_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{8,})' .; then
  echo 'Potential committed secret detected.' >&2
  exit 1
fi

for directory in tests fixtures public/fixtures; do
  if [[ -d "$directory" ]] && rg -n -i '(customer|employer|confidential|proprietary|real work order)' "$directory"; then
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
