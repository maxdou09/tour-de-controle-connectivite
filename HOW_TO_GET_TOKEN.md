# 🔑 Comment Obtenir Votre Token GitHub

## Étapes Visuelles

### Étape 1 : Aller sur la page des tokens

```
🔗 https://github.com/settings/tokens/new
```

### Étape 2 : Remplir les champs

```
┌─────────────────────────────────────────┐
│ Token name:                             │
│ [tour-de-controle-deployment         ] │
│                                         │
│ Expiration:                             │
│ [90 days ▼                           ] │
│                                         │
│ Scopes:                                 │
│ ☑ repo                                  │
│   └─ Full control of private repos      │
└─────────────────────────────────────────┘
```

### Étape 3 : Générer

```
[Generate token]
```

### Étape 4 : Copier le Token

```
┌──────────────────────────────────────────────────┐
│ ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p            │
│                                                  │
│ [Copy to clipboard ← Cliquez ici !]             │
└──────────────────────────────────────────────────┘
```

⚠️ **IMPORTANT** : Vous ne verrez plus ce token !  
Gardez-le quelque part si vous en avez besoin plus tard.

---

## Comment l'Utiliser

### Avec le Script Auto-Deploy

```powershell
# Windows PowerShell
$env:GITHUB_TOKEN = "ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p"
node auto-deploy.js
```

```bash
# Linux/Mac
export GITHUB_TOKEN="ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p"
node auto-deploy.js
```

---

## Sécurité

✅ **À FAIRE** :
- Utilisez le token une fois
- Révoquez-le après si vous ne l'utilisez plus
- Ne le partagez jamais publiquement

❌ **À NE PAS FAIRE** :
- Ne le mettez pas en code
- Ne l'envoyez pas par email (sauf en privé)
- Ne le postez pas sur les réseaux

---

## Révoquer un Token

Si vous avez besoin de révoquer le token plus tard :

1. Allez sur https://github.com/settings/tokens
2. Trouvez "tour-de-controle-deployment"
3. Cliquez sur les 3 points "..."
4. Cliquez "Delete"

---

## Exemple Complet

```
1. Allez sur https://github.com/settings/tokens/new
   ✅

2. Nommez : tour-de-controle-deployment
   ✅

3. Cochez repo
   ✅

4. Cliquez Generate token
   ✅

5. Voyez : ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ✅

6. Copiez-le
   ✅

7. Exécutez :
   $env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   node auto-deploy.js
   ✅

8. C'est fini !
   ✅
```

---

## Problèmes ?

### "Je ne vois pas le token généré"
→ Vous avez peut-être fermé la page. Générez-en un nouveau.

### "Le token ne fonctionne pas"
→ Assurez-vous d'avoir la bonne portée (✅ repo)

### "Comment le stocker de manière sécurisée ?"
→ N'utilisez que pour ce redéploiement (une seule fois)

---

**Vous avez le token ? Exécutez maintenant :**

```powershell
node auto-deploy.js YOUR_TOKEN
```

Ou via variable d'environnement :

```powershell
$env:GITHUB_TOKEN = "votre_token"
node auto-deploy.js
```

**C'est tout ! 🚀**
