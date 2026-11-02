# Einkaufsliste API

REST-Backend für eine Einkaufslisten-App, gebaut mit TypeScript, Express 5 und MySQL. Benutzer melden sich per JWT an und verwalten ihre Listen und Items.

## Setup

Voraussetzungen: Node.js 20.12 oder neuer (für `process.loadEnvFile`) und eine MySQL-Datenbank.

```bash
npm install
cp .env.example .env   # Werte eintragen, v. a. DB_PASSWORD und JWT_SECRET
mysql -u root -p < database.sql
npm start
```

Der Server läuft dann auf `http://localhost:3000`.

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
```
