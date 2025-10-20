import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

// 🔧 EDIT THESE
const SUPABASE_URL = "https://suuwatvyyvsdtqjnwlse.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dXdhdHZ5eXZzZHRxam53bHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwNDE4MCwiZXhwIjoyMDcxOTgwMTgwfQ.GPkIJTrUkCv6g61BVuodxtYqHvYX8ZlMBfPGz5vgjfM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { GameId, PlaceId } = req.body;
    if (!GameId || !PlaceId) return res.status(400).json({ error: "Missing IDs" });

    // 1️⃣ Get Universe ID
    const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${GameId}/universe`);
    const uniData = await uniRes.json();
    const universeId = uniData.universeId;
    if (!universeId) throw new Error("No Universe ID found");

    // 2️⃣ Get Game Info
    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameData = await gameRes.json();
    const game = gameData.data[0];
    const playing = game.playing;

    // 3️⃣ Get Thumbnail
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`
    );
    const thumbData = await thumbRes.json();
    const imageUrl = thumbData.data[0].imageUrl;

    // 4️⃣ Save / Update in Supabase
    await supabase
      .from("games")
      .upsert({
        GameId,
        PlaceId,
        ImageURL: imageUrl,
        Playing: playing,
        updated_at: new Date().toISOString(),
      });

    res.json({ success: true, universeId, playing, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
