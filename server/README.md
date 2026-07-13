# ATHENA Express + MySQL API

This is the local API and database for the ATHENA Expo app. It uses Express 5 and MySQL through `mysql2`; Python is not used.

## Laragon setup

1. Open Laragon and click **Start All**. MySQL must be running.
2. Open a terminal in this `server` folder.
3. Copy `.env.example` to `.env`. Laragon commonly uses `root` with an empty password locally; change `DB_PASSWORD` if your installation is different.
4. Install packages:

   ```powershell
   npm install
   ```

5. Create the database, tables, and demo data:

   ```powershell
   npm run db:setup
   ```

6. Start the API:

   ```powershell
   npm run dev
   ```

The API will be available at `http://localhost:4000/api`. Test the database connection at `http://localhost:4000/api/health`.

You can also inspect `athena_research` with Laragon's HeidiSQL or phpMyAdmin.

## Expo Go connection

`localhost` on a physical phone points to the phone, not your computer. For Expo Go, use your computer's LAN IPv4 address:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.123:4000/api
```

Replace `192.168.1.123` with the computer's actual address. The phone and computer must be on the same network, and Windows Firewall must allow Node.js on private networks.

Do not place `DB_PASSWORD` or any other database credential in an `EXPO_PUBLIC_` variable. The mobile app should only know the Express API URL.

## Included API routes

- `GET /api/health`
- `GET /api/dashboards/faculty/:facultyId`
- `GET /api/dashboards/research-head`
- `GET /api/proposals`
- `GET /api/proposals/:proposalId`
- `POST /api/proposals`
- `PATCH /api/proposals/:proposalId/decision`

The approval endpoint expects:

```json
{
  "reviewerId": 2,
  "decision": "approved",
  "comments": "Approved for implementation."
}
```

The seeded demo users are Faculty ID `1` and Research Head ID `2`.

## Important limitation

Authentication is intentionally not added yet. IDs in request bodies are suitable only for the current local demo. Before deployment, authenticate users on the server and derive `facultyId` or `reviewerId` from the verified session instead of trusting values sent by the app.
