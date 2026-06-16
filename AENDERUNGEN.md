# Änderungsprotokoll – Migration & Aktualisierung

**Datum:** 16.06.2026
**Projekt:** Diplomarbeit – Sulu Headless CMS mit Next.js-Frontend

Dieses Dokument fasst alle in diesem Arbeitsschritt durchgeführten Änderungen
zusammen: Datenbank-Migration auf MariaDB 11.4, Aktualisierung von Next.js auf
Version 16, einen behobenen Bug in der API sowie kleinere Aufräumarbeiten.

---

## 1. Ausgangslage / Versionsprüfung

Vor den Änderungen wurde der komplette Stack überprüft:

| Komponente        | Version (vorher)            | Status |
|-------------------|-----------------------------|--------|
| PHP               | 8.3.30                      | aktuell |
| Sulu              | 3.0.6                       | aktuell |
| Symfony           | 7.4.9                       | aktuell (LTS) |
| Headless-Bundle   | 3.0.0                       | aktuell |
| **MariaDB**       | **10.6.25 (Docker)**        | **veraltet (EOL Juli 2026)** |
| **Next.js**       | **15.5.19**                 | **veraltet** |
| React             | 19.x                        | aktuell |

### Wichtige Erkenntnisse
- Die Datenbank lief als **Docker-Container `mariadb:10.6`**, obwohl die `.env`
  fälschlich `serverVersion=8.4.7` (MySQL) angab. Aktiv ist `.env.local`.
- **Symfony 7.4 ist NICHT veraltet**, sondern die aktuellste LTS-Version
  (Release Nov 2025, Support bis 2030). Ein Upgrade auf Symfony 8.0 ist **nicht
  möglich**, weil Sulu 3.0 nur `^7.4` unterstützt. Symfony bleibt daher bewusst
  unverändert.

---

## 2. Datenbank-Migration: MariaDB 10.6 → 11.4 LTS

Ziel: Wechsel auf die aktuelle LTS-Version **MariaDB 11.4** unter **Erhalt aller
vorhandenen Inhalte** (Seiten, Artikel, Medien – 92 Tabellen).

### Vorgehen
1. **Dump** der bestehenden `sulu`-Datenbank aus dem 10.6-Container erstellt
   (`backup_sulu_10.6.sql`, 123 KB).
2. Container mit frischem Volume auf **MariaDB 11.4** neu aufgebaut.
3. **Dump zurückgespielt** – alle 92 Tabellen vollständig wiederhergestellt.
4. Verbindung verifiziert: `SELECT VERSION()` → **`11.4.12-MariaDB`**,
   Doctrine-Schema-Mapping korrekt, Container-Status `healthy`.

### Geänderte Dateien

**`docker-compose.yml`** (kanonische, laufende Compose-Datei)
- Image: `mariadb:10.6` → **`mariadb:11.4`**
- Obsolete Zeile `version: '3.8'` entfernt (von Docker Compose verworfen)
- Healthcheck korrigiert: `mysqladmin ping` → **`healthcheck.sh --connect
  --innodb_initialized`**
  *(Grund: `mysqladmin` existiert in MariaDB 11.4 nicht mehr, dadurch wurde der
  Container fälschlich als `unhealthy` gemeldet.)*

**`my-sulu-project/.env.local`** (aktiv genutzte Konfiguration)
- `DATABASE_URL` um korrekten Parameter ergänzt:
  `?serverVersion=mariadb-11.4.12&charset=utf8mb4`
  *(modernes DBAL-4-Format mit `mariadb-`-Präfix)*

**`my-sulu-project/.env`** (committeter Default)
- Aktive `DATABASE_URL` von fälschlichem `mysql://…8.4.7` auf
  **`mysql://sulu:sulu@127.0.0.1:3306/sulu?serverVersion=mariadb-11.4.12`**
  korrigiert
- Auskommentierte Beispiel-URLs aktualisiert

**`my-sulu-project/compose.yaml`** (zweite, ungenutzte Symfony-Standarddatei)
- Image: `mysql:8.4` → **`mariadb:11.4`**
- Datenbank/User/Passwörter an den laufenden Container angeglichen
  (`sulu` / `sulu` / Root `root`), damit nichts mehr widersprüchlich auf MySQL
  verweist

---

## 3. Bugfix: `/api/articles` lieferte HTTP 500

Beim Test fiel auf, dass der eigene API-Endpoint **noch nie funktioniert hatte**.

### Ursache
`App\Controller\Website\ArticleController` erweitert nicht `AbstractController`.
Reine Action-Controller erhalten den Tag `controller.service_arguments` bei
`autoconfigure` **nicht automatisch** – dadurch wurden die
Konstruktor-Abhängigkeiten nicht injiziert:

```
ArgumentCountError: Too few arguments to function
App\Controller\Website\ArticleController::__construct(), 0 passed
```

### Lösung
**`my-sulu-project/config/services.yaml`** – idiomatische Standard-Symfony-
Registrierung des Controller-Ordners ergänzt:

```yaml
App\Controller\:
    resource: '../src/Controller/'
    tags: ['controller.service_arguments']
```

### Verifikation
`GET /api/articles?locale=en&limit=2` → **HTTP 200** mit korrektem JSON
(inkl. des aus MariaDB 11.4 wiederhergestellten Artikels „Test").

---

## 4. Frontend-Aktualisierung: Next.js 15 → 16

### Geänderte Dateien

**`frontend/package.json`**
- `next`: `^15.3.3` → **`^16.0.0`** (installiert: **16.2.9**)
- React 19 unverändert (von Next 16 vorausgesetzt), Node 24 erfüllt die
  Anforderung (Node ≥ 20.9)

**`frontend/pnpm-lock.yaml`**
- Durch `pnpm install` aktualisiert

**`frontend/tsconfig.json`**
- **Automatisch von Next 16 angepasst** (erwartetes Verhalten):
  `jsx` → `react-jsx`, `include` um `.next/dev/types/**/*.ts` erweitert

### Verifikation
`pnpm build` erfolgreich mit **Next.js 16.2.9 (Turbopack)**:
- TypeScript-Prüfung grün
- Alle Seiten generiert (`/`, `/_not-found`, `/[...slug]`, `/articles`)

> Hinweis: Der ursprüngliche Build-Fehler (`ECONNREFUSED` beim Prerendering von
> `/articles`) lag **nicht** an Next 16, sondern am zur Build-Zeit nicht
> laufenden Sulu-Backend. Mit laufendem Backend läuft der Build sauber durch.

---

## 5. Aufräumarbeiten

**`.gitignore`** (neu im Repo-Root angelegt)
- Schließt Datenbank-Dumps/Backups vom Versionskontrollsystem aus:
  ```
  backup_*.sql
  *.dump
  db_dump_err.txt
  ```
- `backup_sulu_10.6.sql` bleibt lokal als Sicherung erhalten, wird aber **nicht**
  committet.

---

## 6. Zusammenfassung der geänderten Dateien

| Datei | Art | Zweck |
|-------|-----|-------|
| `docker-compose.yml` | geändert | MariaDB 11.4 + Healthcheck-Fix |
| `my-sulu-project/.env` | geändert | DATABASE_URL auf MariaDB 11.4 |
| `my-sulu-project/.env.local` | geändert | serverVersion ergänzt |
| `my-sulu-project/compose.yaml` | geändert | MySQL 8.4 → MariaDB 11.4 |
| `my-sulu-project/config/services.yaml` | geändert | ArticleController-Bugfix |
| `frontend/package.json` | geändert | Next.js 16 |
| `frontend/pnpm-lock.yaml` | geändert | Lockfile-Update |
| `frontend/tsconfig.json` | geändert | von Next 16 angepasst |
| `.gitignore` | neu | DB-Dumps ignorieren |

---

## 7. Offene Hinweise / Empfehlungen

- **Headless-Bundle-Constraint**: In `my-sulu-project/composer.json` steht
  `"sulu/headless-bundle": "*"`. Empfehlung: auf `^3.0` pinnen
  (Reproduzierbarkeit der Diplomarbeit). *(noch offen)*
- **Robustheit des Builds ohne Backend**: `fetchPage` in
  `frontend/src/lib/sulu.ts` wirft bei Netzwerkfehlern, während `fetchNavigation`
  bereits einen Fallback liefert. Für CI-Builds ohne laufendes Backend könnte man
  dies vereinheitlichen. *(optional)*

### Endzustand der Versionen

| Komponente | Version (nachher) |
|------------|-------------------|
| PHP | 8.3.30 |
| Sulu | 3.0.6 |
| Symfony | 7.4.9 (LTS, unverändert) |
| Headless-Bundle | 3.0.0 |
| **MariaDB** | **11.4.12 (LTS)** |
| **Next.js** | **16.2.9** |
| React | 19.x |
