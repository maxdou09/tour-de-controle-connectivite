# Changelog

## [1.0.0] - 2026-08-10

### ✅ Corrections

- **Dépendances** : Mis à jour `recharts` de `^2.12.7` à `^2.14.0` pour corriger l'avertissement de dépendance dépréciée

### 📋 Description

La version 1.0.0 inclut :
- Plateforme complète de suivi de connectivité pour écoles sénégalaises
- Dashboard avec vue d'ensemble et KPIs
- Gestion détaillée des établissements
- Pipeline Kanban pour suivi du flux
- Synchronisation des réunions
- Rapports et export de données
- Design system sombre personnalisé
- Stockage persistant via localStorage

### 🔧 Détails Techniques

- React 18.3.1 + Vite 5.4.0
- Recharts 2.14.0 pour visualisations
- TypeScript (via JSX)
- Tailwind CSS 3.4.10
- Support CSV via PapaParse

### ⚠️ Notes

- Installation npm peut être lente sur certaines connexions (dépendances nombreuses)
- Données de seed pour démonstration (à remplacer par vraies données)
- localStorage utilisé pour persistance (attention aux limitations de taille)
