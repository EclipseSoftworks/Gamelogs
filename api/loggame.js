import fetch from "node-fetch";

// 🔒 Your private API key (keep this secret, don’t share!)
const API_SECRET = "530de30ba9e58acefc969ed7e9f7fbbfd1f8795f24671e9086ecda3016d883f1b7a59149f6f0167a0c06645e08c1f334b5b36ffbd2a058fd60149ffe0501f32b89";

// Temporary in-memory storage (resets on redeploy)
global.gamelogs = global.gamelogs || [];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { secret, universeId, placeId, serverId } = req.body;

  // ✅ Compare using your hardcoded API key
  if (secret !== API_SECRET) return res.status(403).send("Forbidden");

  try {
    // Fetch verified game data from Roblox
    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameJson = await gameRes.json();
    const info = gameJson?.data?.[0];
    if (!info) return res.status(404).send("Game not found");

    // Fetch game thumbnail
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`
    );
    const thumbJson = await thumbRes.json();
    const imageUrl = thumbJson?.data?.[0]?.imageUrl || "";

    // Update or insert into global memory
    const existing = global.gamelogs.find(g => g.universeId === universeId);
    if (existing) {
      existing.playing = info.playing;
      existing.imageUrl = imageUrl;
      existing.lastUpdated = new Date().toISOString();
    } else {
      global.gamelogs.push({
        universeId,
        placeId,
        name: info.name,
        playing: info.playing,
        imageUrl,
        lastUpdated: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error logging game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
