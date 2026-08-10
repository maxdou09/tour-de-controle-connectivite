# ⚡ EXÉCUTEZ CECI - C'EST TOUT !

## 3 Étapes Ultra-Simples

### ✅ ÉTAPE 1 : Créer Token GitHub (1 min)

```
1. Allez sur : https://github.com/settings/tokens/new
2. Nommez : tour-de-controle-deployment
3. Cochez : ✅ repo
4. Cliquez : Generate token
5. COPIEZ LE TOKEN (exemple : ghp_1a2b3c...)
```

### ✅ ÉTAPE 2 : Exécuter la Commande (3 min)

**Windows PowerShell** :
```powershell
$env:GITHUB_TOKEN = "ghp_votre_token_ici"
node auto-deploy.js
```

**Linux/Mac Terminal** :
```bash
export GITHUB_TOKEN="ghp_votre_token_ici"
node auto-deploy.js
```

### ✅ ÉTAPE 3 : Vérifier sur GitHub (30 sec)

```
Allez sur : https://github.com/Maxtra09/tour-de-controle-connectivite
Tous les fichiers doivent être présents ✅
```

---

## 💡 TL;DR

```powershell
# Copier-coller ça après avoir créé le token GitHub
$env:GITHUB_TOKEN = "ghp_votre_token_ici"
node auto-deploy.js
```

**C'est tout ! 🎉**

---

## 🔗 Liens Rapides

- Token GitHub : https://github.com/settings/tokens/new
- Votre Repo : https://github.com/Maxtra09/tour-de-controle-connectivite
- Vercel (après) : https://vercel.com/new

---

**Durée totale : ~5 minutes**
