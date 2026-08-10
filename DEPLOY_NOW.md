# 🚀 Déployer vers GitHub & Vercel - MAINTENANT

## Option Rapide (PowerShell Windows)

```powershell
.\setup-deploy.ps1
```

Puis suivez les instructions.

## Option Manuelle (Toutes Plateformes)

### 1. Créer un Token GitHub

1. Allez sur https://github.com/settings/tokens/new
2. Donner les permissions : `repo`, `workflow`
3. Copier le token (ex: `ghp_...`)

### 2. Créer un Repo GitHub

1. Allez sur https://github.com/new
2. Nommez : `tour-de-controle-connectivite`
3. Cliquez "Create repository"

### 3. Déployer depuis PowerShell/Terminal

```bash
# Windows PowerShell
$env:GITHUB_TOKEN = "votre_token_ghp_..."
$env:GITHUB_OWNER = "votre_username"
$env:GITHUB_REPO = "tour-de-controle-connectivite"
node deploy.js

# Ou Linux/Mac
export GITHUB_TOKEN="votre_token_ghp_..."
export GITHUB_OWNER="votre_username"
export GITHUB_REPO="tour-de-controle-connectivite"
node deploy.js
```

### 4. Vérifier GitHub

Allez sur `https://github.com/votre_username/tour-de-controle-connectivite`

Vous devriez voir :
- ✅ Tous les fichiers
- ✅ README.md affiché
- ✅ package.json avec recharts@2.14.0

### 5. Déployer sur Vercel

1. Allez sur https://vercel.com/new
2. Connectez-vous avec GitHub
3. Cliquez "Import Git Repository"
4. Trouvez `tour-de-controle-connectivite`
5. Cliquez "Import"
6. Dans les settings :
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
7. Cliquez "Deploy"

Attendez 2-3 minutes, puis votre app est en ligne !

## 🔗 Liens Finaux

Après le déploiement :

- **GitHub** : https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite
- **Vercel** : https://tour-de-controle-connectivite.vercel.app (ou URL fournie par Vercel)
- **Code Source** : Disponible dans le repo GitHub

## 📊 Vérification

```bash
# Vérifier localement
npm run build    # Doit créer dist/
npm run preview  # Doit afficher l'URL localhost

# Vérifier GitHub
# - Tous les fichiers présents ?
# - README.md visible ?
# - Fichiers à jour ?

# Vérifier Vercel
# - URL accessible ?
# - App charge correctement ?
# - Hot reload fonctionne ?
```

## ⚙️ Configuration Vercel (Automatique)

Le fichier `vercel.json` configure automatiquement :

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

Vercel lira ce fichier et appliquera la bonne configuration.

## 🔄 Déploiement Futur

Une fois configuré:

```bash
# Localement
git add .
git commit -m "feature: ma nouvelle feature"
git push

# Vercel se déploie automatiquement !
```

Pas besoin de faire quoi que ce soit d'autre. Vercel surveille le repo et redéploie automatiquement.

## 📞 Support

### Erreur "Token invalide"
- ✅ Générer un nouveau token sur https://github.com/settings/tokens
- ✅ Assurez-vous que le token n'a pas expiré
- ✅ Vérifiez les permissions (repo, workflow)

### Erreur "Repo not found"
- ✅ Repo doit être public ou vous devez avoir accès
- ✅ Vérifiez le nom du repo
- ✅ Vérifiez le username

### Vercel build fail
- ✅ Testez `npm run build` localement
- ✅ Vérifiez que `dist/` est créé
- ✅ Regardez les logs Vercel (il y a un bouton "Logs")

## ✨ Résumé

```
Local → GitHub (deploy.js) → Vercel (automatique)
```

1. ✅ Exécutez `setup-deploy.ps1`
2. ✅ Entrez vos infos GitHub
3. ✅ Attendez que ça finisse
4. ✅ Allez sur https://github.com/votre_username/tour-de-controle-connectivite
5. ✅ Configurez Vercel
6. ✅ Attendez 2-3 minutes
7. ✅ Votre app est en ligne ! 🎉
