# 🚀 Configuration GitHub & Deployment Vercel

## Étape 1 : Créer un Token GitHub Personnel

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token (classic)"
3. Nommez-le : `tour-de-controle-deployment`
4. Sélectionnez les permissions :
   - ✅ `repo` (accès complet aux repos)
   - ✅ `workflow` (actions GitHub)
5. Cliquez sur "Generate token"
6. **Copiez le token** (vous ne pourrez plus le voir)

## Étape 2 : Configuration Locale (Windows PowerShell)

### Option A : Créer un repo GitHub vide d'abord

1. Allez sur https://github.com/new
2. Entrez `tour-de-controle-connectivite` comme nom
3. **NE cochez PAS** "Initialize this repository with a README"
4. Cliquez "Create repository"
5. Copiez l'URL du repo (ex: `https://github.com/YOUR_USERNAME/tour-de-controle-connectivite.git`)

### Option B : Déploiement via Script Node.js

Si vous avez créé le repo, utilisez ce script :

```powershell
# Windows PowerShell

# Définir les variables
$env:GITHUB_TOKEN = "votre_token_ici"
$env:GITHUB_OWNER = "votre_username"
$env:GITHUB_REPO = "tour-de-controle-connectivite"

# Aller dans le dossier du projet
cd "c:\Users\ext_diouf006032\OneDrive - Orange Sonatel\Documents\MY DOCUMENT\CLPC\tour-de-controle-connectivite"

# Déployer
node deploy.js
```

### Remplacer :
- `votre_token_ici` → Votre token GitHub (de l'étape 1)
- `votre_username` → Votre nom d'utilisateur GitHub

## Étape 3 : Verification GitHub

1. Allez sur `https://github.com/YOUR_USERNAME/tour-de-controle-connectivite`
2. Vérifiez que tous les fichiers sont présents
3. Le README.md s'affiche automatiquement

## Étape 4 : Configuration Vercel

### 4.1 Créer un compte Vercel
- Allez sur https://vercel.com
- Cliquez sur "Sign Up"
- Connectez-vous avec votre compte GitHub

### 4.2 Créer un nouveau projet

1. Allez sur https://vercel.com/new
2. Cliquez sur "Import Git Repository"
3. Trouvez `tour-de-controle-connectivite` 
4. Cliquez "Import"

### 4.3 Configuration Build

Dans les settings de Vercel :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

### 4.4 Variables d'Environnement (si nécessaire)

Allez dans Settings → Environment Variables (laisser vide pour cette app)

### 4.5 Deploy

1. Cliquez sur "Deploy"
2. Attendez que le build se termine
3. Vous verrez une URL comme : `https://tour-de-controle-connectivite.vercel.app`

## Troubleshooting

### ❌ "Token invalide" 
- ✅ Vérifiez le token GitHub
- ✅ Assurez-vous qu'il n'a pas expiré
- ✅ Vérifiez que vous avez les bonnes permissions

### ❌ "Repo non trouvé"
- ✅ Vérifiez que le repo existe sur GitHub
- ✅ Vérifiez le nom d'utilisateur et repo
- ✅ Le repo doit être public ou vous devez avoir accès

### ❌ "Build failed on Vercel"
- ✅ Vérifiez que `npm run build` fonctionne localement
- ✅ Vérifiez que tous les fichiers sont uploadés
- ✅ Allez dans les logs Vercel pour plus de détails

## ✅ Commandes Rapides

### Déployer vers GitHub
```bash
$env:GITHUB_TOKEN = "ghp_..."
$env:GITHUB_OWNER = "votre_username"
node deploy.js
```

### Vérifier le build
```bash
npm run build
npm run preview
```

### Voir les logs
```bash
npm run dev
```

## 📊 Après le Déploiement

- 🌐 **GitHub** : https://github.com/YOUR_USERNAME/tour-de-controle-connectivite
- 🚀 **Vercel** : https://tour-de-controle-connectivite.vercel.app (une fois déployé)
- 📝 **README** : Visible sur la page GitHub
- 🔗 **Links** : Visibles dans le repo

## 🔄 Workflow Continu

Après la configuration initiale :

1. Faites vos changements localement
2. Committez et pushez vers GitHub
3. Vercel se déploie automatiquement
4. Voir le statut : https://vercel.com/dashboard

## 💡 Notes

- Vercel se connecte automatiquement au repo GitHub
- Chaque push vers `main` déclenche un redeploy
- Les prévisualisations sont disponibles pour les PRs
- Les logs sont accessibles depuis le dashboard Vercel

---

**Besoin d'aide ?**
- GitHub Docs: https://docs.github.com/
- Vercel Docs: https://vercel.com/docs
- Vite Guide: https://vitejs.dev/guide/deployment.html
