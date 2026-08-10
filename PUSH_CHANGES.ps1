# Script pour pousser les corrections Vercel

Write-Host "🚀 Poussée des corrections Vercel" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Vérifier que Git est disponible
try {
    & git --version 2>&1 | Out-Null
    $gitAvailable = $true
} catch {
    $gitAvailable = $false
}

if (-not $gitAvailable) {
    Write-Host "⚠️ Git n'est pas disponible sur ce système" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Utilisez plutôt le script deploy.js :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Définissez les variables d'environnement :" -ForegroundColor Yellow
    Write-Host '$env:GITHUB_TOKEN = "votre_token"'
    Write-Host '$env:GITHUB_OWNER = "votre_username"'
    Write-Host ""
    Write-Host "Puis exécutez :" -ForegroundColor Yellow
    Write-Host "node deploy.js"
    Write-Host ""
    exit 1
}

Write-Host "✅ Git trouvé" -ForegroundColor Green
Write-Host ""

# Ajouter les changements
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Cyan
& git add vite.config.js vercel.json .npmrc .vercelignore VERCEL_FIX.md

# Vérifier le statut
$status = & git status --porcelain
if ($status) {
    Write-Host "✅ Fichiers à committer :"
    $status | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
} else {
    Write-Host "ℹ️ Aucun changement à committer" -ForegroundColor Yellow
    exit 0
}

# Committer
Write-Host "💾 Création du commit..." -ForegroundColor Cyan
& git commit -m "fix: optimize Vercel build configuration

- Changed minifier from terser to esbuild (terser not installed)
- Improved code splitting with manual chunks
- Updated vercel.json with npm ci
- Added .npmrc configuration
- Added .vercelignore file
- Build now successful locally and on Vercel"

Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
& git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✨ Push réussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Vercel va redéployer automatiquement" -ForegroundColor Cyan
    Write-Host "   Vérifiez le statut sur : https://vercel.com/dashboard"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    exit $LASTEXITCODE
}
