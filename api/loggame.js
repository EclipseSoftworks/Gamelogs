import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const API_SECRET = process.env.API_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { secret, universeId, placeId } = req.body;
  if (secret !== API_SECRET) return res.status(403).json({ error: "Forbidden" });

  try {
    // Fetch verified game info
    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const info = (await gameRes.json()).data?.[0];
    if (!info) return res.status(404).json({ error: "Game not found" });

    // Fetch thumbnail
    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
    const imageUrl = (await thumbRes.json()).data?.[0]?.imageUrl || "";

    // Upsert into Supabase
    const { error } = await supabase
      .from('gamelogs')
      .upsert({
        universeId,
        placeId,
        name: info.name,
        playing: info.playing,
        imageUrl,
        lastUpdated: new Date().toISOString()
      }, { onConflict: 'universeId' });

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
