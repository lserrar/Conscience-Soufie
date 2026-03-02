# Conscience Soufie - Application Mobile

## Description du Projet
Application mobile française pour l'association culturelle Conscience Soufie. L'application sert de hub de contenu pour les membres existants, regroupant le contenu du site web, Zoom, HelloAsso et Calameo.

## Spécifications Techniques
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Backend**: Python, FastAPI
- **Données**: APIs REST (WordPress, Zoom, HelloAsso, Calameo, SoundCloud)

## Identité Visuelle
- **Couleur principale**: #1c679f
- **Fond**: Blanc
- **Police**: Cormorant Garamond (titres), Inter (corps)
- **Style**: Premium, Netflix/Airbnb-like

## Architecture des Onglets
1. **Accueil** - Page d'accueil style Netflix
2. **Articles** - Liste des articles WordPress avec filtres
3. **Podcasts** - Podcasts SoundCloud avec hero + liste
4. **Zoom** - Conférences Zoom à venir
5. **À Propos** - WebView de la page présentation

---

## Fonctionnalités Implémentées

### Phase 1 - MVP (Complété)
- [x] Structure 4 onglets de base
- [x] Header avec logo centré, icône profil, icône don
- [x] Intégration HelloAsso (événements)
- [x] Intégration Zoom (webinaires)
- [x] Intégration WordPress (articles)
- [x] Intégration Calameo (revues)
- [x] WebView pour le contenu externe
- [x] Modal profil avec paramètres
- [x] Modal donation avec WebView HelloAsso

### Phase 2 - Enrichissement (Complété - 28/02/2026)
- [x] Nouvel onglet **Podcasts** avec intégration SoundCloud RSS
  - Hero "Dernier épisode" style Netflix
  - Liste verticale de tous les épisodes
  - Badge "NOUVEAU", durée, date de publication
- [x] **Carousels thématiques** sur la page Accueil
  - Soufisme, Rumi, Ibn Arabi, Poésie et samâ'
  - Henri Corbin, Eva de Vitray, Louis Massignon, Michel Chodkiewicz
- [x] **Filtres topics** style Spotify sur la page Articles
  - Filtres scrollables horizontalement
  - Chargement dynamique par tag/catégorie WordPress
- [x] Section "À la une" améliorée sur l'Accueil

### Phase 3 - Lecteur Audio Natif (Complété - 01/03/2026)
- [x] **Lecteur audio natif** avec expo-av
  - AudioContext singleton pour éviter les doubles lectures
  - Support background playback (staysActiveInBackground: true)
  - Gestion InterruptionMode pour iOS et Android
- [x] **MiniPlayer** en bas de page
  - Affiche titre, artwork, progress bar
  - Boutons play/pause, skip previous/next
- [x] **FullPlayer modal** plein écran
  - Artwork grand format
  - Slider de progression seek
  - Contrôles +30s / -30s
  - Sélecteur de vitesse (1x, 1.5x, 2x)
- [x] **Icône de recherche visible** dans le header
  - Modal de recherche fonctionnel
  - Recherche dans les articles WordPress
- [x] **Page À Propos** redesign natif (style New York Times)

---

## APIs Backend

### Endpoints Existants
- `GET /api/` - Racine API
- `GET /api/helloasso/events` - Événements HelloAsso
- `GET /api/helloasso/event/{slug}` - Détails d'un événement
- `POST /api/helloasso/checkout` - Checkout HelloAsso
- `GET /api/zoom/webinars` - Webinaires Zoom
- `GET /api/zoom/webinar/{id}` - Détails webinaire

### Nouveaux Endpoints (Phase 2)
- `GET /api/podcasts` - Podcasts depuis SoundCloud RSS
- `GET /api/articles/by-tag/{tag_slug}` - Articles filtrés par tag

---

## Structure des Fichiers

```
/app
├── backend/
│   ├── server.py              # API FastAPI
│   └── .env                   # Credentials
└── frontend/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── _layout.tsx    # Config 5 onglets
    │   │   ├── index.tsx      # Accueil (Netflix-style)
    │   │   ├── blog.tsx       # Articles (avec filtres)
    │   │   ├── podcasts.tsx   # Podcasts SoundCloud
    │   │   ├── live.tsx       # Zoom
    │   │   └── about.tsx      # À Propos
    │   ├── article.tsx        # WebView articles
    │   ├── magazine.tsx       # WebView Calameo
    │   └── event-detail/      # WebView événements
    ├── components/
    │   ├── Header.tsx         # Header global
    │   └── ProfileModal.tsx   # Modal profil
    └── constants/
        └── theme.ts           # Design system
```

---

## Backlog

### P1 - Prioritaire
- [x] ~~Corriger l'affichage des filtres Articles sur web (étirement vertical)~~
- [x] ~~Implémenter la fonctionnalité de recherche~~

### P2 - Important
- [ ] Compléter les préférences utilisateur dans le profil
- [ ] Notifications push pour les nouveaux contenus

### P3 - Nice to have
- [ ] Mode hors-ligne pour les podcasts
- [ ] Favoris/Bookmarks
- [ ] Migration de expo-av vers expo-audio (avant SDK 54)

---

## Tests
- **Backend**: APIs fonctionnelles (WordPress, HelloAsso, Zoom, SoundCloud RSS)
- **Frontend**: 100% - Tous les bugs critiques corrigés et testés

## Corrections récentes (02/03/2026)

### Réorganisation de la page Accueil + Section YouTube (02/03/2026)
- **Nouvel ordre des sections sur la page Accueil** :
  1. À la une (hero event)
  2. Prochains événements
  3. Derniers articles
  4. **Dernières vidéos** (NOUVEAU - lien vers chaîne YouTube)
  5. Revues Conscience Soufie
  6. Sections thématiques dans l'ordre :
     - Bibliographie
     - Le Prophète Muhammad
     - Ibn 'Arabî
     - Rûmî
     - Hallâj
     - Poésie
     - Hommages
     - Eva de Vitray-Meyerovitch
     - Louis Massignon (renvoie vers articles Hallâj)
     - Henry Corbin
     - Michel Chodkiewicz (renvoie vers articles Ibn 'Arabî)
     - René Guénon
     - Cheikh al-'Alâwî
     - Philosophie
     - Paix
     - Soufisme

- **Section YouTube ajoutée** :
  - Carrousel horizontal style Netflix
  - 3 cartes avec miniatures et bouton play rouge
  - Clic ouvre la chaîne YouTube @ConscienceSoufie
  - Lien "Voir la chaîne" dans le header

- **Bug "Don et adhésion"** : Confirmé fonctionnel sur mobile ✅

### Autres corrections précédentes (02/03/2026)
- **Design lumineux/bleu implémenté** :
  - Header bleu avec logo blanc centré + icône menu à gauche + icône recherche à droite
  - Barre de navigation bleue avec icônes remplies/contour (style Fnac Photo)
  - StatusBar en mode "light" pour texte blanc

- **Onglet Zoom redesigné** : Nouveau style identique à la page d'Accueil
  - Hero banner avec image en mode `contain` (affiche complète visible)
  - Fond gris clair `#f0f4f8` autour des images
  - Informations (date, titre, bouton) affichées en dessous de l'image

- **Système d'authentification implémenté** :
  - Splash screen (3s) avec fond bleu et logo blanc centré
  - Écran de connexion avec email
  - API backend pour vérifier l'adhésion HelloAsso
  - Overlay non-membre sur l'onglet Zoom avec bouton "Devenir adhérent"
  - Stockage du profil utilisateur avec AsyncStorage

## Vérifications en attente
- [x] **Bug "Don et adhésion"** : Confirmé fonctionnel sur mobile ✅
- [ ] **Vérification adhésion HelloAsso** : Tester avec un email adhérent réel
- [ ] **Audio en arrière-plan** : Rebuild natif nécessaire (`npx expo run:ios` ou `eas build`)

## Architecture des fichiers d'authentification
- `/app/frontend/app/index.tsx` - Route racine, redirige vers splash ou tabs
- `/app/frontend/app/splash.tsx` - Écran splash (3 secondes)
- `/app/frontend/app/auth.tsx` - Écran de connexion par email
- `/app/frontend/contexts/UserContext.tsx` - Contexte utilisateur avec isMember
- `/app/backend/server.py` - API `/api/auth/check-membership`

## Dernière mise à jour
2 mars 2026 - Splash screen + Authentification HelloAsso + Design bleu
