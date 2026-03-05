# Guide de Déploiement - Conscience Soufie

## 📱 Lien de test pour l'équipe
```
https://conscience-content.preview.emergentagent.com
```

**Instructions de test :**
1. Ouvrir le lien sur mobile ou desktop
2. Attendre le splash screen (3 secondes)
3. Se connecter avec un email membre HelloAsso (ex: `loubna.serrar@gmail.com`)
4. Tester toutes les fonctionnalités

---

## 🚀 Étapes de Déploiement

### Prérequis
1. **Compte Expo** : Créer un compte sur [expo.dev](https://expo.dev)
2. **EAS CLI** : Installer avec `npm install -g eas-cli`
3. **Connexion Expo** : `eas login`

### Configuration du projet
```bash
cd frontend
eas init
```

### 1. Build iOS (App Store)

```bash
# Build de production
eas build --platform ios --profile production

# Soumettre à l'App Store
eas submit --platform ios
```

**Informations requises pour iOS :**
- Apple ID (email du compte développeur)
- Apple Team ID
- App Store Connect App ID (créer l'app dans App Store Connect d'abord)

### 2. Build Android (Google Play)

```bash
# Build de production (app-bundle)
eas build --platform android --profile production

# Soumettre au Google Play
eas submit --platform android
```

**Informations requises pour Android :**
- Fichier de clé de service Google Play (JSON)
- Créer l'app dans la Google Play Console d'abord

---

## 📋 Checklist avant soumission

### App Store (iOS)
- [ ] Screenshots iPhone 6.5" (1284 x 2778 px)
- [ ] Screenshots iPad 12.9" (2048 x 2732 px)
- [ ] Description de l'app (en français)
- [ ] Mots-clés (soufisme, spiritualité, islam, etc.)
- [ ] Catégorie : Éducation ou Livres
- [ ] URL de support : https://consciencesoufie.com
- [ ] Politique de confidentialité URL

### Google Play (Android)
- [ ] Feature graphic (1024 x 500 px)
- [ ] Screenshots téléphone
- [ ] Description courte (80 caractères max)
- [ ] Description complète
- [ ] Catégorie : Éducation
- [ ] Classification du contenu

---

## 🔧 Configuration Backend pour Production

Le backend doit être déployé séparément. Options recommandées :

### Option 1 : Railway.app (Recommandé)
```bash
# Depuis le dossier backend
railway login
railway init
railway up
```

### Option 2 : Render.com
1. Créer un nouveau Web Service
2. Connecter le repo GitHub
3. Configurer les variables d'environnement

### Variables d'environnement backend requises :
```
HELLOASSO_CLIENT_ID=xxx
HELLOASSO_CLIENT_SECRET=xxx
ZOOM_ACCOUNT_ID=xxx
ZOOM_CLIENT_ID=xxx
ZOOM_CLIENT_SECRET=xxx
```

---

## 📱 Informations de l'application

- **Nom** : Conscience Soufie
- **Bundle ID** : com.consciencesoufie.app
- **Version** : 1.0.0
- **Langues** : Français

---

## ⚠️ Notes importantes

1. **Audio en arrière-plan** : Fonctionnera après le build natif (pas en web preview)
2. **Notifications push** : Nécessite configuration supplémentaire avec Expo Push Notifications
3. **Mise à jour OTA** : Possible avec `eas update` après le premier déploiement

---

## 📞 Support

Pour toute question technique, contactez l'équipe de développement.
