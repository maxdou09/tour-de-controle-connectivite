# 🚀 GUIDE REDÉPLOIEMENT COMPLET

## 📋 Vue d'Ensemble

Ce guide vous aidera à redéployer COMPLÈTEMENT le projet sur GitHub après suppression de l'ancien repo.

**Durée** : ~10 minutes  
**Complexité** : Simple (script automatisé)

---

## ⚠️ AVANT DE COMMENCER

### Vous Devez Avoir

- ✅ Token GitHub personnel (Personal Access Token)
- ✅ Nom d'utilisateur GitHub
- ✅ Git installé sur votre système OU la possibilité d'utiliser le script Node.js
- ✅ PowerShell (Windows) OU Terminal (Mac/Linux)

### Token GitHub

1. Allez sur https://github.com/settings/tokens/new
2. Nommez-le : `tour-de-controle-deployment`
3. Cochez : ✅ `repo`
4. Cliquez "Generate token"
5. **Copiez le token** (vous ne le reverrez pas)

---

## 🚀 ÉTAPES DE REDÉPLOIEMENT

### OPTION 1 : Script PowerShell (Windows - ⭐ Recommandé)

#### Étape 1 : Ouvrir PowerShell

```powershell
# En tant qu'administrateur (optionnel mais recommandé)
# Menu Démarrer → PowerShell → Clic droit → Run as Administrator
```

#### Étape 2 : Aller au dossier du projet

```powershell
cd "c:\Users\ext_diouf006032\OneDrive - Orange Sonatel\Documents\MY DOCUMENT\CLPC\tour-de-controle-connectivite"
```

#### Étape 3 : Exécuter le script

```powershell
.\REDEPLOY_COMPLETE.ps1
```

#### Étape 4 : Suivre les instructions

Le script vous demandera :
1. **Token GitHub** → Collez votre token
2. **Username GitHub** → Votre username
3. **Nom du repo** → Appuyez sur Entrée (défaut : tour-de-controle-connectivite)

#### Étape 5 : Créer le repo GitHub

Quand le script vous dit "⚠️ Vous devez MANUELLEMENT :" :
1. Allez sur https://github.com/new
2. Nommez le repo
3. Laissez Public coché
4. NE cochez PAS "Initialize this repository"
5. Cliquez "Create repository"
6. Revenez au PowerShell et appuyez sur Entrée

#### Étape 6 : Attendre la fin

Le script va :
- ✅ Initialiser Git
- ✅ Configurer le remote
- ✅ Ajouter tous les fichiers
- ✅ Créer le commit
- ✅ Pousser vers GitHub
- ✅ Vérifier le déploiement

---

### OPTION 2 : Script Node.js (Toutes plateformes)

#### Étape 1 : Configurer les variables

```bash
# Windows PowerShell
$env:GITHUB_TOKEN = "votre_token_ghp_..."
$env:GITHUB_OWNER = "votre_username"
$env:GITHUB_REPO = "tour-de-controle-connectivite"

# Ou Linux/Mac
export GITHUB_TOKEN="votre_token_ghp_..."
export GITHUB_OWNER="votre_username"
export GITHUB_REPO="tour-de-controle-connectivite"
```

#### Étape 2 : Exécuter le script

```bash
node deploy.js
```

---

### OPTION 3 : Manuellement (Git)

#### Étape 1 : Initialiser Git

```bash
git init
```

#### Étape 2 : Configurer l'utilisateur

```bash
git config user.name "votre_username"
git config user.email "votre_email@example.com"
```

#### Étape 3 : Ajouter les fichiers

```bash
git add .
```

#### Étape 4 : Créer le commit

```bash
git commit -m "Initial commit: Tour de Contrôle v1.0.0"
```

#### Étape 5 : Ajouter le remote

```bash
git remote add origin https://github.com/votre_username/tour-de-controle-connectivite.git
```

#### Étape 6 : Pousser

```bash
git branch -M main
git push -u origin main
```

---

## ✅ APRÈS LE REDÉPLOIEMENT

### Vérifier GitHub

1. Allez sur `https://github.com/votre_username/tour-de-controle-connectivite`
2. Vérifiez que tous les fichiers sont présents :
   - ✅ `src/` folder
   - ✅ `README.md`
   - ✅ `package.json`
   - ✅ `vercel.json`
   - ✅ `.gitignore`
   - ✅ Et tous les autres fichiers

### Vérifier le Commit

```bash
git log --oneline -1
```

Devrait montrer : `Initial commit: Tour de Contrôle v1.0.0`

### Vérifier le Status

```bash
git status
```

Devrait montrer : `On branch main` + `nothing to commit`

---

## 🔄 REDÉPLOYER SUR VERCEL

Une fois GitHub confirmé :

1. Allez sur https://vercel.com/new
2. Cliquez "Import Git Repository"
3. Trouvez `tour-de-controle-connectivite`
4. Cliquez "Import"
5. Dans Settings :
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Cliquez "Deploy"
7. Attendez 2-3 minutes
8. Votre app est en ligne ! 🎉

---

## 🆘 TROUBLESHOOTING

### ❌ "Token invalide"
**Solution** :
1. Vérifiez que le token est correct
2. Générez un nouveau token : https://github.com/settings/tokens
3. Assurez-vous d'avoir copié tout le token

### ❌ "Repository not found"
**Solution** :
1. Vérifiez que le repo existe sur GitHub
2. Vérifiez le nom du repo
3. Vérifiez votre username

### ❌ "Permission denied"
**Solution** :
1. Vérifiez que le token a le scope `repo`
2. Vérifiez que vous avez accès à ce repo
3. Utilisez un nouveau token

### ❌ "Git not found"
**Solution** :
1. Utilisez OPTION 2 (Node.js script)
2. Ou installez Git depuis https://git-scm.com
3. Ou utilisez GitHub Desktop : https://desktop.github.com

### ❌ "Branch protection"
**Solution** :
1. Les règles de branche sont activées sur le repo
2. Utilisez une branche différente :
   ```bash
   git branch -M develop
   git push -u origin develop
   ```

---

## 📊 CHECKLIST

- [ ] Token GitHub créé
- [ ] Token copié
- [ ] Script exécuté (ou commandes manuelles)
- [ ] Repo GitHub créé
- [ ] Fichiers visible sur GitHub
- [ ] Commit visible
- [ ] Branch = main
- [ ] Aucune erreur Git

---

## 🎯 RÉSUMÉ RAPIDE

```powershell
# 1. Ouvrir PowerShell
# 2. cd projet
# 3. .\REDEPLOY_COMPLETE.ps1
# 4. Entrer token et username
# 5. Créer repo GitHub manuellement
# 6. Appuyer Entrée
# 7. C'est fini ! ✨
```

**Temps total** : ~10 minutes

---

## 🔗 RESSOURCES

| Besoin | URL |
|--------|-----|
| Token GitHub | https://github.com/settings/tokens |
| Créer repo | https://github.com/new |
| Vercel Deploy | https://vercel.com/new |
| GitHub Docs | https://docs.github.com |

---

## ✨ Résultat Final

```
GitHub  : https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite
Vercel  : https://tour-de-controle-connectivite.vercel.app (après config)
Status  : ✅ Redéployé et prêt pour production
```

---

**Besoin d'aide ?**  
Consultez `REDEPLOY_COMPLETE.ps1` (script automatisé) ou les sections troubleshooting ci-dessus.

**Vous êtes prêt ! 🚀**
