# TuneBox – Beginner MERN Music App

A beginner-friendly music streaming assessment project using React, Tailwind CSS, Node.js, Express and MongoDB.

## Features
- Recommended songs and genre browsing.
- Search songs by song title, artist, album or movie soundtrack title.
- Create playlists, view them, add songs and remove songs.
- Play/pause, previous/next, shuffle, repeat and volume controls.
- Like tracks and post comments in the current browser session.
- Share tracks through the device share menu or copy a link.
- Download available preview clips where the provider/browser permits it.
- Save playlists through the Express API to MongoDB, with local storage fallback.

## Important limitations
The iTunes Search API supplies short preview clips, not full high-quality songs. This app does not bypass DRM or download copyrighted full tracks. Likes and comments currently use React state and reset on refresh. Instagram does not offer a general web URL that auto-posts to a feed; use the device share sheet where available. There is no login yet. The playlist sync endpoint is a simple single-user demo and must be redesigned with authentication before production use. The player uses the browser's built-in audio element.

## Folder structure
```text
music-app/
  client/src/App.jsx       Main React page and app logic
  client/src/main.jsx     React entry point
  client/src/style.css    Tailwind CSS entry
  client/package.json     Frontend dependencies and commands
  server/server.js        Express server and MongoDB connection
  server/models/Playlist.js MongoDB playlist schema
  server/routes/playlists.js Playlist API routes
  server/package.json     Backend dependencies and commands
```

## Setup commands
Install Node.js LTS, VS Code and MongoDB (local MongoDB or MongoDB Atlas).

### Backend terminal
```bash
cd server
npm install
```
Create `server/.env` from `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tunebox
CLIENT_URL=http://localhost:5173
```
Start backend:
```bash
npm run dev
```
Keep this terminal running.

### Frontend terminal
Open a second terminal:
```bash
cd client
npm install
```
Create `client/.env` from `.env.example`:
```env
VITE_API_URL=http://localhost:5000
```
Start frontend:
```bash
npm run dev
```
Open the Vite URL, usually `http://localhost:5173`.

## Commands explained
| Command | Meaning |
|---|---|
| `cd server` | Move into the backend folder |
| `cd client` | Move into the frontend folder |
| `npm install` | Install dependencies from package.json |
| `npm run dev` | Start the development server |
| `npm start` | Start backend in normal mode |
| `npm run build` | Build the frontend for deployment |
| `git init` | Start Git tracking |
| `git add .` | Stage project files |
| `git commit -m "first commit"` | Save a Git version |
| `git branch -M main` | Name the main branch |
| `git remote add origin URL` | Connect the local project to GitHub |
| `git push -u origin main` | Upload code to GitHub |

## Code walkthrough

### `client/src/main.jsx`
- `import React` loads React.
- `ReactDOM` connects React to the browser.
- `App` imports the main application component.
- `style.css` loads Tailwind styles.
- `getElementById("root")` finds the root element in `index.html`.
- `render()` displays the App component inside that element.

### `client/src/App.jsx`
This is the main frontend file.
- `useState` stores values that change, such as songs, search text, selected song, volume and playlists.
- `useEffect` runs code after rendering. It loads initial songs/playlists and reacts to playback changes.
- `useRef` gives React access to the audio element.
- `searchMusic()` calls the iTunes API and puts returned tracks into state.
- `loadPlaylists()` asks the backend for playlists.
- `savePlaylists()` updates the screen, stores a local backup and sends playlist data to the backend.
- `createPlaylist()` asks for a name and creates a playlist.
- `addToPlaylist()` finds a playlist and adds a track.
- `removeFromPlaylist()` removes a track using its ID.
- `toggleLike()` adds/removes a track ID from the liked list.
- `addComment()` adds a comment to the selected track in this session.
- `nextSong()` selects another track; shuffle chooses a random index.
- `handleEnded()` repeats the current song or moves to the next one.
- `downloadSong()` asks the browser to download the preview URL. The provider may restrict it.
- `shareSong()` opens the device share menu or copies the URL.
- The JSX after the functions builds the header, search box, genres, playlists, song cards and bottom player.
- `map()` creates one song card for each item in the songs array.
- `onClick` runs a function when a button is pressed; `onChange` updates state when an input changes.
- Tailwind classes such as `rounded-xl`, `p-4`, `bg-white/10` and `text-slate-400` control styling.

### `server/server.js`
- `express()` creates the backend application.
- `cors()` allows the frontend to call the backend from another origin.
- `express.json()` reads JSON request bodies.
- `dotenv.config()` loads values from `.env`.
- `mongoose.connect()` connects Node.js to MongoDB.
- `app.get("/")` creates a simple health-check route.
- `app.use("/api/playlists", playlistRoutes)` attaches playlist endpoints.
- `app.listen()` starts the server after MongoDB connects.

### `server/models/Playlist.js`
- `mongoose.Schema()` describes the structure of database documents.
- `songSchema` describes song fields saved inside a playlist.
- `name` stores the playlist name and is required.
- `songs` stores an array of song objects.
- `mongoose.model()` creates the Playlist model for database operations.

### `server/routes/playlists.js`
- `express.Router()` creates a group of routes.
- `GET /api/playlists` reads playlists from MongoDB.
- `POST /api/playlists/sync` receives the playlist list from the frontend.
- `deleteMany({})` clears the demo collection before the new list is saved.
- `insertMany()` inserts the received playlists.
- `try/catch` catches database errors and returns an error response.

The sync endpoint is intentionally simple for a beginner demo. It replaces the whole collection, so it is not suitable for multiple users. A real application needs user accounts and per-user playlist CRUD routes.

## Push to GitHub
Create an empty GitHub repository, then run these commands from the project root:
```bash
git init
git add .
git commit -m "Create TuneBox music app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
Do not upload `.env`; `.gitignore` excludes it.

## Deploy backend on Render
1. Connect your GitHub repository to a new Render Web Service.
2. Set Root Directory to `server`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add `MONGO_URI` (MongoDB Atlas connection string) and `CLIENT_URL` (your Netlify URL).

## Deploy frontend on Netlify
1. Import the GitHub repository into Netlify.
2. Set Base directory to `client`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add environment variable `VITE_API_URL` with your deployed Render API URL.
6. Redeploy and test the live website.

Before submitting, test the frontend and backend, confirm Netlify can reach Render, and be ready to explain the code and its limitations.
