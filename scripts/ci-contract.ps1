$ErrorActionPreference = 'Stop'

$hasRg = $null -ne (Get-Command rg -ErrorAction SilentlyContinue)
if (-not $hasRg) { Write-Output 'ripgrep unavailable; using Select-String fallback for governance search checks.' }

function Find-RepoMatches([string]$Pattern) {
  if ($hasRg) {
    return @(rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.next/**' --glob '!.ai-cas/**' $Pattern . 2>$null)
  }
  return @(Get-ChildItem -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\.git([\\/]|$)|node_modules([\\/]|$)|\.next([\\/]|$)|\.ai-cas([\\/]|$)' } | Select-String -Pattern $Pattern)
}

function Find-DirectoryMatches([string]$Pattern, [string]$Directory) {
  if ($hasRg) { return @(rg -n -i $Pattern $Directory 2>$null) }
  return @(Get-ChildItem -LiteralPath $Directory -Recurse -File -Force | Select-String -Pattern $Pattern -CaseSensitive:$false)
}

$requiredFiles = @(
  'AI-CAS_PROJECT_SUMMARY.md', 'AGENTS.md', 'BACKLOG.md', 'DECISIONS.md', 'GLOSSARY.md',
  'docs/PRODUCT_DIRECTION.md', 'docs/PRODUCT_CONSTITUTION.md', 'docs/ARCHITECTURE.md',
  'docs/PRODUCT_TEAM.md', 'docs/LOCAL_CODEX_EXECUTION.md',
  'docs/milestones/M0_GOVERNANCE_FOREMAN_AUTOMATION.md',
  'docs/handoffs/M0_PLANNING_HANDOFF.md',
  '.github/codex/model-default.txt', '.github/codex/prompts/run-milestone.md',
  '.github/codex/schemas/foreman-planning.schema.json',
  '.github/codex/schemas/foreman-result.schema.json',
  '.github/codex/schemas/planning-handoff.schema.json',
  '.github/workflows/ai-cas-foreman.yml', '.github/workflows/ci.yml',
  'scripts/select-milestone.mjs', 'scripts/ci-contract.ps1', 'scripts/ci-contract.sh', '.gitignore',
  'scripts/validate-governance.mjs', 'scripts/validate-scope.mjs', 'scripts/governance-regression.mjs',
  'docs/GITHUB_REPOSITORY_SETUP.md'
)
foreach ($file in $requiredFiles) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing required governance file: $file" }
}

node scripts/select-milestone.mjs --validate | Out-Null
node --check scripts/select-milestone.mjs
node --check scripts/validate-governance.mjs
node --check scripts/validate-scope.mjs
node --check scripts/governance-regression.mjs
node scripts/validate-governance.mjs --check
$milestoneNumber = if ($env:AI_CAS_MILESTONE_NUMBER) { $env:AI_CAS_MILESTONE_NUMBER } else { [regex]::Match((node scripts/select-milestone.mjs --selected), '^Selected Milestone (\d+):', 'Multiline').Groups[1].Value }
if (-not $milestoneNumber) { throw 'Unable to determine the selected milestone.' }
$scopeArgs = @('scripts/validate-scope.mjs', '--milestone', $milestoneNumber)
$scopeContext = $env:AI_CAS_SELECTED_MILESTONE
if ($scopeContext) {
  if (-not (Test-Path -LiteralPath $scopeContext)) { throw "Selected milestone context is missing: $scopeContext" }
  $scopeArgs += @('--context', $scopeContext)
}
node @scopeArgs
node scripts/governance-regression.mjs

if (Get-Command bash -ErrorAction SilentlyContinue) { bash -n scripts/ci-contract.sh } else { Write-Output 'Bash unavailable; Bash syntax check not run.' }
git diff --check

$foreman = Get-Content -LiteralPath '.github/workflows/ai-cas-foreman.yml' -Raw
$ci = Get-Content -LiteralPath '.github/workflows/ci.yml' -Raw
if ($foreman -match '(?m)^\s+(push|pull_request):' -or $foreman -match 'secrets\.OPENAI_API_KEY') { throw 'Foreman trigger or generic credential boundary violated.' }
if ($ci -notmatch '(?m)^\s+pull_request:') { throw 'CI pull_request trigger missing.' }
foreach ($schema in Get-ChildItem -LiteralPath '.github/codex/schemas' -Filter '*.json') {
  $parsed = Get-Content -LiteralPath $schema.FullName -Raw | ConvertFrom-Json
  if ($parsed.type -ne 'object' -or $null -eq $parsed.properties -or $null -eq $parsed.required -or $parsed.required.Count -eq 0) {
    throw "Invalid governance schema contract: $($schema.Name)"
  }
}

$secretPattern = '(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY\s*=\s*[A-Za-z0-9_-]{8,}|RESEND_API_KEY\s*=\s*[A-Za-z0-9_-]{8,})'
$matches = Find-RepoMatches $secretPattern
if ($matches) { throw 'Potential committed secret detected.' }

if ((Test-Path tests) -or (Test-Path fixtures) -or (Test-Path public/fixtures)) {
  foreach ($directory in @('tests', 'fixtures', 'public/fixtures')) {
    if (Test-Path $directory) {
      $sensitive = Find-DirectoryMatches '(customer|employer|confidential|proprietary|real work order)' $directory
      if ($sensitive) { throw "Potential sensitive fixture content detected in $directory." }
    }
  }
}

if ((Test-Path package-lock.json) -or (Test-Path pnpm-lock.yaml) -or (Test-Path yarn.lock) -or (Test-Path bun.lock) -or (Test-Path bun.lockb)) {
  Write-Output 'Dependency lockfile present; application checks may be enabled by a later milestone.'
} else {
  Write-Output 'Application build and test checks unavailable: no dependency lockfile.'
}
Write-Output 'AI-CAS governance contract checks passed.'
