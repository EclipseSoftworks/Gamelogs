// pages/api/gamelogs.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const keys = await kv.keys("game:*"); // all game keys
    const logs = [];

    for (const key of keys) {
      const game = await kv.get(key);
      if (game) logs.push(game);
    }

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
