# KROO Reservations App

A Google Apps Script WebApp for managing room and resource reservations at KROO CC Coworking Space. Supports three user modes, real-time availability, multiple payment methods, and a two-phase booking process for data integrity.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-WebApp-blue)
![Status](https://img.shields.io/badge/Status-Production-green)

---

## Features

- **Resource Discovery** — browse meeting rooms, focus pods, and creative spaces with capacity, location, and real-time pricing
- **Interactive Booking** — visual calendar and time-slot selection with live availability checks
- **Three User Modes** — Guest (cookie-based), User (server-side persistent), Admin (full management access)
- **Multiple Payment Options** — InstaPay (with OCR receipt verification), credit card, and cash
- **Booking Management** — view, track, and cancel reservations from a unified dashboard
- **Admin Controls** — create and manage bookings on behalf of users with special pricing

---

## Architecture

### User Modes

| Mode  | Storage         | Auth        | Capabilities                              |
|-------|-----------------|-------------|-------------------------------------------|
| Guest | Cookie (local)  | None        | Create/view bookings locally              |
| User  | Server-side     | Email-based | Persistent history, recurring bookings    |
| Admin | Server-side     | Privileged  | Full oversight, pricing overrides, analytics |

### Booking Flow

```
1. Buffer Phase  →  temporary slot hold
2. Payment       →  receipt submission / verification
3. Database Phase →  confirmed permanent booking
```

### Frontend State Utilities

- `AppState` — centralised state management
- `BookingStorage` — booking data persistence (guest mode)
- `CookieStorage` — encrypted cookie management
- `PerformanceTracker` — real-time performance monitoring

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Platform | Google Apps Script              |
| UI       | HTML5, CSS3, Vanilla JavaScript |
| Database | Google Sheets                   |
| Payment  | InstaPay (with OCR verification)|
| Deploy   | clasp CLI                       |

---

## Project Structure

```
kroo-reservation/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── appsscript.json         # GAS manifest
    ├── env.js                  # Sheet IDs and config
    ├── Backend.js              # Data access layer (Sheets read/write)
    ├── Helpers.js              # Pure utility functions
    ├── Middleware.js           # Server-side routing and auth
    ├── Server.js               # doGet() / doPost() entry points
    ├── GenerateEmail.js        # Email confirmation templates
    ├── Instapay.js             # Payment integration helpers
    ├── index.html              # SPA shell
    ├── index-css.html          # CSS partial
    └── index-js.html          # Client-side JS partial
```

---

## Getting Started

### Prerequisites

- A Google account with Google Apps Script access
- [clasp](https://github.com/google/clasp) installed globally

```bash
npm install -g @google/clasp
clasp login
```

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mohamedallam13/kroo-reservation.git
   cd kroo-reservation
   ```

2. Link to your Apps Script project (update `scriptId` in `.clasp.json`):
   ```bash
   clasp create --type webapp --title "KROO Reservations" --rootDir src
   ```

3. Push source files:
   ```bash
   clasp push
   ```

---

## Deployment

1. In the Apps Script editor, go to **Deploy > New deployment**
2. Select type: **Web app**
3. Set **Execute as**: Me · **Who has access**: Anyone
4. Click **Deploy** and share the Web App URL

---

## Author

**Mohamed Allam** — [GitHub](https://github.com/mohamedallam13) · [Email](mailto:mohamedallam.tu@gmail.com)
