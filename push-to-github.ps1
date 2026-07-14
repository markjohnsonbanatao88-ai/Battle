$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "Target: https://github.com/markjohnsonbanatao88-ai/battle.git"
git status
git push -u origin main
