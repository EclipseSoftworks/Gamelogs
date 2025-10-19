import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Get all keys starting with "game:"
  const keys = await kv.keys("game:*");
  const logs = [];
  for (const key of keys) {
    const game = await kv.get(key);
    if (game) logs.push(game);
  }

  res.status(200).json(logs);
}
