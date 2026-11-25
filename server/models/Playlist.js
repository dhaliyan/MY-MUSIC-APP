import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  trackId: Number,
  trackName: String,
  artistName: String,
  collectionName: String,
  artworkUrl100: String,
  previewUrl: String,
  trackViewUrl: String
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songs: [songSchema]
}, { timestamps: true });

export default mongoose.model("Playlist", playlistSchema);
