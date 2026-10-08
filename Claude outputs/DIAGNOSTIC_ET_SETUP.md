# 🔴 Diagnostic : Error loading map — Failed to fetch

## **Problèmes identifiés**

### **1. Backend PHP non configuré**
- ❌ Fichier `backend/config.php` **MANQUANT**
- Le backend attend une configuration MySQL qui n'existe pas
- Sans cela, tous les appels API retournent une erreur 500

### **2. Environnement frontend mal configuré**
- ❌ `.env.local` a `NEXT_PUBLIC_API_URL=https://ton-domaine.org/api` (placeholder)
- Cette URL n'existe pas en développement local
- Par défaut, le code utilise `/api` (relatif) — mais le backend n'est pas accessible là

### **3. Architecture de développement local**
```
Pour que ça fonctionne localement, tu as 3 options:

┌─── OPTION 1: PHP intégré (le plus simple) ───┐
│ Frontend (Next.js)      Backend (PHP intégré)
│ :3000        -------->   :8000
│ (fetch /api) │ proxy      (PHP -S)
└────────────────────────────────────────────────┘

┌─── OPTION 2: Apache/Nginx + cPanel local ────┐
│ Déployer le projet en local comme en prod
│ Mais c'est complexe et lent à configurer
└───────────────────────────────────────────────┘

┌─── OPTION 3: Utiliser Supabase (ancienne setup) ┐
│ Pas recommandé — migration en cours vers PHP/MySQL
└──────────────────────────────────────────────────┘
```

---

## **🟢 Solution : Setup OPTION 1 (Recommandée)**

### **Étape 1 : Créer config.php du backend**

```bash
cd backend
cp config.example.php config.php
```

Édite `backend/config.php` avec ces valeurs pour **développement local** :

```php
<?php
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'leafletmap',        # Ton DB local (doit exister)
        'user' => 'root',               # Utilisateur MySQL local (défaut XAMPP/Laragon)
        'pass' => '',                   # Mot de passe (vide pour dev local)
        'charset' => 'utf8mb4',
    ],
    'jwt_secret' => bin2hex(random_bytes(32)),  # Génère une clé aléatoire
    'jwt_ttl' => 60 * 60 * 24 * 7,
    'allowed_origin' => 'http://localhost:3000',  # Frontend local
];
```

### **Étape 2 : Préparer la base de données MySQL**

#### **A) Créer la base de données**
```sql
CREATE DATABASE IF NOT EXISTS leafletmap;
USE leafletmap;
```

#### **B) Importer le schéma**
```bash
# Depuis le répertoire du projet
mysql -u root -p leafletmap < database/schema.sql
mysql -u root -p leafletmap < database/data.sql
```

Si tu n'as pas MySQL d'installé:
- **Windows**: Installe [XAMPP](https://www.apachefriends.org) ou [Laragon](https://laragon.org)
- **Mac**: Utilise [Homebrew](https://brew.sh): `brew install mysql`
- **Linux**: `sudo apt install mysql-server`

### **Étape 3 : Lancer le backend PHP**

```bash
cd backend
php -S localhost:8000
```

**Vérification** : `http://localhost:8000/api/countries.php` doit afficher une liste JSON de pays

### **Étape 4 : Configurer le frontend**

Édite `.env.local` :
```
# Ancien Supabase (à supprimer plus tard)
NEXT_PUBLIC_SUPABASE_URL=https://zbyrgnapmuhufazuyxbk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Nouvelle API locale (dev)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Étape 5 : Relancer le frontend**

```bash
npm run dev
# Ouvre http://localhost:3000
```

---

## **🐛 Dépannage**

### **Erreur: "config.php manquant"**
→ Crée `backend/config.php` (voir Étape 1)

### **Erreur: "Connexion DB impossible"**
→ Vérifie que:
- MySQL tourne (`mysql -u root`)
- La base `leafletmap` existe (`SHOW DATABASES;`)
- Les identifiants dans `config.php` sont corrects

### **Erreur: "CORS error"**
→ Assure-toi que `allowed_origin` dans `backend/config.php` = `http://localhost:3000`

### **Toujours "Failed to fetch"**
→ Ouvre l'inspecteur (F12 → Network) et clique sur l'appel `/api/countries.php`:
- Vérifie le statut HTTP (500 = config, 404 = PHP pas lancé)
- Lis la réponse JSON pour le message d'erreur exact

---

## **📋 Checklist**

- [ ] `backend/config.php` créé
- [ ] MySQL démarré localement
- [ ] Base `leafletmap` importée avec schema + data
- [ ] Backend PHP lancé: `php -S localhost:8000`
- [ ] `.env.local` pointe vers `http://localhost:8000`
- [ ] Frontend relancé: `npm run dev`
- [ ] Tester: `http://localhost:8000/api/countries.php` retourne du JSON

---

## **Prochaines étapes (optionnelles)**

Une fois que ça fonctionne localement:

1. **Nettoyer les vars Supabase** (migration terminée):
   - Supprimer les lignes Supabase du `.env.local`
   - Supprimer les fichiers `lib/supabase.ts` et `lib/supabaseServer.ts`

2. **Déployer en production** sur cPanel:
   - Copier `/backend` dans `/public_html/api`
   - Copier `/src` built Next.js dans `/public_html` ou utiliser une CDN
   - Mettre à jour `NEXT_PUBLIC_API_URL=https://ton-domaine.org/api`

---

## **Questions ?**

Dis-moi si tu rencontres une erreur spécifique, je peux te donner les logs détaillés ! 🚀
