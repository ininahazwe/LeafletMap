# ⚡ Quick Start — Setup local en 5 min

## **Situation actuelle**
```
❌ Frontend (http://localhost:3000) lance
❌ Backend (http://localhost:8000) N'EXISTE PAS
❌ Base de données MISSING
```

## **5 Étapes pour que ça fonctionne**

### **1️⃣ Avoir MySQL d'installé (1 min)**

**Windows / Mac / Linux:**
- Télécharge [XAMPP](https://www.apachefriends.org) ou [Laragon](https://laragon.org)
- Lance-le (tu auras Apache + MySQL)
- Vérifie: `mysql -u root` (doit marcher)

### **2️⃣ Créer la base de données (1 min)**

**Option A: Avec le script (plus simple)**
```bash
cd ~/Documents/Dev/LeafletMap
bash setup-db.sh  # S'il y a une erreur, voir Option B
```

**Option B: Manuellement**
```bash
mysql -u root
```

Puis dans le shell MySQL:
```sql
CREATE DATABASE leafletmap;
USE leafletmap;
-- Importe le schéma
SOURCE database/schema.sql;
-- Importe les données
SOURCE database/data.sql;
EXIT;
```

### **3️⃣ Configurer le backend (1 min)**

Copie le fichier `config.php` qu'on a créé:

```bash
# Dans le répertoire du projet
cp config.php backend/config.php
```

Vérifie `backend/config.php`:
```php
'host' => 'localhost',
'name' => 'leafletmap',
'user' => 'root',
'pass' => '',  # Vide en dev local
```

### **4️⃣ Lancer le backend (1 min)**

```bash
cd backend
php -S localhost:8000
```

Vérifie dans le navigateur: **http://localhost:8000/api/countries.php**
→ Doit afficher une liste JSON de pays ✅

### **5️⃣ Configurer le frontend (1 min)**

Copie le `.env.local` qu'on a créé:
```bash
cp .env.local ~/Documents/Dev/LeafletMap/.env.local
```

Vérifie qu'il contient:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Relance le frontend:
```bash
npm run dev
```

---

## **Vérification finale**

Ouvre **http://localhost:3000**

Si tu vois la carte + les pays s'affichent ✅ → **C'est gagné!**

Si tu vois toujours "Error loading map":
1. Ouvre l'inspecteur (F12)
2. Onglet "Network"
3. Cherche l'appel `/api/countries.php`
4. Vérifie le statut HTTP et le message d'erreur
5. Envoie-moi le screenshot!

---

## **Commandes utiles**

```bash
# Vérifier que MySQL tourne
mysql -u root -e "SELECT 1;"

# Vérifier que le backend PHP répond
curl http://localhost:8000/api/countries.php

# Vérifier que Next.js compile
npm run dev

# Voir les logs du backend
cd backend && php -S localhost:8000 -t . # (verbose mode)
```

---

## **Besoin d'aide?**

Si tu es bloqué:
1. Dis-moi quelle **étape** te pose problème
2. Partage le **message d'erreur exact** (copie-colle)
3. Je peux lancer les commandes sur ta machine! 🚀
