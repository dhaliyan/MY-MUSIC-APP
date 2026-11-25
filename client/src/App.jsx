import { useEffect, useRef, useState } from "react";
import { Search, Play, Pause, Heart, Plus, Music2, SkipBack, SkipForward, Shuffle, Repeat, Download, Share2, ListMusic, MessageCircle, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const genres = ["All", "Pop", "Rock", "Hip-Hop", "Dance", "Bollywood", "Classical"];

function App() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [genre, setGenre] = useState("All");
  const [volume, setVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [liked, setLiked] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [showPlaylists, setShowPlaylists] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    searchMusic("top hits");
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !activeSong) return;
    audioRef.current.src = activeSong.previewUrl || "";
    if (playing) audioRef.current.play().catch(() => setPlaying(false));
  }, [activeSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing && activeSong) audioRef.current.play().catch(() => setPlaying(false));
    else audioRef.current.pause();
  }, [playing]);

  async function searchMusic(term) {
    const cleanTerm = term.trim() || "top hits";
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTerm)}&entity=song&limit=24`);
      const data = await response.json();
      const found = (data.results || []).filter(song => song.previewUrl);
      setSongs(found);
      if (!activeSong && found.length) setActiveSong(found[0]);
    } catch {
      alert("Music could not be loaded. Please check your internet connection.");
    }
  }

  async function loadPlaylists() {
    try {
      const response = await fetch(`${API}/api/playlists`);
      if (response.ok) setPlaylists(await response.json());
    } catch {
      // The music search and player can still be tried if the backend is offline.
      setPlaylists(JSON.parse(localStorage.getItem("myPlaylists") || "[]"));
    }
  }

  async function savePlaylists(next) {
    setPlaylists(next);
    localStorage.setItem("myPlaylists", JSON.stringify(next));
    // Save to MongoDB when the backend is running.
    try {
      await fetch(`${API}/api/playlists/sync`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlists: next })
      });
    } catch { /* Local copy remains available. */ }
  }

  function createPlaylist() {
    const name = prompt("Enter playlist name:");
    if (!name || !name.trim()) return;
    const next = [...playlists, { name: name.trim(), songs: [] }];
    savePlaylists(next);
  }

  function addToPlaylist(song) {
    if (!playlists.length) {
      alert("Create a playlist first.");
      return;
    }
    const name = prompt("Type the playlist name:\n" + playlists.map(p => p.name).join(", "));
    const index = playlists.findIndex(p => p.name.toLowerCase() === (name || "").toLowerCase());
    if (index < 0) return alert("Playlist not found.");
    const next = [...playlists];
    if (!next[index].songs.some(item => item.trackId === song.trackId)) next[index].songs.push(song);
    savePlaylists(next);
    alert("Song added to playlist!");
  }

  function removeFromPlaylist(playlistIndex, trackId) {
    const next = [...playlists];
    next[playlistIndex].songs = next[playlistIndex].songs.filter(song => song.trackId !== trackId);
    savePlaylists(next);
  }

  function toggleLike(song) {
    setLiked(old => old.includes(song.trackId) ? old.filter(id => id !== song.trackId) : [...old, song.trackId]);
  }

  function addComment(song) {
    if (!commentText.trim()) return;
    setComments(old => ({ ...old, [song.trackId]: [...(old[song.trackId] || []), commentText.trim()] }));
    setCommentText("");
  }

  function nextSong(direction = 1) {
    if (!songs.length) return;
    let index = songs.findIndex(song => song.trackId === activeSong?.trackId);
    if (shuffle) index = Math.floor(Math.random() * songs.length);
    else index = (index + direction + songs.length) % songs.length;
    setActiveSong(songs[index]);
    setPlaying(true);
  }

  function handleEnded() {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else nextSong(1);
  }

  function downloadSong(song) {
    const link = document.createElement("a");
    link.href = song.previewUrl;
    link.download = `${song.trackName || "song"}-preview.mp4`;
    link.target = "_blank";
    link.click();
  }

  async function shareSong(song) {
    const url = song.trackViewUrl || song.previewUrl;
    if (navigator.share) {
      try { await navigator.share({ title: song.trackName, text: `Listen to ${song.trackName} by ${song.artistName}`, url }); }
      catch { /* User closed the share sheet. */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Track link copied!");
    }
  }

  function mapTrack(song) {
    return {
      trackId: song.trackId, trackName: song.trackName, artistName: song.artistName,
      collectionName: song.collectionName, artworkUrl100: song.artworkUrl100,
      previewUrl: song.previewUrl, trackViewUrl: song.trackViewUrl
    };
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2 text-2xl font-black"><span className="rounded-xl bg-fuchsia-500 p-2"><Music2 size={22}/></span>TuneBox</div>
          <button onClick={() => setShowPlaylists(!showPlaylists)} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"><ListMusic className="mr-2 inline" size={17}/>My playlists</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5">
        <section className="py-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-fuchsia-400">Your music, your mood</p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-6xl">Find your next <span className="text-fuchsia-400">favorite song.</span></h1>
          <p className="mt-4 max-w-xl text-slate-400">Search songs, explore artists and make a playlist for every mood.</p>
          <form onSubmit={e => { e.preventDefault(); searchMusic(query); }} className="mt-8 flex max-w-2xl gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <Search className="ml-3 mt-2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search song, artist, album or movie..." className="min-w-0 flex-1 bg-transparent px-2 py-2 outline-none"/>
            <button className="rounded-xl bg-fuchsia-500 px-5 py-2 font-bold hover:bg-fuchsia-400">Search</button>
          </form>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Explore music</h2><button onClick={createPlaylist} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"><Plus className="mr-1 inline" size={16}/>Create playlist</button></div>
          <div className="flex flex-wrap gap-2">{genres.map(item => <button key={item} onClick={() => { setGenre(item); searchMusic(item === "All" ? "top hits" : item + " music"); }} className={`rounded-full px-4 py-2 text-sm ${genre === item ? "bg-fuchsia-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>{item}</button>)}</div>
        </section>

        {showPlaylists && <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Your playlists</h2><button onClick={() => setShowPlaylists(false)}><X/></button></div>
          {playlists.length === 0 ? <p className="text-slate-400">No playlists yet. Create one to get started.</p> : playlists.map((list, i) => <div key={i} className="mb-4 rounded-xl bg-black/20 p-4"><h3 className="font-bold">{list.name} <span className="text-sm font-normal text-slate-400">({list.songs.length} songs)</span></h3>{list.songs.map(song => <div key={song.trackId} className="flex items-center justify-between border-t border-white/10 py-2"><span className="text-sm">{song.trackName} – {song.artistName}</span><div className="flex gap-3"><button onClick={() => { setActiveSong(song); setPlaying(true); }} className="text-fuchsia-300"><Play size={17}/></button><button onClick={() => removeFromPlaylist(i, song.trackId)} className="text-slate-400"><X size={17}/></button></div></div>)}</div>)}
        </section>}

        <section className="pb-10">
          <h2 className="mb-5 text-2xl font-bold">Recommended for you <span className="text-sm font-normal text-slate-500">({songs.length} tracks)</span></h2>
          {songs.length === 0 ? <p className="text-slate-400">No tracks found. Try another search.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {songs.map(song => <article key={song.trackId} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:-translate-y-1 hover:bg-white/[0.08]">
              <div className="relative overflow-hidden rounded-xl"><img src={song.artworkUrl100?.replace("100x100", "400x400")} alt="" className="aspect-square w-full object-cover"/><button onClick={() => { setActiveSong(mapTrack(song)); setPlaying(true); }} className="absolute bottom-3 right-3 rounded-full bg-fuchsia-500 p-3 shadow-lg"><Play size={20} fill="white"/></button></div>
              <div className="flex items-start justify-between gap-2 pt-3"><div className="min-w-0"><h3 className="truncate font-bold">{song.trackName}</h3><p className="truncate text-sm text-slate-400">{song.artistName}</p><p className="truncate text-xs text-slate-500">{song.collectionName}</p></div><button onClick={() => toggleLike(song)} className={liked.includes(song.trackId) ? "text-pink-400" : "text-slate-500"}><Heart fill={liked.includes(song.trackId) ? "currentColor" : "none"}/></button></div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><button onClick={() => addToPlaylist(mapTrack(song))} className="text-xs text-slate-300 hover:text-white"><Plus className="mr-1 inline" size={14}/>Playlist</button><button onClick={() => downloadSong(song)} title="Download preview" className="text-slate-400 hover:text-white"><Download size={17}/></button><button onClick={() => shareSong(song)} title="Share" className="text-slate-400 hover:text-white"><Share2 size={17}/></button><button onClick={() => { setActiveSong(mapTrack(song)); setPlaying(false); }} title="Comments" className="text-slate-400 hover:text-white"><MessageCircle size={17}/></button></div>
              {activeSong?.trackId === song.trackId && <div className="mt-3 border-t border-white/10 pt-3"><p className="mb-2 text-xs font-bold text-slate-300">Comments</p>{(comments[song.trackId] || []).map((comment, i) => <p key={i} className="mb-1 text-xs text-slate-400">• {comment}</p>)}<div className="flex gap-1"><input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." className="w-full min-w-0 rounded-lg bg-black/30 px-2 py-2 text-xs outline-none"/><button onClick={() => addComment(song)} className="rounded-lg bg-fuchsia-500 px-2 text-xs">Post</button></div></div>}
            </article>)}
          </div>}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#15131e]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="hidden min-w-0 items-center gap-3 sm:flex sm:w-1/4">{activeSong && <><img src={activeSong.artworkUrl100} className="h-12 w-12 rounded-lg object-cover" alt=""/><div className="min-w-0"><p className="truncate text-sm font-bold">{activeSong.trackName}</p><p className="truncate text-xs text-slate-400">{activeSong.artistName}</p></div></>}</div>
          <div className="flex flex-1 items-center justify-center gap-4"><button onClick={() => setShuffle(!shuffle)} className={shuffle ? "text-fuchsia-400" : "text-slate-400"}><Shuffle size={18}/></button><button onClick={() => nextSong(-1)}><SkipBack size={20}/></button><button onClick={() => { if (!activeSong && songs.length) setActiveSong(mapTrack(songs[0])); setPlaying(!playing); }} className="rounded-full bg-white p-3 text-black">{playing ? <Pause size={19} fill="black"/> : <Play size={19} fill="black"/>}</button><button onClick={() => nextSong(1)}><SkipForward size={20}/></button><button onClick={() => setRepeat(!repeat)} className={repeat ? "text-fuchsia-400" : "text-slate-400"}><Repeat size={18}/></button></div>
          <div className="hidden w-1/4 items-center justify-end gap-2 sm:flex"><span className="text-xs text-slate-400">Vol</span><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-24 accent-fuchsia-500"/></div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={handleEnded}/>
    </div>
  );
}
export default App;
