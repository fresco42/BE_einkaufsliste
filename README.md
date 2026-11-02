# Einkaufsliste API

REST-Backend für eine Einkaufslisten-App, gebaut mit TypeScript, Express 5 und MySQL. Benutzer melden sich per JWT an und verwalten ihre Listen und Items.

## Setup

Voraussetzungen: Node.js 20.12 oder neuer (für `process.loadEnvFile`) und [Docker Desktop](https://www.docker.com/products/docker-desktop/) für die Datenbank.

### 1. Abhängigkeiten installieren und `.env` anlegen

```bash
npm install
cp .env.example .env
```

In der `.env` die Passwörter und `JWT_SECRET` durch eigene Werte ersetzen. Backend und Docker lesen beide diese Datei, die Zugangsdaten stehen also nur an einer Stelle.

| Variable | Bedeutung |
| --- | --- |
| `DB_HOST` | `127.0.0.1`, die Datenbank läuft lokal in Docker |
| `DB_PORT` | Port am PC, Standard `3306` |
| `DB_NAME` | Name der Datenbank, wird beim ersten Start angelegt |
| `DB_USER` / `DB_PASSWORD` | User für das Backend, **nicht** `root` |
| `DB_ROOT_PASSWORD` | Root-Passwort von MySQL, nur für Administration |
| `JWT_SECRET` | Schlüssel zum Signieren der Login-Tokens |

### 2. Datenbank starten

```bash
docker compose up -d
```

Das startet MySQL 8.4 im Container `einkaufsliste-mysql`. Die Daten liegen im Docker-Volume `einkaufsliste-db` und bleiben erhalten, auch wenn der Container gelöscht wird. Beim allerersten Start legt MySQL Datenbank und User an und führt [`database.sql`](database.sql) aus, die die Tabellen erstellt.

Nach 10–30 Sekunden ist die Datenbank bereit. Prüfen kannst du das mit:

```bash
docker compose logs -f mysql
```

Sobald `ready for connections` erscheint, mit `Strg+C` raus.

### 3. Backend starten

```bash
npm start
```

Der Server läuft dann auf `http://localhost:3000`.

### Datenbank verwalten

| Befehl | Wirkung |
| --- | --- |
| `docker compose stop` | Datenbank stoppen, Daten bleiben |
| `docker compose up -d` | Wieder starten |
| `docker compose down` | Container löschen, Daten bleiben im Volume |
| `docker compose down -v` | Container **und** Volume löschen, alle Daten sind weg |
| `docker exec -it einkaufsliste-mysql mysql -u <DB_USER> -p <DB_NAME>` | In die Datenbank einloggen |

### Typische Probleme

- **Port 3306 ist belegt** (z. B. durch ein lokales MySQL): In der `.env` einen anderen `DB_PORT` setzen, etwa `3307`.
- **Änderungen an `database.sql` oder an den Passwörtern in der `.env` wirken nicht:** Beides wird nur beim ersten Start mit leerem Volume übernommen. Zum Neuaufsetzen `docker compose down -v` und dann `docker compose up -d`. Dabei gehen alle Daten verloren.
- **`Access denied for user`:** Das Passwort in der `.env` passt nicht mehr zu dem, mit dem das Volume angelegt wurde. Siehe Punkt davor.

Ohne Docker geht es auch mit einer eigenen MySQL-Installation: `database.sql` in eine leere Datenbank importieren und die Zugangsdaten in die `.env` eintragen.

## Endpunkte

Alle Endpunkte außer Registrierung und Login brauchen den Header `Authorization: Bearer <token>`. Listen und Items kann nur ihr Besitzer sehen und ändern, und jeder User kann nur seinen eigenen Account löschen. Bei fremden IDs antwortet die API mit `403 Forbidden`.

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| POST | `/users` | Benutzer registrieren |
| POST | `/login/` | Einloggen, liefert JWT |
| GET | `/users` | Alle Benutzer |
| GET | `/users/:id` | Benutzer nach ID |
| DELETE | `/users/:id` | Benutzer löschen |
| POST | `/lists` | Liste anlegen |
| GET | `/lists/user/:userId` | Listen eines Benutzers |
| GET | `/lists/:id` | Liste nach ID |
| PUT | `/lists/:id` | Liste umbenennen |
| DELETE | `/lists/:id` | Liste löschen |
| POST | `/items` | Item anlegen |
| GET | `/items/list/:listId` | Items einer Liste |
| GET | `/items/:id` | Item nach ID |
| PUT | `/items/:id` | Item ändern |
| DELETE | `/items/:id` | Item löschen |

Die vollständige Spezifikation steht in [`openapi_generated.yaml`](openapi_generated.yaml).

## Projektstruktur

```
src/
  controller/   Routen und Request-Handling
  service/      Datenbanklogik
  model/        Typen
  auth.ts       JWT erzeugen und prüfen
  db.ts         MySQL-Verbindung
database.sql         Tabellen, wird beim ersten Docker-Start ausgeführt
docker-compose.yml   MySQL-Container mit Volume
```
