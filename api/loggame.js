import { kv } from '@vercel/kv';

const API_SECRET = "530de30ba9e58acefc969ed7e9f7fbbfd1f8795f24671e9086ecda3016d883f1b7a59149f6f0167a0c06645e08c1f334b5b36ffbd2a058fd60149ffe0501f32b89";


const API_SECRET = "YOUR_SECRET_HERE"; // replace with your long key

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { secret, universeId, placeId, serverId } = req.body;
  if (secret !== API_SECRET)
    return res.status(403).json({ error: "Forbidden" });

  try {
    // Fetch verified game data from Roblox
    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameJson = await gameRes.json();
    const info = gameJson?.data?.[0];
    if (!info) return res.status(404).json({ error: "Game not found" });

    // Fetch game thumbnail
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`
    );
    const thumbJson = await thumbRes.json();
    const imageUrl = thumbJson?.data?.[0]?.imageUrl || "";

    // Store or update in Vercel KV
    await kv.set(`game:${universeId}`, {
      universeId,
      placeId,
      name: info.name,
      playing: info.playing,
      imageUrl,
      lastUpdated: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
