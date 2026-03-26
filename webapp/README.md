# Webapp Conscience Soufie

Application web React pour l'association Conscience Soufie.

## Fonctionnalités

- ✅ **Accueil** avec événements à la une, podcasts, vidéos et magazines
- ✅ **Articles** depuis WordPress avec recherche
- ✅ **Podcasts** avec lecteur audio intégré
- ✅ **Vidéos & Événements** (YouTube, Zoom, HelloAsso)
- ✅ **Magazines** Calameo
- ✅ **À Propos** de l'association
- ✅ **Authentification membres** via HelloAsso
- ✅ Design responsive (mobile/desktop)

## Technologies

- React 18 + Vite
- Tailwind CSS
- React Router
- Axios pour les appels API

## Installation locale

```bash
cd webapp
yarn install
yarn dev
```

## Build de production

```bash
yarn build
```

Les fichiers statiques seront générés dans le dossier `dist/`.

---

## Déploiement sur OVH

### Option 1 : Hébergement mutualisé OVH

1. **Connectez-vous** à votre espace client OVH

2. **Accédez** à l'hébergement web de votre domaine

3. **Téléchargez le contenu du dossier `dist/`** vers le répertoire `www/` via FTP :
   - Hôte FTP : `ftp.votre-domaine.com`
   - Utilisateur : voir dans l'espace client OVH
   - Mot de passe : voir dans l'espace client OVH

4. **Créez un fichier `.htaccess`** dans le dossier `www/` pour gérer le routage SPA :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

5. **Configurez l'API** :
   - Modifiez le fichier `webapp/.env` avant le build :
   ```
   VITE_API_URL=https://votre-api.com
   ```
   - Ou utilisez l'URL actuelle de l'API Emergent

### Option 2 : VPS OVH

1. **Installez Node.js** sur votre VPS
2. **Installez un serveur web** (Nginx ou Apache)
3. **Copiez les fichiers** du dossier `dist/` vers `/var/www/votre-site`
4. **Configurez Nginx** :

```nginx
server {
    listen 80;
    server_name app.consciencesoufie.com;
    root /var/www/votre-site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gestion du cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

5. **Activez HTTPS** avec Let's Encrypt :
```bash
sudo certbot --nginx -d app.consciencesoufie.com
```

---

## Configuration API

L'application utilise l'API backend qui doit être déployée séparément.

**URL de l'API actuelle** : `https://conscience-preview-2.preview.emergentagent.com`

Pour utiliser votre propre API :
1. Déployez le backend FastAPI
2. Modifiez `webapp/.env` :
   ```
   VITE_API_URL=https://votre-api.com
   ```
3. Reconstruisez : `yarn build`

---

## Structure du projet

```
webapp/
├── src/
│   ├── components/     # Composants réutilisables
│   │   ├── Layout.jsx  # Layout principal avec header/footer
│   │   └── AudioPlayer.jsx
│   ├── context/        # Contextes React
│   │   ├── AuthContext.jsx
│   │   └── AudioContext.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── Home.jsx
│   │   ├── Articles.jsx
│   │   ├── ArticleDetail.jsx
│   │   ├── Podcasts.jsx
│   │   ├── Videos.jsx
│   │   ├── Magazines.jsx
│   │   ├── About.jsx
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── dist/               # Build de production
├── .env                # Variables d'environnement
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Support

Pour toute question, contactez l'équipe de développement.
