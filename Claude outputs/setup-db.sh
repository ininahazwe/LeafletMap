#!/bin/bash
# Script de setup de la base de données locale
# Utilisation: bash setup-db.sh

set -e  # Arrête au premier erreur

echo "🔧 Setup base de données locale..."

# Configuration
DB_NAME="leafletmap"
DB_USER="root"
DB_HOST="localhost"
SCHEMA_FILE="database/schema.sql"
DATA_FILE="database/data.sql"

# Vérifier que les fichiers existent
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Erreur: $SCHEMA_FILE non trouvé"
    exit 1
fi

if [ ! -f "$DATA_FILE" ]; then
    echo "❌ Erreur: $DATA_FILE non trouvé"
    exit 1
fi

echo "📋 Fichiers SQL trouvés"

# Créer la base de données
echo "📦 Création de la base de données '$DB_NAME'..."
mysql -u "$DB_USER" -h "$DB_HOST" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
USE $DB_NAME;
EOF

# Importer le schéma
echo "🔨 Import du schéma..."
mysql -u "$DB_USER" -h "$DB_HOST" "$DB_NAME" < "$SCHEMA_FILE"

# Importer les données
echo "📊 Import des données..."
mysql -u "$DB_USER" -h "$DB_HOST" "$DB_NAME" < "$DATA_FILE"

echo "✅ Base de données '$DB_NAME' créée et peuplée avec succès!"
echo ""
echo "Prochaines étapes:"
echo "  1. Copie backend/config.example.php → backend/config.php"
echo "  2. Remplis les identifiants MySQL dans backend/config.php"
echo "  3. Lance le backend: cd backend && php -S localhost:8000"
echo "  4. Vérifie: curl http://localhost:8000/api/countries.php"
echo "  5. En autre terminal: npm run dev (frontend)"
