# Anime Streaming Project - API Documentation

This document lists all the essential API endpoints used for video streaming, metadata extraction, and user data persistence.

## 1. Streaming & Extraction APIs (Scrapers)
These endpoints interact with the `consumetService` to pull live data from external providers.

### **GET** `/api/streaming/info`
- **Description**: Searches for an anime and retrieves its metadata and episode list.
- **Query Params**: `q` (Anime Title)
- **Example**: `/api/streaming/info?q=one piece`
- **Returns**: JSON object with title, image, description, and an array of `episodes`.

### **GET** `/api/streaming/watch/:episodeId`
- **Description**: Extracts the actual video source URLs and subtitles for a specific episode.
- **Params**: `episodeId` (The unique ID from the episode list)
- **Query Params**: 
  - `provider` (optional, default: `Hianime`)
  - `subOrDub` (optional, default: `sub`)
- **Example**: `/api/streaming/watch/one-piece-episode-1`
- **Returns**: JSON with `sources` (m3u8/mp4 links), `subtitles`, and `provider` info.

---

## 2. Database APIs (User Environment)
These endpoints manage the persistent state in the SQLite database (`backend/favorites.db`). All these routes require a valid JWT token in the `Authorization` header.

### **GET** `/api/favorites`
- **Description**: Retrieves all anime favorited by the logged-in user.
- **Returns**: Array of favorite objects sorted by most recent.

### **POST** `/api/favorites`
- **Description**: Adds an anime to the user's personal favorites list.
- **Body**:
  ```json
  {
    "anime_id": "string",
    "title": "string",
    "image_url": "string",
    "score": number,
    "episodes": number
  }
  ```

### **DELETE** `/api/favorites/:anime_id`
- **Description**: Removes an anime from the user's favorites.

---

## 3. Authentication APIs
Used for managing user accounts and securing the environment.

### **POST** `/api/auth/signup`
- **Description**: Registers a new user.
- **Body**: `username`, `email`, `password`.

### **POST** `/api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Body**: `email`, `password`.
- **Returns**: `token` and user profile.

---

## Environment Configuration
The project uses `.env` files to manage connection strings:
- **Backend**: `backend/.env` (PORT, JWT_SECRET)
- **Frontend**: `frontend/.env` (VITE_API_URL)
