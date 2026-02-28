# Conscience Soufie - Application Mobile

## Résumé
Application mobile React Native/Expo pour l'association Conscience Soufie, célébrant son 10ème anniversaire. L'application permet de consulter les événements, les articles de blog, les conférences en direct (via Zoom) et les informations sur l'association.

## Fonctionnalités

### Header (visible sur tous les écrans)
- Logo Conscience Soufie (blanc sur fond bleu #1c679f)
- Icône recherche 🔍 : ouvre une modal de recherche WordPress
- Icône don ❤️ : ouvre une modal avec lien HelloAsso
- Icône adhésion 🪪 : ouvre une modal avec lien d'adhésion

### Tab 1 - Accueil (Événements)
- Affiche les événements à venir depuis l'API WordPress (mec-events)
- Image, titre, date, heure pour chaque événement
- Bouton "Voir le détail" ouvre l'événement dans le navigateur in-app
- Pull-to-refresh activé

### Tab 2 - Blog
- Affiche les articles récents depuis l'API WordPress (posts)
- Image, titre, date, extrait pour chaque article
- Bouton "Lire la suite" ouvre l'article dans le navigateur in-app
- Pull-to-refresh activé

### Tab 3 - Live
- Connexion à l'API Zoom pour récupérer les webinaires à venir
- Affiche le prochain webinaire avec titre, date, heure, durée
- Cross-référence avec les événements WordPress pour détecter les événements payants
- Badge "Accès libre" (vert) ou "Événement payant" (orange)
- Bouton "Rejoindre en direct" ou "S'inscrire pour participer"

### Tab 4 - À Propos
- Présentation de l'association
- Boutons "Devenir adhérent" et "Nous contacter"
- Lien vers le site web

## APIs Intégrées
- **WordPress REST API** : consciencesoufie.com
  - `/wp-json/wp/v2/mec-events` : événements
  - `/wp-json/wp/v2/posts` : articles de blog
  - `/wp-json/wp/v2/search` : recherche
- **Zoom API** (Server-to-Server OAuth)
  - Récupération des webinaires à venir
  - Gestion automatique du token OAuth

## Design
- Couleur primaire : #1c679f
- Fond : blanc
- Cards : blanc avec ombre subtile
- Police : Sans-serif moderne

## Configuration requise
- Compte Zoom avec webinaires activés
- Credentials Zoom Server-to-Server OAuth (Account ID, Client ID, Client Secret)
- Scopes Zoom requis : webinar:read:list_webinars:admin

## Variables d'environnement Backend
```
ZOOM_ACCOUNT_ID=xxx
ZOOM_CLIENT_ID=xxx
ZOOM_CLIENT_SECRET=xxx
```
