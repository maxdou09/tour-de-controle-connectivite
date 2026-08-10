# Tour de Contrôle — Connectivité Écoles Sénégal

Plateforme de suivi et gestion de la connectivité Internet dans les écoles du Sénégal.

## 🎯 Objectif

Suivi centralisé de l'installation et de la mise en service de solutions de connectivité (Flybox 4G, 5G, Fibre, VSAT) dans environ 6000 établissements scolaires à travers le Sénégal.

## ✨ Fonctionnalités

- **Vue d'ensemble** : Tableau de bord avec progression vers l'objectif national
- **Gestion des établissements** : Suivi détaillé de chaque école (zone, technologie, statut, dates)
- **Pipeline Kanban** : Visualisation du flux de travail par statut
- **Synchronisation** : Gestion des réunions et échanges de données
- **Rapports** : Export et analyse des données

## 🏗️ Stack Technique

- **Frontend** : React 18 + Vite
- **UI** : Design system personnalisé (mode sombre, design tokens)
- **Charts** : Recharts pour les graphiques
- **Icons** : Lucide React
- **Data** : PapaParse pour CSV + stockage navigateur
- **Styling** : CSS-in-JS + Tailwind Configuration

## 🚀 Installation

```bash
npm install
```

## 📝 Scripts Disponibles

```bash
# Démarrage du serveur de développement
npm run dev

# Build pour la production
npm run build

# Aperçu de la build
npm run preview
```

## 📦 Dépendances Principales

- `react@^18.3.1` - Bibliothèque UI
- `recharts@^2.14.0` - Graphiques
- `lucide-react@^0.383.0` - Icônes
- `papaparse@^5.4.1` - Parsing CSV
- `vite@^5.4.0` - Build tool
- `tailwindcss@^3.4.10` - Utility CSS

## 🔧 Configuration

- **Port** : 5173 (développement)
- **Stockage** : LocalStorage du navigateur
- **Format données** : JSON avec fallback seed data

## 📊 Structure des Données

Chaque établissement suivi contient :
- Identification : ID, nom, adresse, zone, IEF
- Contact : nom, téléphone
- Technologie : type de connectivité
- Timeline : dates d'enregistrement, installation, mise en service
- Statut : phase du déploiement
- Support : équipe responsable

## 🎨 Design

- **Palette** : Theme sombre professional
- **Typographie** : Space Grotesk (display), Inter (body), IBM Plex Mono (code)
- **Composants** : SignalBars signature, Badges, KPI cards
- **Responsive** : Design adaptatif

## 📄 Licence

Projet interne - Orange Sonatel / CLPC

## 👥 Auteurs

Développement CLPC 2025-2026

## 🔗 Ressources

- [Documentation Vite](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Recharts](https://recharts.org/)
