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

5. Create the database, tables, and initial local records:

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
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/chat`
- `GET /api/dashboards/faculty`
- `GET /api/dashboards/research-head`
- `GET /api/proposals`
- `GET /api/proposals/:proposalId`
- `POST /api/proposals`
- `PATCH /api/proposals/:proposalId/decision`
- `GET /api/research-calls`
- `GET /api/research-calls/:researchCallId`
- `POST /api/research-calls`
- `PATCH /api/research-calls/:researchCallId`
- `PATCH /api/research-calls/:researchCallId/status`
- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/read-all`

All routes except health and login require `Authorization: Bearer <session token>`.
Faculty IDs and reviewer IDs are derived from the authenticated database account.

The approval endpoint expects:

```json
{
  "decision": "approved",
  "comments": "Approved for implementation."
}
```

The initialized accounts are:

- Faculty: `quey.baldos@g.batstate-u.edu.ph`
- Research Head: `mary.baldos@g.batstate-u.edu.ph`
- Local password: the `DEMO_ACCOUNT_PASSWORD` value used during initial setup

The login endpoint accepts only registered, active accounts under
`@g.batstate-u.edu.ph`. Passwords are stored as salted scrypt hashes and login
sessions are represented by opaque, expiring bearer tokens.

## Ask Athena

Set a private `GROQ_API_KEY` in `server/.env`, then send chat messages to
`POST /api/chat`:

```json
{
  "messages": [
    { "role": "user", "content": "What should I prepare before submitting a proposal?" }
  ]
}
```

The Expo app calls this authenticated server route and never receives the Groq
key. Do not expose the local API to the public internet without production
hardening and rate limiting.

## Important limitation

This is deliberately a simple local authentication system, not university
single sign-on. Restricting the email suffix does not prove ownership of a
BatStateU mailbox; only pre-created database accounts can sign in. Use the
university identity provider before any real deployment.
