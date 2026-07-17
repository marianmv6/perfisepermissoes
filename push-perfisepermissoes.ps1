# Deploy em https://perfisepermissoes.vercel.app
Set-Location $PSScriptRoot
$ErrorActionPreference = "Stop"

$msg = if ($args[0]) { $args[0] } else { "Deploy producao - perfisepermissoes" }

git add .
git status
git commit -m $msg
if ($LASTEXITCODE -ne 0) {
  Write-Host "(Nenhuma alteracao nova para commit)" -ForegroundColor Gray
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Remote 'origin' nao configurado. Exemplo:" -ForegroundColor Yellow
  Write-Host "  git remote add origin https://github.com/marianmv6/perfisepermissoes.git" -ForegroundColor Yellow
  exit 1
}

git push origin main
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Pronto! Versao publicada em:" -ForegroundColor Green
Write-Host "  https://perfisepermissoes.vercel.app" -ForegroundColor Cyan
