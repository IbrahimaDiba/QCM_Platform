# Guide de Déploiement - QCM App

Ce guide explique comment mettre votre application en ligne gratuitement en utilisant **Vercel** ou **Netlify**. Comme votre application utilise Vite et Supabase, le processus est très rapide.

---

## 🏗️ 1. Prérequis avant le déploiement

Avant de déployer, assurez-vous que votre code est prêt :
1.  **Git** : Votre projet doit être sur un dépôt GitHub (ou GitLab/Bitbucket).
2.  **Variables d'environnement** : Vous aurez besoin de vos clés Supabase (`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`).

---

## 🚀 Option A : Déployer sur Vercel (Recommandé)

Vercel est la plateforme la plus simple pour les applications React/Vite.

### Étapes :
1.  Créez un compte sur [vercel.com](https://vercel.com/) (connectez-vous avec GitHub).
2.  Cliquez sur **"Add New"** > **"Project"**.
3.  Importez votre dépôt GitHub `QCM_APP`.
4.  Dans la configuration du projet :
    *   **Framework Preset** : Sélectionnez `Vite` (détecté automatiquement normalement).
    *   **Build Command** : `npm run build`
    *   **Output Directory** : `dist`
5.  **Variables d'environnement** :
    *   Ouvrez la section "Environment Variables".
    *   Ajoutez `VITE_SUPABASE_URL` avec votre URL Supabase.
    *   Ajoutez `VITE_SUPABASE_ANON_KEY` avec votre clé anonyme.
6.  Cliquez sur **"Deploy"**.
7.  **Important pour Vercel (Routing)** :
    Pour éviter les erreurs 404 lors du rafraîchissement d'une page, assurez-vous que le fichier `vercel.json` est présent à la racine avec :
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

> [!TIP]
> Vercel gérera automatiquement les mises à jour : chaque fois que vous ferez un `git push`, le site sera mis à jour.

---

## 🌐 Option B : Déployer sur Netlify

### Étapes :
1.  Créez un compte sur [netlify.com](https://netlify.com/).
2.  Cliquez sur **"Add new site"** > **"Import an existing project"**.
3.  Connectez votre GitHub et choisissez le dépôt.
4.  Paramètres de build :
    *   **Build command** : `npm run build`
    *   **Publish directory** : `dist`
5.  Cliquez sur **"Site settings"** > **"Environment variables"** pour ajouter vos clés Supabase (`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`).
6.  **Important pour Netlify (Routing)** :
    Créez un fichier `public/_redirects` avec ce contenu pour que le rafraîchissement des pages fonctionne :
    ```text
    /*  /index.html  200
    ```

---

## 🛠️ 2. Configuration Supabase (CORS)

Une fois déployé, vous devez autoriser votre nouveau domaine dans Supabase :
1. Allez dans votre tableau de bord **Supabase**.
2. Allez dans **Authentication** > **URL Configuration**.
3. Dans **Site URL**, mettez l'URL de votre site déployé (ex: `https://mon-qcm.vercel.app`).
4. Dans **Redirect URLs**, ajoutez également cette URL.

---

## ✅ Tester la Build Localement
Avant de pousser sur GitHub, vous pouvez vérifier que tout fonctionne avec :
```bash
npm run build
npm run preview
```
Si l'aperçu fonctionne, votre déploiement réussira à coup sûr !
