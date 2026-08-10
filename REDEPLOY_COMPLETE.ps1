# Script de redéploiement complet du projet sur GitHub
# Usage : .\REDEPLOY_COMPLETE.ps1

Write-Host "
╔═══════════════════════════════════════════════════════╗
║  🚀 REDÉPLOIEMENT COMPLET - TOUR DE CONTRÔLE         ║
╚═══════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "📋 Ce script va :" -ForegroundColor Cyan
Write-Host "  1. Vérifier vos informations GitHub"
Write-Host "  2. Créer un nouveau repo GitHub"
Write-Host "  3. Configurer Git localement"
Write-Host "  4. Pousser tous les fichiers"
Write-Host "  5. Vérifier le déploiement"
Write-Host ""

# ============================================
# ÉTAPE 1 : Vérifier les infos GitHub
# ============================================

Write-Host "📋 ÉTAPE 1 : Informations GitHub" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

$gitToken = Read-Host "Token GitHub (ghp_...)"
if ([string]::IsNullOrEmpty($gitToken)) {
    Write-Host "❌ Token manquant" -ForegroundColor Red
    exit 1
}

$gitUsername = Read-Host "Nom d'utilisateur GitHub"
if ([string]::IsNullOrEmpty($gitUsername)) {
    Write-Host "❌ Username manquant" -ForegroundColor Red
    exit 1
}

$repoName = Read-Host "Nom du repo [tour-de-controle-connectivite]"
if ([string]::IsNullOrEmpty($repoName)) {
    $repoName = "tour-de-controle-connectivite"
}

Write-Host ""
Write-Host "✅ Infos reçues :" -ForegroundColor Green
Write-Host "   Token : $($gitToken.Substring(0, 10))..."
Write-Host "   Username : $gitUsername"
Write-Host "   Repo : $repoName"
Write-Host ""

# ============================================
# ÉTAPE 2 : Créer/Récréer le repo GitHub
# ============================================

Write-Host "📋 ÉTAPE 2 : Vérification/Création du repo GitHub" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "ℹ️  Vous devez MANUELLEMENT :" -ForegroundColor Cyan
Write-Host "  1. Aller sur https://github.com/new"
Write-Host "  2. Nommer le repo : $repoName"
Write-Host "  3. Cocher : Public"
Write-Host "  4. NE PAS cocher : Initialize this repository"
Write-Host "  5. Cliquer 'Create repository'"
Write-Host "  6. Revenir ici et appuyer sur Entrée"
Write-Host ""

Read-Host "Appuyez sur Entrée quand le repo est créé"

Write-Host ""
Write-Host "✅ Repo créé (supposé)" -ForegroundColor Green

# ============================================
# ÉTAPE 3 : Configuration Git locale
# ============================================

Write-Host ""
Write-Host "📋 ÉTAPE 3 : Configuration Git" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

$projectPath = Get-Location
Write-Host ""
Write-Host "📂 Répertoire du projet : $projectPath" -ForegroundColor Cyan

# Vérifier si .git existe
if (Test-Path ".git") {
    Write-Host ""
    Write-Host "⚠️  .git existe déjà" -ForegroundColor Yellow
    $removeGit = Read-Host "Supprimer et recommencer ? (y/n)"
    
    if ($removeGit -eq "y" -or $removeGit -eq "Y") {
        Write-Host "   Suppression de .git..." -ForegroundColor Yellow
        Remove-Item -Path ".git" -Recurse -Force
        Write-Host "   ✅ Supprimé" -ForegroundColor Green
    } else {
        Write-Host "   Utilisation du repo existant" -ForegroundColor Green
    }
}

# Initialiser Git
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "🔧 Initialisation de Git..." -ForegroundColor Cyan
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git init échoué" -ForegroundColor Red
        Write-Host "   Assurez-vous que Git est installé" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Git initialisé" -ForegroundColor Green
}

# Configurer l'utilisateur Git
Write-Host ""
Write-Host "⚙️  Configuration de l'utilisateur Git..." -ForegroundColor Cyan
git config user.name "$gitUsername"
git config user.email "$gitUsername@example.com"
Write-Host "✅ Utilisateur configuré" -ForegroundColor Green

# ============================================
# ÉTAPE 4 : Ajouter les fichiers et committer
# ============================================

Write-Host ""
Write-Host "📋 ÉTAPE 4 : Ajout et commit des fichiers" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "📝 Ajout de tous les fichiers..." -ForegroundColor Cyan
git add .

# Vérifier qu'il y a des changements
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "⚠️  Aucun fichier à committer" -ForegroundColor Yellow
} else {
    Write-Host "✅ Fichiers ajoutés :" -ForegroundColor Green
    $status | ForEach-Object { Write-Host "   $_" }
    
    Write-Host ""
    Write-Host "💾 Création du commit..." -ForegroundColor Cyan
    git commit -m "Initial commit: Tour de Contrôle Connectivité v1.0.0

- Complete React + Vite application
- All dependencies installed (170+ packages)
- Recharts v2.14.0 (updated)
- Vercel configuration optimized
- Complete documentation
- Ready for production"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit créé" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
        exit 1
    }
}

# ============================================
# ÉTAPE 5 : Configurer le remote
# ============================================

Write-Host ""
Write-Host "📋 ÉTAPE 5 : Configuration du remote GitHub" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$repoUrl = "https://github.com/$gitUsername/$repoName.git"
Write-Host ""
Write-Host "🔗 URL du repo : $repoUrl" -ForegroundColor Cyan

# Supprimer le remote s'il existe
git remote remove origin -ErrorAction SilentlyContinue

# Ajouter le remote
Write-Host "⚙️  Configuration du remote..." -ForegroundColor Cyan
git remote add origin $repoUrl
Write-Host "✅ Remote configuré" -ForegroundColor Green

# ============================================
# ÉTAPE 6 : Push vers GitHub
# ============================================

Write-Host ""
Write-Host "📋 ÉTAPE 6 : Push vers GitHub" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "🚀 Push en cours..." -ForegroundColor Cyan

# Créer/renommer la branche main
git branch -M main

# Push
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✨ PUSH RÉUSSI !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Résultats :" -ForegroundColor Cyan
    Write-Host "   GitHub : https://github.com/$gitUsername/$repoName"
    Write-Host "   Branch : main"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "   Vérifiez :" -ForegroundColor Yellow
    Write-Host "   - Le token est valide"
    Write-Host "   - Le repo existe"
    Write-Host "   - Vous avez accès à ce repo"
    Write-Host ""
    exit 1
}

# ============================================
# ÉTAPE 7 : Vérification
# ============================================

Write-Host ""
Write-Host "📋 ÉTAPE 7 : Vérification" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Fichiers pushés :" -ForegroundColor Green
git log --oneline -1

Write-Host ""
Write-Host "✅ Remote configuré :" -ForegroundColor Green
git remote -v

Write-Host ""
Write-Host "✅ Status :" -ForegroundColor Green
git status

# ============================================
# RÉSUMÉ FINAL
# ============================================

Write-Host ""
Write-Host "
╔═══════════════════════════════════════════════════════╗
║  ✅ REDÉPLOIEMENT RÉUSSI !                           ║
╚═══════════════════════════════════════════════════════╝

📍 LIENS :
  GitHub  : https://github.com/$gitUsername/$repoName
  Code    : Tous les fichiers
  Docs    : README.md, CHANGELOG.md, etc.

🔄 WORKFLOW FUTUR :
  git add .
  git commit -m \"feature: description\"
  git push origin main

🚀 PROCHAINES ÉTAPES :
  1. Aller sur Vercel : https://vercel.com/new
  2. Importer ce repo GitHub
  3. Cliquer 'Deploy'
  4. Attendre 2-3 minutes
  5. Votre app est en ligne !

✨ Projet redéployé avec succès ! 🎉
" -ForegroundColor Green
