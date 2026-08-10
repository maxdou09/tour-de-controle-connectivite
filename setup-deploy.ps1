# Script de configuration pour GitHub & Vercel Deployment
# Usage: .\setup-deploy.ps1

Write-Host "🚀 Configuration GitHub & Vercel Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Ce script va vous aider à:" -ForegroundColor Cyan
Write-Host "1. Configurer votre dépôt GitHub"
Write-Host "2. Déployer votre code"
Write-Host "3. Configurer le déploiement Vercel"
Write-Host ""

# Demander les infos
Write-Host "📋 Informations GitHub" -ForegroundColor Yellow
Write-Host ""

$githubToken = Read-Host "Token GitHub (ghp_...)"
if ([string]::IsNullOrEmpty($githubToken)) {
    Write-Host "❌ Token manquant" -ForegroundColor Red
    exit 1
}

$githubOwner = Read-Host "Nom d'utilisateur GitHub"
if ([string]::IsNullOrEmpty($githubOwner)) {
    Write-Host "❌ Nom d'utilisateur manquant" -ForegroundColor Red
    exit 1
}

$githubRepo = Read-Host "Nom du repo [tour-de-controle-connectivite]"
if ([string]::IsNullOrEmpty($githubRepo)) {
    $githubRepo = "tour-de-controle-connectivite"
}

Write-Host ""
Write-Host "✅ Configuration reçue" -ForegroundColor Green
Write-Host "   Token: $($githubToken.Substring(0, 10))..."
Write-Host "   Owner: $githubOwner"
Write-Host "   Repo: $githubRepo"
Write-Host ""

$proceed = Read-Host "Procéder au déploiement ? (y/n)"
if ($proceed -ne "y" -and $proceed -ne "Y") {
    Write-Host "Annulé" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📤 Déploiement en cours..." -ForegroundColor Cyan
Write-Host ""

# Définir les variables d'environnement
$env:GITHUB_TOKEN = $githubToken
$env:GITHUB_OWNER = $githubOwner
$env:GITHUB_REPO = $githubRepo

# Exécuter le script deploy
node deploy.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✨ Déploiement réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Repo GitHub: https://github.com/$githubOwner/$githubRepo"
    Write-Host "   2. Configurer Vercel: https://vercel.com/new"
    Write-Host "   3. Importer le repo GitHub"
    Write-Host "   4. Cliquer sur Deploy"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    exit $LASTEXITCODE
}
