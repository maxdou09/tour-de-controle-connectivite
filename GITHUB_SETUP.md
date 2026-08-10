# Guide de Configuration GitHub

## 🚀 Prérequis

- ✅ Git installé et configuré sur votre système
- ✅ Compte GitHub actif
- ✅ Dépendances npm installées localement (`npm install` complété)
- ✅ Serveur Vite vérifié (`npm run dev` fonctionne)

## 📝 Étapes pour Pousser vers GitHub

### 1. Initialiser le dépôt Git (si pas déjà fait)

```bash
cd "c:\Users\ext_diouf006032\OneDrive - Orange Sonatel\Documents\MY DOCUMENT\CLPC\tour-de-controle-connectivite"
git init
```

### 2. Configurer Git (si pas déjà fait)

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### 3. Ajouter tous les fichiers

```bash
git add .
```

### 4. Vérifier ce qui sera committé

```bash
git status
```

**Fichiers attendus** :
- ✅ `.gitignore`
- ✅ `CHANGELOG.md`
- ✅ `GitHub_SETUP.md` (ce fichier)
- ✅ `INSTALLATION_REPORT.md`
- ✅ `README.md`
- ✅ `index.html`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `postcss.config.js`
- ✅ `tailwind.config.js`
- ✅ `vite.config.js`
- ✅ `src/` (tous les fichiers)
- ❌ `node_modules/` (exclu par .gitignore)

### 5. Faire le premier commit

```bash
git commit -m "Initial commit: Tour de Contrôle Connectivité v1.0.0

- Add React + Vite project structure
- Fix recharts deprecation warning (^2.12.7 → ^2.14.0)
- Add comprehensive documentation (README, CHANGELOG)
- Add .gitignore configuration
- All dependencies installed and verified
- Development server tested and working"
```

### 6. Créer un dépôt sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau dépôt (ex: `tour-de-controle-connectivite`)
3. **NE COCHEZ PAS** "Initialize this repository with a README" (on en a déjà un)
4. Cliquez sur "Create repository"

### 7. Ajouter le remote et pousser

```bash
# Ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite.git

# Vérifier le remote
git remote -v

# Créer la branche main si nécessaire
git branch -M main

# Pousser le code
git push -u origin main
```

### Alternative avec SSH (si configuré)

```bash
git remote add origin git@github.com:VOTRE_USERNAME/tour-de-controle-connectivite.git
git push -u origin main
```

## ✅ Vérification Après Push

1. Allez sur votre dépôt GitHub
2. Vérifiez que tous les fichiers sont présents
3. Le README.md s'affiche automatiquement
4. package-lock.json enregistré pour reproductibilité

## 📦 Pour Cloner le Dépôt (Utilisation Ultérieure)

```bash
# Cloner
git clone https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite.git

# Aller dans le dossier
cd tour-de-controle-connectivite

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🔄 Workflow Git Quotidien

### Avant de commiter du nouveau code

```bash
# Voir les changements
git status

# Voir les différences
git diff

# Ajouter les fichiers modifiés
git add nom-du-fichier.js

# Ou ajouter tout
git add .
```

### Faire des commits réguliers

```bash
# Format recommandé : type(scope): description
git commit -m "feat(dashboard): add new KPI cards"
git commit -m "fix(app): fix recharts deprecation"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(ui): improve signal bars styling"
```

### Pousser les changements

```bash
git push origin main
```

### Créer des branches pour les features

```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Faire des changements et commits

# Pousser la branche
git push -u origin feature/nouvelle-fonctionnalite

# Sur GitHub, créer une Pull Request (PR)
```

## 🛡️ Bonnes Pratiques

1. **Commits réguliers** : Committez souvent avec des messages clairs
2. **Messages descriptifs** : Expliquez POURQUOI, pas seulement QUOI
3. **Branches pour features** : N'éditez pas main directement
4. **Pull Requests** : Utilisez-les pour review avant merge
5. **Updates réguliers** : `git pull` avant de commencer à travailler

## 📚 Ressources

- [GitHub Docs](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🆘 Troubleshooting

### Erreur : "fatal: not a git repository"
```bash
git init
```

### Erreur : "fatal: no configured remote repository"
```bash
git remote add origin https://github.com/VOTRE_USERNAME/tour-de-controle-connectivite.git
```

### Erreur d'authentification
- Utiliser des tokens d'accès personnels (PAT) au lieu de mots de passe
- Configurer SSH si préféré

### Problème de certificat SSL
```bash
git config --global http.sslVerify false
```

## ✨ État Actuel

- ✅ Code source compilé et testé
- ✅ Dépendances mises à jour
- ✅ Documentation complète
- ✅ .gitignore configuré
- ✅ Serveur de développement fonctionnel
- ✅ Prêt pour GitHub !
