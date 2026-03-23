# Conscience Soufie - Product Requirements Document

## Original Problem Statement
Application mobile et web pour l'association Conscience Soufie. Hub de contenu agrégeant WordPress (articles), SoundCloud (podcasts), YouTube (vidéos), et Calameo (magazines). Navigation à 5 onglets, UX premium "Netflix-like", splash screen, et système d'authentification membres via HelloAsso.

## User's Preferred Language
French

---

## What Currently Exists

### Mobile App (Expo/React Native)
- **Location**: `/app/frontend`
- **Status**: ✅ Publié sur Google Play Store
- Navigation 5 onglets (Accueil, Articles, Podcasts, Zoom, À Propos)
- Authentification membres via HelloAsso
- Lecture audio via `expo-audio`
- Package name: `org.consciencesoufie.app`

### Web App (React/Vite)
- **Location**: `/app/webapp`
- **Status**: ✅ NOUVEAU - Prêt pour déploiement
- Toutes les fonctionnalités de l'app mobile
- Design responsive mobile/desktop
- Build statique prêt pour hébergement OVH

### Backend API (FastAPI)
- **Location**: `/app/backend`
- **Status**: ✅ Fonctionnel
- Endpoints pour WordPress, SoundCloud, YouTube, Zoom, HelloAsso

---

## Completed Work (Session 22 Mars 2026)

### 1. Fix Android Tab Bar
- ✅ Corrigé le problème de la barre d'onglets cachée par la navigation système Android
- ✅ Ajout de `SafeAreaProvider` dans le layout racine
- ✅ Utilisation de `useSafeAreaInsets` avec padding minimum de 48px pour Android

### 2. Webapp React (NOUVEAU)
- ✅ Créé une webapp React complète avec Vite + Tailwind CSS
- ✅ Pages: Accueil, Articles, Podcasts, Vidéos, Magazines, À Propos, Login
- ✅ Lecteur audio intégré pour les podcasts
- ✅ Authentification membres
- ✅ Design responsive
- ✅ Build de production prêt
- ✅ Documentation de déploiement OVH

---

## Code Architecture

```
/app
├── backend/
│   └── server.py               # FastAPI API
├── frontend/                    # Expo Mobile App
│   ├── app/
│   │   ├── (tabs)/_layout.tsx  # Tab navigation avec safe area fix
│   │   └── _layout.tsx         # Root layout avec SafeAreaProvider
│   ├── app.json                # Package: org.consciencesoufie.app
│   └── eas.json
└── webapp/                      # React Web App (NOUVEAU)
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    ├── dist/                    # Build de production
    └── README.md                # Instructions déploiement OVH
```

---

## Key API Endpoints
- `GET /api/youtube/videos`
- `POST /api/auth/check-membership`
- `GET /api/helloasso/membership-form`
- `GET /api/helloasso/events`
- `GET /api/wordpress/posts`
- `GET /api/podcasts`
- `GET /api/zoom/webinars`
- `GET /api/articles/by-tag/{tag}`

---

## Completed Work (Fev 2026)

### Login & Auth (Webapp)
- ✅ Écran de login redesigné pour être identique à l'appli mobile (auth.tsx)
  - Header bleu avec logo, titre "Bienvenue ! Marhaban !" en italique, bouton "Continuer"
- ✅ Non-membres autorisés à se connecter (comme l'appli mobile)
  - `AuthContext.jsx` stocke l'utilisateur quel que soit le statut de membre
  - Expose `isMember` dans le contexte
- ✅ Overlay "Réservé aux adhérents" sur Zoom avec le texte exact de l'appli mobile
  - Texte HelloAsso, bouton "Devenir adhérent" avec icône coeur
- ✅ Suppression du `MemberOnlyRoute` (géré directement dans `Videos.jsx`)
- ✅ Navigation corrigée (onglet Accueil pointe vers `/accueil` au lieu de `/`)

---

## Pending Issues

### P1: Background Audio (Mobile)
- L'audio ne fonctionne pas en arrière-plan sur Expo Go
- **Solution**: Tester sur un build natif APK/AAB

### P2: Apple Developer Account
- En attente d'ouverture du compte développeur Apple pour l'association

---

## Next Steps

1. **Mettre à jour la webapp sur OVH** (git pull + yarn build)

2. **App iOS**
   - Finaliser l'ouverture du compte Apple Developer
   - Soumettre l'app sur l'App Store

---

## 3rd Party Integrations
- Zoom: Server-to-Server OAuth
- HelloAsso: Public API
- WordPress: Public REST API
- SoundCloud: RSS Feed
- YouTube: RSS Feed
- expo-audio: Audio playback
- Calameo: External links

---

## Credentials (Backend .env)
- ZOOM_ACCOUNT_ID
- ZOOM_CLIENT_ID
- ZOOM_CLIENT_SECRET
- HELLOASSO_CLIENT_ID
- HELLOASSO_CLIENT_SECRET
- HELLOASSO_ORG_SLUG
