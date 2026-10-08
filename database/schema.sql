-- ============================================================
-- Schéma MySQL — migration depuis Supabase (Postgres)
-- À importer via phpMyAdmin dans la base MySQL du cPanel
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- countries
-- Équivalent de public.countries sur Supabase.
-- NB : la colonne `tooltip_info` est utilisée par le code
-- (hooks/useAllCountriesData.ts) mais absente de
-- src/app/types/database.ts -> le type TS est désynchronisé
-- du schéma réel, à corriger dans database.ts après migration.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  iso_a3        CHAR(3)       NOT NULL,
  name_fr       VARCHAR(255)  NOT NULL,
  name_en       VARCHAR(255)  NOT NULL,
  region        VARCHAR(100)  NULL,
  tooltip_info  TEXT          NULL,
  UNIQUE KEY uq_countries_iso_a3 (iso_a3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- media_environment
-- Équivalent de public.media_environment.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_environment (
  id                        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country_id                INT UNSIGNED NOT NULL,
  legal_environment         TEXT NULL,
  media_regulators          TEXT NULL,
  journalists_associations  TEXT NULL,
  radio_stations            TEXT NULL,
  tv_stations               TEXT NULL,
  newspapers                TEXT NULL,
  state_owned_media         TEXT NULL,
  news_agency               TEXT NULL,
  international_media       TEXT NULL,
  online_media              TEXT NULL,
  internet_freedom          TEXT NULL,
  leading_media             TEXT NULL,
  created_at                DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_media_environment_country (country_id),
  CONSTRAINT fk_media_environment_country
    FOREIGN KEY (country_id) REFERENCES countries(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- rankings
-- Présent dans src/app/types/database.ts mais le code indique
-- "SIMPLIFICATION : plus de rankings, focus sur media_environment".
-- Table créée par précaution (au cas où des données existent
-- encore côté Supabase) mais probablement à ignorer / drop
-- après vérification. Voir scripts/export-supabase-data.mjs.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country_id      INT UNSIGNED NOT NULL,
  year            SMALLINT NOT NULL,
  position        SMALLINT NOT NULL,
  score_global    DECIMAL(6,2) NOT NULL,
  score_political DECIMAL(6,2) NULL,
  score_economic  DECIMAL(6,2) NULL,
  score_legal     DECIMAL(6,2) NULL,
  score_social    DECIMAL(6,2) NULL,
  score_security  DECIMAL(6,2) NULL,
  UNIQUE KEY uq_rankings_country_year (country_id, year),
  CONSTRAINT fk_rankings_country
    FOREIGN KEY (country_id) REFERENCES countries(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- admin_users
-- Remplace Supabase Auth (auth.users) + table admins.
-- password_hash attend un hash bcrypt ($2a$/$2b$/$2y$) :
-- compatible avec password_verify() de PHP.
-- Les hashs bcrypt exportés depuis Supabase (colonne
-- auth.users.encrypted_password, format $2a$) sont réutilisables
-- tels quels -> pas besoin de réinitialiser les mots de passe.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  name           VARCHAR(255) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
