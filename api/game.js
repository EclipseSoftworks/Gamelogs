import kv from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const universeIds = await kv.smembers('active_games') || [];
    const currentTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    const games = [];

    for (const universeId of universeIds) {
      const key = `game:${universeId}`;
      const data = await kv.get(key);

      if (data && data.timestamp > currentTime - timeout) {
        games.push(data);
      } else {
        // Clean up expired
        await kv.del(key);
        await kv.srem('active_games', universeId);
      }
    }

    return res.status(200).json({ games });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
