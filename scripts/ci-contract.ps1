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
  'scripts/privacy-fixture-check.mjs', 'docs/handoffs/M1_PLANNING_HANDOFF.md',
  'docs/GITHUB_REPOSITORY_SETUP.md'
)
foreach ($file in $requiredFiles) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing required governance file: $file" }
}

$packageJson = Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json
$requiredScripts = @{
  'test' = 'vitest'
  'test:run' = 'vitest run'
  'typecheck' = 'tsc --noEmit'
}
foreach ($script in $requiredScripts.GetEnumerator()) {
  if ($packageJson.scripts.($script.Key) -ne $script.Value) { throw "package.json script contract failed: $($script.Key)" }
}

node scripts/select-milestone.mjs --validate | Out-Null
node --check scripts/select-milestone.mjs
node --check scripts/validate-governance.mjs
node --check scripts/validate-scope.mjs
node --check scripts/governance-regression.mjs
node --check scripts/privacy-fixture-check.mjs
node scripts/validate-governance.mjs --check
node scripts/validate-governance.mjs --handoff docs/handoffs/M1_PLANNING_HANDOFF.md --milestone 1
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
node scripts/privacy-fixture-check.mjs

$bashCommand = Get-Command bash -ErrorAction SilentlyContinue
if ($bashCommand) {
  & $bashCommand.Source -n scripts/ci-contract.sh
} else {
  $gitBash = @('C:\Program Files\Git\bin\bash.exe', 'C:\Program Files\Git\usr\bin\bash.exe') | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if ($gitBash) { & $gitBash -n scripts/ci-contract.sh } else { Write-Output 'Bash unavailable; Bash syntax check not run.' }
}
git diff --check

$foreman = Get-Content -LiteralPath '.github/workflows/ai-cas-foreman.yml' -Raw
$ci = Get-Content -LiteralPath '.github/workflows/ci.yml' -Raw
if ($foreman -match '(?m)^\s+(push|pull_request):' -or $foreman -match 'secrets\.OPENAI_API_KEY') { throw 'Foreman trigger or generic credential boundary violated.' }
if ($ci -notmatch '(?m)^\s+pull_request:') { throw 'CI pull_request trigger missing.' }
if (-not $ci.Contains('  governance:') -or -not $ci.Contains('  application:')) { throw 'Governance and application CI jobs are required.' }
$governanceStart = $ci.IndexOf('  governance:')
$applicationStart = $ci.IndexOf('  application:')
if ($applicationStart -le $governanceStart) { throw 'Application CI job must follow the governance job.' }
$governance = $ci.Substring($governanceStart, $applicationStart - $governanceStart)
$application = $ci.Substring($applicationStart)
if ($governance -notmatch 'name: Governance contract checks') { throw 'Governance CI job name is missing.' }
if ($application -notmatch 'name: Application baseline checks' -or $application -notmatch 'runs-on: ubuntu-latest') { throw 'Application CI job structure is incomplete.' }
if ($application -notmatch 'permissions:\s*contents: read' -or $application -notmatch 'persist-credentials: false') { throw 'Application CI permissions or checkout boundary is incomplete.' }
foreach ($required in @('node-version: 22.14.0', 'cache: npm', 'cache-dependency-path: package-lock.json', 'run: npm ci', 'run: npm run test:run', 'run: npm run typecheck', 'run: npm run build', 'run: node scripts/privacy-fixture-check.mjs')) {
  if ($application -notmatch [regex]::Escape($required)) { throw "Application CI command or setting is missing: $required" }
}
if ($governance -match 'npm (ci|run (test:run|typecheck|build))') { throw 'Application commands must not run in governance CI.' }
if (Test-Path -LiteralPath 'app/api/send/route.ts') { throw 'Legacy /api/send route must remain absent.' }
& node -e @'
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const handoff = fs.readFileSync('docs/handoffs/M1_PLANNING_HANDOFF.md', 'utf8');
const match = handoff.match(/```json\s*([\s\S]*?)\s*```/i);
if (!match) throw new Error('M1 handoff JSON block is missing.');
const listed = JSON.parse(match[1]).files_changed;
let baseRef;
for (const candidate of ['main', 'origin/main']) {
  try { execFileSync('git', ['rev-parse', '--verify', candidate], { stdio: 'ignore' }); baseRef = candidate; break; } catch {}
}
if (!baseRef) throw new Error('No main or origin/main ref is available for handoff reconciliation.');
const actual = execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
if (JSON.stringify([...listed].sort()) !== JSON.stringify([...actual].sort())) throw new Error('M1 handoff files_changed does not match main...HEAD.');
'@
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
  Write-Output 'Dependency lockfile present; CI application test, typecheck, and build checks are enabled.'
} else {
  Write-Output 'Application build and test checks unavailable: no dependency lockfile.'
}
Write-Output 'AI-CAS governance contract checks passed.'
