# Anime Streaming Platform - Project Documentation

## 1. Executive Summary
This project is a high-performance, full-stack anime discovery and streaming platform. It allows users to search for anime, view detailed metadata, manage a personalized favorites list, and stream content directly via a custom-built video player. The application leverages modern web technologies to provide a premium, smooth user experience with features like glassmorphism, fluid animations, and robust backend provider orchestration.

---

## 2. Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, Vanilla CSS
- **Animations**: Framer Motion (Transitions), GSAP (Magnetic effects, complex timelines)
- **Data Fetching**: @tanstack/react-query (SWR, caching)
- **Video Playback**: Vidstack & HLS.js (Pro-grade player with HLS support)
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Smooth Scroll**: Lenis

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 (Local file-based database)
- **Security**: JWT (Authentication), BcryptJS (Password hashing), Helmet (Security headers), Express Rate Limit
- **Scraping/API**: @consumet/extensions (Anime provider orchestration)

---

## 3. Project Structure

```text
.
├── backend/                # Express server and database logic
├── frontend/               # React application (Vite-based)
├── README.md               # Quick start guide
├── PROJECT_DOCUMENTATION.md # Comprehensive overview (this file)
├── package.json            # Root configuration for concurrent dev
└── eslint.config.js        # Linting rules
```

### Backend Detailed Structure
```text
backend/
├── middleware/
│   └── auth.js             # JWT verification middleware
├── routes/
│   ├── auth.js             # Login/Signup endpoints
│   └── streaming.js        # Anime info & video source endpoints
├── services/
│   └── consumetService.js  # Provider scraping orchestration & caching
├── database.js             # SQLite initialization & migrations
├── server.js               # Main entry point & API routes
├── favorites.db            # SQLite database file
└── .env                    # Secrets (JWT_SECRET, PORT)
```

### Frontend Detailed Structure
```text
frontend/
├── src/
│   ├── api/                # API clients (Jikan, internal)
│   ├── components/
│   │   ├── anime/          # AnimeCard, VideoPlayer
│   │   ├── layout/         # Header, SmoothScroll
│   │   └── ui/             # Reusable UI (Buttons, SearchBar, Spinners)
│   ├── context/            # Global state (Auth, Favorites)
│   ├── features/
│   │   └── streaming/      # WatchPage specific logic & services
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Main view components
│   ├── services/           # Business logic services
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── routes.jsx          # Router configuration
├── public/                 # Static assets
└── tailwind.config.js      # CSS configuration
```

---

## 4. Backend Deep Dive

### Core Logic
- **`server.js`**: Orchestrates the API. It uses `helmet` for security and `cors` for cross-origin requests. It defines endpoints for Favorites (CRUD) directly and delegates Auth/Streaming to route handlers.
- **`database.js`**: Handles the connection to `favorites.db`. It automatically migrates the schema if needed (e.g., adding `user_id` to the favorites table for multi-user support).
- **`services/consumetService.js`**: The "brain" of the backend. It maintains a `PROVIDER_CHAIN` (Hianime, AnimeKai, etc.) and attempts to fetch data from them sequentially. It includes a 30-minute in-memory cache to prevent redundant scraping.

### API Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/streaming/info?q=...` | Get anime metadata from providers | No |
| GET | `/api/streaming/watch/:id` | Get video sources (M3U8) | No |
| GET | `/api/favorites` | Get user's favorite list | Yes |
| POST | `/api/favorites` | Add anime to favorites | Yes |
| DELETE| `/api/favorites/:id` | Remove from favorites | Yes |

---

## 5. Frontend Deep Dive

### State Management
- **AuthContext**: Manages JWT storage (localStorage) and user authentication state.
- **FavoritesContext**: Manages the local state of the user's favorite anime, syncing with the backend.
- **React Query**: Used for all external data fetching (Jikan API for search/home, internal API for streaming).

### Key Pages
- **HomePage**: Displays trending and popular anime using the Jikan API. Features GSAP-powered horizontal scrolling and parallax effects.
- **SearchPage**: Provides a robust search interface with real-time results.
- **DetailPage**: Shows comprehensive info about an anime, including episodes, cast, and trailers.
- **WatchPage**: The core streaming interface. Integrates the `VideoPlayer` component with provider selection and episode switching.
- **AuthPage**: Elegant Login/Signup forms with Framer Motion transitions.

### Components
- **VideoPlayer**: A premium wrapper around Vidstack. Supports quality switching, HLS playback, and custom UI controls.
- **AnimeCard**: A reusable card component with hover animations and metadata display.
- **SmoothScroll**: Implements Lenis for a "boutique" scrolling experience.

---

## 6. Database Schema

### `users` table
- `id`: Primary Key
- `username`: Unique string
- `email`: Unique string
- `password`: Hashed string
- `created_at`: Timestamp

### `favorites` table
- `id`: Primary Key
- `user_id`: Foreign Key (references users)
- `anime_id`: External ID (MAL/Consumet)
- `title`: Anime title
- `image_url`: Image link
- `added_at`: Timestamp
- `UNIQUE(user_id, anime_id)`: Prevents duplicate favorites per user.

---

## 7. Configuration & Environment
- **`.env` (Backend)**:
  - `PORT`: Server port (default 5000)
  - `JWT_SECRET`: Secret key for signing tokens
- **`.env` (Frontend)**:
  - `VITE_API_BASE_URL`: URL of the backend server

---

## 8. Summary of Every Folder
- **`backend/middleware/`**: Functions that run before route handlers (e.g., checking if a user is logged in).
- **`backend/routes/`**: Grouped API endpoints based on feature (Auth, Streaming).
- **`backend/services/`**: Complex business logic decoupled from route handlers.
- **`frontend/src/api/`**: Axios instances and pre-defined fetch calls.
- **`frontend/src/components/ui/`**: Low-level "atoms" like buttons and spinners used throughout the app.
- **`frontend/src/features/`**: Modularized features that could potentially be moved to different projects (e.g., a standalone streaming module).
- **`node_modules/`**: Contains external libraries (excluded from source documentation).
