import express from "express";
import Playlist from "../models/Playlist.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: "Could not load playlists" });
  }
});

// Beginner-friendly sync endpoint: saves the playlist list to MongoDB.
router.post("/sync", async (req, res) => {
  try {
    const incoming = Array.isArray(req.body.playlists) ? req.body.playlists : [];
    await Playlist.deleteMany({});
    const saved = await Playlist.insertMany(incoming.map(item => ({
      name: item.name,
      songs: item.songs || []
    })));
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Could not save playlists" });
  }
});

export default router;
