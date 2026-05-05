# Sulu CMS (Symfony) — Setup-Anleitung

Kurz: Diese Anleitung richtet ein Symfony-Projekt mit dem CMS Sulu ein.

Voraussetzungen
- PHP (aktuelle 7.x/8.x LTS-Version) installiert
- Composer installiert
- Node.js + npm oder Yarn installiert (für Frontend-Assets)
- Datenbank: MySQL / MariaDB oder PostgreSQL
- Git (empfohlen)

Empfohlene Schritte

1) Projekt anlegen (Beispielname: `my-sulu-project`)

```bash
# im Workspace-Ordner
cd c:\htl\Web_projekt4\SULU

# Composer: Sulu Skeleton anlegen
composer create-project sulu/skeleton my-sulu-project

cd my-sulu-project
```

2) Umgebungsvariablen konfigurieren
- Kopiere `.env` zu `.env.local` und passe `DATABASE_URL` an.

3) Abhängigkeiten/Assets installieren

```bash
# PHP-abhängigkeiten (Composer)
composer install

# Node-Dependencies
npm install      # oder: yarn

# Frontend build (Entwicklung)
npm run build    # oder: yarn build
```

4) Datenbank erstellen und Migrationen ausführen

```bash
# Datenbank erstellen
php bin/console doctrine:database:create

# Migrationen ausführen
php bin/console doctrine:migrations:migrate

# Sulu initiale Fixtures / Einstellungen (falls vorhanden)
php bin/console sulu:build dev
```

5) Entwicklungsserver starten

```bash
# Wenn Symfony CLI installiert ist
symfony server:start

# Alternativ
php -S 127.0.0.1:8000 -t public
```

6) Admin-Bereich
- Standardmäßig erreichbar unter `http://localhost:8000/admin`
- Erstelle einen Nutzer über die Konsole, falls nötig.

Tipps
- Prüfe die Sulu-Doku: https://docs.sulu.io/3.x/book/getting-started.html
- Für Produktions-Deployment: Assets optimieren und Umgebungsvariablen setzen

Wenn du möchtest, führe ich die Schritte jetzt automatisch aus (Composer/DB/Build). Sag Bescheid, ob ich loslegen soll oder ob du zuerst noch Einstellungen ändern willst.