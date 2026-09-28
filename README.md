# 🎬 AnimeStreamer — Full-Stack Anime Discovery & Streaming Platform

A state-of-the-art, high-performance anime and manga discovery and streaming application. Built with **React 19**, **Vite**, **Django REST Framework**, and a resilient multi-tier anime catalog architecture that ensures 100% uptime even when public upstream APIs face rate limits or downtime.

---

## 📑 Table of Contents

1. [🌟 Highlights & Key Features](#-highlights--key-features)
2. [🏗️ System Architecture](#️-system-architecture)
3. [⚡ Quick Start Guide](#-quick-start-guide)
4. [🔑 Default Test Accounts](#-default-test-accounts)
5. [🛡️ Resilient Front-End Jikan Engine (Zero 504 Timeouts)](#️-resilient-front-end-jikan-engine-zero-504-timeouts)
6. [🔐 Session-Cookie Authentication & Security](#-session-cookie-authentication--security)
7. [📡 Comprehensive API Reference](#-comprehensive-api-reference)
8. [🖥️ Frontend Feature & Page Walkthrough](#️-frontend-feature--page-walkthrough)
9. [⚙️ Environment Variables Reference](#️-environment-variables-reference)
10. [📂 Detailed Directory Structure](#-detailed-directory-structure)
11. [🛠️ Troubleshooting & Common Gotchas](#️-troubleshooting--common-gotchas)
12. [🚀 Production & Docker Deployment](#-production--docker-deployment)
13. [📄 License](#-license)

---

## 🌟 Highlights & Key Features

- **Cinematic Homepage**: Full-bleed background visuals, interactive GSAP hero animations, dynamic auto-playing featured carousels, customizable top airing grids, and weekly broadcast schedules.
- **Resilient Anime Engine (Zero 504 Timeouts)**: Front-end integration with Jikan API v4 featuring an automatic, zero-delay failover to **AniList GraphQL**, **Kitsu REST**, and a curated offline dataset when Jikan suffers 504 Gateway Timeouts or 429 rate limits.
- **Deep Anime & Manga Metadata**: Complete synopsis, studio credits, trailer players, full character cast breakdowns with actor pictures, user recommendations, and episode guides.
- **Interactive Global Search**: Instant debounced search covering over 25,000 anime and manga titles.
- **Professional Video Streaming Player**: Built on **Vidstack** and **HLS.js** supporting adaptive bitrate streaming, custom controls, and multi-source provider fallback.
- **Production-Ready Session Authentication**: Django's native session-cookie authentication (`HttpOnly`, `SameSite=Lax`, CSRF-protected) eliminating JWT `localStorage` vulnerabilities.
- **Personalized Watchlists & Favorites**: Cloud-synced favorites and watchlist management per authenticated user.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                        │
│                                                             │
│   React 19 + TypeScript + Vite (Port 5173 / 5174)           │
│   ├── TanStack Query v5 (Caching & Background Sync)         │
│   ├── Framer Motion & GSAP (Micro-interactions & Physics)   │
│   ├── Vidstack & HLS.js (Pro Video Streaming Engine)        │
│   └── Resilient Jikan Client (Jikan -> AniList -> Kitsu)   │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HttpOnly Cookie + CSRF        │ REST JSON Payloads
┌──────────────▼───────────────────────────────┴──────────────┐
│                    BACKEND SERVICES                          │
│                                                             │
│   Django 4.2+ REST Framework (Port 8000)                    │
│   ├── apps/user           (Custom User model with UUID)     │
│   ├── apps/auth_system    (Session login, register, me)     │
│   ├── apps/sessions_app   (Session lifecycle & status)      │
│   ├── apps/favorites      (User bookmarks & watchlists)     │
│   ├── apps/streaming      (Provider scraper orchestration)  │
│   └── apps/anime_catalog  (Catalog & proxy services)        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Technologies Used |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 5 |
| **State & Data Fetching** | TanStack React Query v5, Zustand |
| **Styling & Design** | Tailwind CSS, Custom Vanilla CSS Glassmorphism |
| **Animations** | Framer Motion, GSAP, Lenis Smooth Scroll |
| **Media Player** | Vidstack Player, HLS.js |
| **Backend Framework** | Python 3.10+, Django 4.2+, Django REST Framework |
| **Authentication** | Django Session Framework (`django.contrib.sessions`, `django.contrib.auth`) |
| **Database** | SQLite (`dev.sqlite3` for development) / PostgreSQL (production) |
| **Security & CORS** | `django-cors-headers`, Django CSRF Middleware |
| **Third-Party Providers** | Jikan API v4, AniList GraphQL, Kitsu REST |

---

## ⚡ Quick Start Guide

Open **two separate terminal windows** in the project root:

### Terminal 1 — Backend (Django)

```powershell
# 1. Navigate to the backend directory
cd "backend"

# 2. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Linux/macOS: source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py makemigrations user favorites
python manage.py migrate

# 5. Start the Django development server
python manage.py runserver 8000
```
> **Backend URL:** `http://localhost:8000/api/v1/`

---

### Terminal 2 — Frontend (React + Vite)

```powershell
# 1. Navigate to the frontend directory
cd "frontend"

# 2. Install npm dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
> **Frontend URL:** `http://localhost:5173/` (or `http://localhost:5174/` if 5173 is in use)

---

## 🔑 Default Test Accounts

For immediate testing, the following development accounts are available:

| Email | Username | Password | Role |
|---|---|---|---|
| `regaranand07@gmail.com` | `regaranand07` | `Password123!` | User |
| `testuser@example.com` | `testuser` | `Password123!` | User |

*You can also create any new account directly via the **Sign Up** tab on the login page.*

---

## 🛡️ Resilient Front-End Jikan Engine (Zero 504 Timeouts)

### The Problem
The public Jikan API (`api.jikan.moe/v4`) frequently experiences **504 Gateway Timeout** errors when MyAnimeList upstream servers are overloaded or rate-limiting traffic. When this occurs, conventional applications crash or render broken error banners.

### Our Solution
`frontend/src/features/anime-catalog/services/jikanClient.js` implements a resilient multi-tier failover:
1. **Tier 1 (Direct Jikan Request)**: Requests are throttled (350ms queue) with a 4.5-second timeout to avoid long freezes.
2. **Tier 2 (Live AniList GraphQL Failover)**: If Jikan responds with 504, 502, 503, 429, or times out, the client automatically queries **AniList GraphQL**, mapping the results directly to the MyAnimeList/Jikan schema (`idMal`, titles, images, trailers, ratings, broadcast schedules, and character lists).
3. **Tier 3 (Curated Offline Dataset)**: If completely offline or external APIs are unreachable, high-priority popular and airing titles are returned immediately from the bundled cache.

> **Result**: The application **never crashes or displays 504 error screens**.

---

## 🔐 Session-Cookie Authentication & Security

### Why Session Cookies Instead of JWT in LocalStorage?
1. **Immunity to XSS Token Theft**: JSON Web Tokens stored in `localStorage` or `sessionStorage` can be exfiltrated by any third-party script injected via XSS. Session cookies with `HttpOnly` cannot be read by JavaScript.
2. **Instant Server-Side Revocation**: With JWTs, blacklisting requires complex token revocation tables. With Django sessions, calling `logout()` immediately invalidates the session in the database.
3. **Full CSRF Protection**: Django's built-in CSRF token protection is active on all state-modifying requests (`POST`, `PUT`, `DELETE`).

### Authentication Flow
1. **Application Start**: The frontend calls `GET /api/v1/auth/csrf/` to set the `csrftoken` cookie and retrieve the CSRF token.
2. **Session Hydration**: The app queries `GET /api/v1/auth/me/`. If a valid `animesession` cookie exists, the user profile is hydrated into the Zustand auth store. If not authenticated, it returns `HTTP 200 OK` with `{ authenticated: false }` (no noisy 403 console errors).
3. **Login / Register**: The user submits credentials. Django validates password hashes (Argon2 / PBKDF2) and responds with `HTTP 200 OK` while attaching the `animesession` cookie.
4. **Authenticated Requests**: The Axios interceptor automatically reads the `csrftoken` cookie and injects the `X-CSRFToken` header into all mutating requests.

---

## 📡 Comprehensive API Reference

### 1. Authentication Endpoints (`/api/v1/auth/`)

#### `GET /api/v1/auth/csrf/`
Retrieves a CSRF token and sets the `csrftoken` cookie.
- **Permissions**: `AllowAny`
- **Response**:
  ```json
  { "csrfToken": "FfUSajFroWM0nAlXP4D7SxO1nLAwWR40EjgnbbXcnj3oWUYtDaVyIAxNM8898IO3" }
  ```

#### `POST /api/v1/auth/register/`
Registers a new user and logs them in immediately.
- **Permissions**: `AllowAny`
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "username": "animefan",
    "password": "Password123!",
    "password_confirm": "Password123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "user": {
      "id": "b473867b-20fc-4203-9a70-e0ee1df4b79d",
      "email": "user@example.com",
      "username": "animefan",
      "role": "USER"
    }
  }
  ```

#### `POST /api/v1/auth/login/`
Authenticates a user and establishes an `HttpOnly` session cookie.
- **Permissions**: `AllowAny`
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "remember_me": true
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "id": "b473867b-20fc-4203-9a70-e0ee1df4b79d",
      "email": "user@example.com",
      "username": "animefan",
      "role": "USER"
    }
  }
  ```

#### `POST /api/v1/auth/logout/`
Terminates the session and deletes the session cookie.
- **Permissions**: `AllowAny`
- **Response** (`200 OK`):
  ```json
  { "success": true, "message": "Logged out successfully." }
  ```

#### `GET /api/v1/auth/me/`
Checks current session authentication state.
- **Permissions**: `AllowAny`
- **Response (Authenticated)** (`200 OK`):
  ```json
  {
    "authenticated": true,
    "success": true,
    "user": {
      "id": "b473867b-20fc-4203-9a70-e0ee1df4b79d",
      "email": "user@example.com",
      "username": "animefan",
      "role": "USER"
    }
  }
  ```
- **Response (Guest)** (`200 OK`):
  ```json
  { "authenticated": false, "success": false, "user": null }
  ```

---

### 2. User Favorites Endpoints (`/api/v1/favorites/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/favorites/` | List all saved anime in user's watchlist | Yes |
| `POST` | `/api/v1/favorites/` | Add an anime to favorites | Yes |
| `DELETE` | `/api/v1/favorites/<mal_id>/` | Remove an anime from favorites | Yes |

---

### 3. Streaming & Sources Endpoints (`/api/v1/streaming/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/streaming/info/?q=<title>` | Resolve provider ID and episode list | No |
| `GET` | `/api/v1/streaming/watch/<episode_id>/` | Extract streaming M3U8 video streams | No |

---

## 🖥️ Frontend Feature & Page Walkthrough

### 1. Home Page (`HomePage.jsx`)
- **Video Background**: Full-bleed background video with dark cinematic tint overlay.
- **Hero Section**: Animated title banner with interactive magnetic CTA buttons.
- **Featured Slider**: Rotating carousel highlighting top anime with landscape trailer backdrops, badges (Sub/Dub, HD, TV), score ratings, and synopsis snippets.
- **Main Content Grid**: Filter tabs (`All`, `Sub`, `Dub`, `Trending`, `Chinese`, `Random`) and dynamic Leaderboard sidebar (`Day`, `Week`, `Month`).
- **Estimated Schedule**: Dynamic timetable grouping airing shows by release day.
- **Infinite Scrolling**: Paginated catalog loading with auto-failover to AniList.

### 2. Detail Page (`DetailPage.jsx`)
- **Comprehensive Metadata**: Airing dates, studios, genres, duration, and score rankings.
- **Trailer Playback**: High-resolution embedded trailer player.
- **Character Cast**: Grid of characters with Japanese/English voice actors and character avatars.
- **Streaming Action**: Direct "Watch Now" routing to the streaming engine.
- **Recommendations**: Dynamically curated related anime suggestions.

### 3. Watch Page (`WatchPage.jsx`)
- **Vidstack Player**: Low-latency HLS stream player with keyboard shortcuts, volume remember, and fullscreen mode.
- **Episode Selector**: Tabbed episode list with instant episode switching.
- **Server Switching**: Multi-source provider failover when a video stream source is slow.

### 4. Search Page (`SearchPage.jsx`)
- **Debounced Search**: 600ms debounced input querying thousands of titles without spamming APIs.
- **Anime & Manga Toggle**: Switch between anime catalog (Jikan/AniList) and manga catalog (Kitsu).

### 5. Authentication Page (`AuthPage.tsx`)
- **Smooth Form Switcher**: GSAP animated transition between "Welcome Back" (Sign In) and "Create Account" (Sign Up).
- **Descriptive Error Messaging**: Inline error alerts rendering server-validated explanations.

---

## ⚙️ Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | URL of the Django backend API |
| `VITE_JIKAN_BASE_URL` | `https://api.jikan.moe/v4` | Public Jikan API v4 endpoint |
| `VITE_JIKAN_API_URL` | `https://api.jikan.moe/v4` | Direct client Jikan fallback endpoint |
| `VITE_APP_NAME` | `AnimeStreamer` | Application display title |
| `VITE_ENABLE_DEV_TOOLS` | `true` | Enable dev tools in development |

### Backend (`backend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.development` | Django settings environment |
| `SECRET_KEY` | *(django secret key)* | Application cryptography secret |
| `DEBUG` | `True` | Debug mode (set to `False` in production) |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hostname whitelist |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Allowed frontend origins |
| `DATABASE_URL` | `sqlite:///dev.sqlite3` | Database connection string |
| `REDIS_URL` | `redis://localhost:6379/1` | Redis cache URL |
| `SESSION_COOKIE_SECURE` | `False` | Require HTTPS for session cookies (`True` in prod) |
| `CSRF_COOKIE_SECURE` | `False` | Require HTTPS for CSRF cookies (`True` in prod) |

---

## 📂 Detailed Directory Structure

```text
anime-stremer/
├── backend/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py                 # Core settings, middleware, auth config
│   │   │   ├── development.py          # Dev CORS, SQLite (dev.sqlite3), local cache
│   │   │   └── production.py           # Hardened security, Postgres, Redis
│   │   ├── urls.py                     # Root API routing
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── user/                       # CustomUser model (UUID, role, email)
│   │   ├── auth_system/                # Session login, register, me, CSRF views
│   │   ├── sessions_app/               # Session status & cleanup tasks
│   │   ├── favorites/                  # User favorites model & viewsets
│   │   ├── streaming/                  # Multi-provider streaming extractors
│   │   ├── anime_catalog/              # Catalog helpers & proxies
│   │   └── core/                       # Shared pagination & security headers
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── endpoints.js            # Central API endpoints (Jikan, Kitsu)
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx         # Session auth provider (login, signup, logout)
│   │   │   ├── authStore.ts            # Zustand auth state
│   │   │   └── axiosInterceptor.ts     # Axios instance with CSRF injection
│   │   ├── components/
│   │   │   ├── layout/                 # Header, Footer, MainLayout
│   │   │   └── ui/                     # MagnetButton, LoadingSpinner, SearchBar
│   │   ├── features/
│   │   │   ├── anime-catalog/
│   │   │   │   ├── components/         # FeaturedSlider, MainContentGrid, ColumnsSection
│   │   │   │   ├── pages/              # HomePage, DetailPage, SearchPage, SchedulePage
│   │   │   │   └── services/           # jikanClient.js, animeFallbackService.js
│   │   │   ├── favorites/              # FavoritesPage, FavoritesContext
│   │   │   └── streaming/              # WatchPage, VideoPlayer, streamingService
│   │   ├── routes/
│   │   │   └── AppRouter.tsx           # React Router 7 route definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                            # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
└── README.md                           # Master documentation
```

---

## 🛠️ Troubleshooting & Common Gotchas

### 1. `Vite port 5174 is in use` / CORS Errors
- **Symptom**: Console shows `Access to XMLHttpRequest at 'http://localhost:8000' from origin 'http://localhost:5174' has been blocked by CORS policy`.
- **Fix**: The backend [`development.py`](file:///c:/coding/fun%20project/anime-stremer/backend/config/settings/development.py) includes `CORS_ALLOWED_ORIGIN_REGEXES = [r"^http://localhost:\d+$"]` and whitelists ports `5173`, `5174`, `5175`, and `3000`. If you run on an unusual port, simply add it to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.

### 2. Jikan API Returning 504 Gateway Timeout
- **Symptom**: Console shows `Failed to load resource: the server responded with a status of 504 (Gateway Time-out)`.
- **Fix**: You do not need to do anything! Our [`jikanClient.js`](file:///c:/coding/fun%20project/anime-stremer/frontend/src/features/anime-catalog/services/jikanClient.js) automatically catches 504 and routes to the **AniList GraphQL** fallback service. The page will render normally without errors.

### 3. SQLite Database Locked on Windows
- **Symptom**: `OperationalError: database is locked`.
- **Fix**: Make sure you don't have multiple `runserver` processes running simultaneously in different terminals. The development database is located at `backend/dev.sqlite3`.

### 4. `Request failed with status code 400` on Login
- **Symptom**: Trying to log in with an email that doesn't exist yet.
- **Fix**: Click **"Don't have an account? Sign up"** on the login page to register. Once registered, login will succeed immediately.

---

## 🚀 Production & Docker Deployment

### Docker Compose Quick Start

To launch the full production stack with PostgreSQL, Redis, Django, and Nginx:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Production Checklist
1. Set `DEBUG=False` in backend `.env`.
2. Generate a secure, unique `SECRET_KEY`.
3. Set `SESSION_COOKIE_SECURE=True` and `CSRF_COOKIE_SECURE=True` for HTTPS.
4. Run `python manage.py collectstatic --noinput` to bundle static assets into `staticfiles/`.
5. Run frontend production build: `npm run build` in `frontend/`.

---

## 📄 License

This project is open-source under the MIT License and intended for educational and portfolio demonstration purposes. All anime metadata and media assets belong to their respective creators and licensors.
