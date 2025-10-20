import kv from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameid: universeId, placeid: placeId } = req.body;

  if (!universeId || !placeId) {
    return res.status(400).json({ error: 'Missing gameid or placeid' });
  }

  try {
    // Fetch game details
    const gamesResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gamesData = await gamesResponse.json();
    const gameInfo = gamesData.data[0];

    if (!gameInfo) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const name = gameInfo.name;
    const playing = gameInfo.playing;

    // Fetch thumbnail
    const thumbsResponse = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
    const thumbsData = await thumbsResponse.json();
    const thumbnail = thumbsData.data[0]?.imageUrl || '';

    // Store or update
    const key = `game:${universeId}`;
    const data = {
      placeId,
      name,
      playing,
      thumbnail,
      timestamp: Date.now()
    };

    await kv.set(key, data);
    await kv.sadd('active_games', universeId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
