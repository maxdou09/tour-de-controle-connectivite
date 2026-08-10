# 🚀 INSTRUCTIONS DE DÉPLOIEMENT - LISEZ D'ABORD

## ⚡ Résumé Ultra-Rapide

1. **Créez un Token GitHub** → Copier-coller
2. **Exécutez** `.\setup-deploy.ps1` → Suivre les instructions
3. **Attendre 1-2 minutes** → C'est fini !
4. **Configurer Vercel** → 3 clics
5. **Attendez** → Votre app est en ligne ✨

---

## 📋 Étape 1 : Token GitHub (2 minutes)

### Sur GitHub :

1. Allez sur : https://github.com/settings/tokens/new

2. Remplissez :
   - **Token name** : `tour-de-controle-deployment`
   - **Expiration** : `90 days`
   - **Scopes** : Cochez ✅ `repo`

3. Cliquez **"Generate token"**

4. **IMMÉDIATEMENT** : Copier le token (vous ne pourrez plus le voir)
   
   Exemple : `ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

---

## 💻 Étape 2 : Exécuter le Script (1 minute)

### Sur Windows PowerShell :

1. **Ouvrez PowerShell** en tant qu'administrateur

2. **Allez au dossier du projet** :
   ```powershell
   cd "c:\Users\ext_diouf006032\OneDrive - Orange Sonatel\Documents\MY DOCUMENT\CLPC\tour-de-controle-connectivite"
   ```

3. **Exécutez** :
   ```powershell
   .\setup-deploy.ps1
   ```

4. **Répondez aux questions** :
   - **Token GitHub** : Coller le token (étape 1)
   - **Nom d'utilisateur GitHub** : Votre username
   - **Nom du repo** : Appuyez sur Entrée (défaut : `tour-de-controle-connectivite`)

5. **Confirmez** : Tapez `y` pour procéder

---

## ✅ Étape 3 : Vérifier GitHub (1 minute)

Allez sur : `https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite`

Vous devriez voir :
- ✅ .gitignore
- ✅ CHANGELOG.md
- ✅ package.json
- ✅ README.md
- ✅ src/ folder
- ✅ Et tous les autres fichiers

---

## 🚀 Étape 4 : Configurer Vercel (2 minutes)

### Sur Vercel.com :

1. Allez sur : https://vercel.com/new

2. Cliquez : **"Import Git Repository"**

3. **Connectez-vous avec GitHub** si demandé

4. Trouvez : `tour-de-controle-connectivite` 

5. Cliquez : **"Import"**

6. **Configuration** (devrait être auto) :
   - Framework : `Vite`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Install Command : `npm install`

7. Cliquez : **"Deploy"**

8. **Attendez** 2-3 minutes...

---

## 🎉 Étape 5 : Vérifier le Déploiement (1 minute)

Vercel vous donnera une URL comme :
- `https://tour-de-controle-connectivite-abc123.vercel.app`
- Ou votre domaine custom

**Cliquez dessus** → Votre app est en ligne ! 🎉

---

## 📊 Vérification Finale

### ✅ Sur GitHub
```
https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite
```
- [ ] Tous les fichiers présents
- [ ] README visible
- [ ] package.json avec recharts@2.14.0

### ✅ Sur Vercel  
```
https://votre-app-url.vercel.app
```
- [ ] Page charge correctement
- [ ] Pas d'erreurs console
- [ ] Graphiques s'affichent
- [ ] HTTPS fonctionne

---

## 🆘 Troubleshooting

### ❌ "Token invalide"
**Solution** :
1. Allez sur https://github.com/settings/tokens
2. Générez un nouveau token
3. Copiez correctement (pas de caractères cachés)

### ❌ "Repo not found"
**Solution** :
1. Le repo doit être public
2. Vérifiez que le nom est correct
3. Vérifiez le username

### ❌ "Build failed"
**Solution** :
1. Testez localement : `npm run build`
2. Regardez les logs Vercel (Dashboard → Logs)
3. Vérifiez que dist/ est créé

### ❌ "Fichiers manquent"
**Solution** :
1. Ré-exécutez : `.\setup-deploy.ps1`
2. Ou manuellement :
   ```powershell
   $env:GITHUB_TOKEN = "votre_token"
   $env:GITHUB_OWNER = "votre_username"
   node deploy.js
   ```

---

## 🔄 Workflow Futur

Une fois configuré :

```bash
# Faites vos changements
npm run dev

# Quand prêt
git add .
git commit -m "feature: description"
git push origin main

# Vercel se déploie automatiquement ✅
```

**C'est tout !** Vercel surveille le repo.

---

## 🎁 Bonus : Domaine Custom

Sur Vercel :
1. Settings → Domains
2. Ajouter votre domaine
3. Suivre les instructions DNS

---

## 📞 Liens Utiles

| Besoin | Lien |
|--------|------|
| GitHub Tokens | https://github.com/settings/tokens |
| Vercel New Project | https://vercel.com/new |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Repo | https://github.com/YOUR_USERNAME/tour-de-controle-connectivite |

---

## ✨ Récapitulatif

| Étape | Temps | Statut |
|-------|-------|--------|
| 1. Token GitHub | 2 min | ⏳ À faire |
| 2. Execute script | 1 min | ⏳ À faire |
| 3. Vérifier GitHub | 1 min | ⏳ À faire |
| 4. Configurer Vercel | 2 min | ⏳ À faire |
| 5. Vérifier déploiement | 1 min | ⏳ À faire |
| **TOTAL** | **7 min** | ⏳ À faire |

---

**Prêt ? Commencez par l'Étape 1 ! 🚀**

Besoin d'aide ? Consultez :
- `SETUP_GITHUB.md` (guide détaillé)
- `DEPLOY_NOW.md` (déploiement manuel)
- `NEXT_STEPS.md` (après déploiement)
