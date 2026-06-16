# Sulu Headless CMS + Next.js – Projektanleitung

Diplomarbeit: **Sulu 3 (Headless CMS)** als Backend mit einem **Next.js 16**-Frontend.
Die Datenbank (**MariaDB 11.4**) läuft als Docker-Container.

Diese Anleitung beschreibt, **was man wie und in welcher Reihenfolge** installiert
und startet.

---

## 1. Architektur / Komponenten

| Komponente   | Technologie        | Ordner             | Paketmanager | Port |
|--------------|--------------------|--------------------|--------------|------|
| Datenbank    | MariaDB 11.4       | `./` (Docker)      | Docker       | 3306 |
| Backend/CMS  | Sulu 3 / Symfony 7 | `my-sulu-project/` | Composer     | 8000 |
| Frontend     | Next.js 16 / React 19 | `frontend/`     | pnpm         | 3000 |

Datenfluss: **Frontend (3000)** → ruft REST-API von **Sulu (8000)** ab →
liest aus **MariaDB (3306)**.

---

## 2. Voraussetzungen

Folgende Tools müssen installiert sein:

- **Docker** + Docker Compose (für die Datenbank)
- **PHP 8.3** mit den üblichen Symfony-Extensions (intl, pdo_mysql, mbstring, …)
- **Composer 2**
- **Node.js ≥ 20.9** (empfohlen 22/24)
- **pnpm 10** (`npm install -g pnpm`)
- **Symfony CLI** (empfohlen, für `symfony server:start`)
- **MariaDB-Client** (`mariadb` / `mysql`), um den DB-Dump einzuspielen
- **Git**

---

## 3. Initialisierung (Erstinstallation – einmalig)

> Reihenfolge ist wichtig: **erst Datenbank, dann Backend, dann Frontend.**

### Schritt 1 – Datenbank (Docker) starten

Im Projekt-Root (`SULU/`):

```bash
docker compose up -d
```

Das startet den Container `sulu-mariadb` (MariaDB 11.4) mit der Datenbank `sulu`
(User `sulu` / Passwort `sulu`, Root-Passwort `root`).

Status prüfen, bis `healthy`:

```bash
docker compose ps
```

### Schritt 2 – Datenbank-Inhalt einspielen

Der vorhandene Dump enthält alle Inhalte (Seiten, Artikel, Medien – 92 Tabellen):

```bash
# Windows / PowerShell oder Git-Bash – im Projekt-Root
docker exec -i sulu-mariadb mariadb -usulu -psulu sulu < backup_sulu_10.6.sql
```

> Liegt kein Dump vor, kann das Schema stattdessen frisch erzeugt werden
> (siehe Schritt 3, Variante „leere DB").

### Schritt 3 – Backend (Sulu / Symfony) einrichten

```bash
cd my-sulu-project

# PHP-Abhängigkeiten installieren
composer install
```

Umgebungskonfiguration: Die Datei `my-sulu-project/.env.local` setzt bereits
`APP_ENV=dev` und die korrekte `DATABASE_URL` auf MariaDB 11.4. Falls nicht
vorhanden, anlegen:

```dotenv
APP_ENV=dev
DATABASE_URL="mysql://sulu:sulu@127.0.0.1:3306/sulu?serverVersion=mariadb-11.4.12&charset=utf8mb4"
```

**Variante A – Dump wurde eingespielt (Schritt 2):** nichts weiter nötig, die
Daten sind bereits vorhanden.

**Variante B – leere Datenbank:** Schema aufbauen und Sulu initialisieren:

```bash
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction
php bin/adminconsole sulu:build dev          # initialisiert Sulu (Index, Snippets …)
php bin/console sulu:security:user:create     # Admin-Benutzer anlegen
```

### Schritt 4 – Frontend (Next.js) einrichten

```bash
cd ../frontend

# Node-Abhängigkeiten installieren
pnpm install
```

Konfiguration: `frontend/.env.local` zeigt auf das Backend:

```dotenv
SULU_API_URL=http://localhost:8000
SULU_DEFAULT_LOCALE=en
```

---

## 4. Täglicher Start (nach der Erstinstallation)

In **drei Terminals** bzw. in dieser Reihenfolge starten:

```bash
# 1) Datenbank (Projekt-Root)
docker compose up -d

# 2) Backend (my-sulu-project/)
symfony server:start
#   Alternative ohne Symfony CLI:
#   php -S 127.0.0.1:8000 -t public

# 3) Frontend (frontend/)
pnpm dev
```

### Erreichbarkeit

| Was                | URL                              |
|--------------------|----------------------------------|
| Frontend (Next.js) | http://localhost:3000            |
| Sulu Admin         | http://localhost:8000/admin      |
| Sulu API (Beispiel)| http://localhost:8000/api/articles?locale=en |

---

## 5. Stoppen / Aufräumen

```bash
# Backend / Frontend: jeweils mit Strg+C beenden

# Datenbank stoppen (Daten bleiben im Volume erhalten)
docker compose stop

# Datenbank inkl. aller Daten entfernen (Volume löschen!)
docker compose down -v
```

---

## 6. Häufige Probleme

- **Container `unhealthy`:** Der Healthcheck nutzt `healthcheck.sh` (MariaDB 11.4
  hat kein `mysqladmin` mehr). Kurz warten und `docker compose ps` erneut prüfen.
- **`ECONNREFUSED` beim `pnpm build`:** Das Frontend braucht zur Build-Zeit ein
  **laufendes Backend** (Schritt 2 des täglichen Starts zuerst ausführen).
- **API `/api/articles` liefert 500:** Backend-Cache leeren
  (`php bin/console cache:clear`) und sicherstellen, dass der Dump/Schema geladen ist.
- **Falsche DB-Version in Doctrine:** `serverVersion=mariadb-11.4.12` in der
  aktiven `.env.local` prüfen.

> Details zu durchgeführten Migrationen/Änderungen siehe [AENDERUNGEN.md](AENDERUNGEN.md).
> Weiterführende Sulu-Doku: https://docs.sulu.io/
