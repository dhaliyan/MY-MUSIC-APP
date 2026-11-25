# TuneBox – Music Streaming App

A beginner-friendly MERN music app starter built with React, Express, MongoDB and Tailwind CSS.

## Features
- Search tracks by song or artist using the iTunes Search API
- Browse recommended tracks and genres
- Play 30-second previews with play/pause, next/previous, shuffle, repeat and volume
- Create playlists and add/remove tracks
- Like tracks and write comments
- Download the available preview audio (where the browser/API permits)
- Share a track using the device share menu or copy its link

> Important: iTunes preview URLs are short previews, not full songs. Use music you own or have permission to distribute. This project does not bypass DRM or download copyrighted full tracks.

## Run locally

### 1. Start MongoDB
Install MongoDB locally or create a free MongoDB Atlas database.

### 2. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Put your MongoDB connection string in `server/.env`.

### 3. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Deploy
- Frontend: deploy the `client` folder to Netlify. Set `VITE_API_URL` to your deployed backend URL.
- Backend: deploy the `server` folder to Render. Set `MONGO_URI`, `CLIENT_URL` and `PORT` environment variables.
- Do not commit `.env` files or passwords to GitHub.
