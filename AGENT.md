# AGENT.md — kroo-reservation

## Purpose
A Google Apps Script WebApp for managing room/resource reservations at KROO CC Coworking Space. Supports three operating modes: Guest, User, and Admin.

## Structure
```
kroo-reservation/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── appsscript.json      ← GAS manifest
    ├── env.js               ← environment config / Sheet IDs
    ├── Backend.js           ← data access layer (Sheets read/write)
    ├── Helpers.js           ← pure utility functions
    ├── Middleware.js        ← server-side routing / auth
    ├── Server.js            ← doGet() / doPost() entry points
    ├── GenerateEmail.js     ← email confirmation generation
    ├── Instapay.js          ← payment integration helpers
    ├── index.html           ← SPA shell
    ├── index-css.html       ← CSS partial
    └── index-js.html        ← client-side JS partial
```

## Key Facts
- **Platform:** Google Apps Script WebApp
- **Data store:** Google Sheets (IDs in `env.js`)
- **Auth modes:** Guest (cookie/local), User (server-side), Admin (full access)
- **Payment:** Instapay integration via `Instapay.js`
- **Entry point:** `Server.js` → `doGet()` / `doPost()`

## Development Notes
- All source files live under `src/` — push with clasp from that directory
- No Node/npm at runtime; ES5-compatible GAS code only
- Sheet IDs and secrets live in `env.js` (not committed with real values)
