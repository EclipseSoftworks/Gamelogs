import kv from '@vercel/kv';

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}

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
    const gamesResponse = await fetchWithRetry(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gamesData = await gamesResponse.json();
    const gameInfo = gamesData.data[0];

    if (!gameInfo) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const name = gameInfo.name;
    const playing = gameInfo.playing;

    // Fetch thumbnail
    let thumbnail = '';
    try {
      const thumbsResponse = await fetchWithRetry(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=PNG&isCircular=false`);
      const thumbsData = await thumbsResponse.json();
      thumbnail = thumbsData.data[0]?.imageUrl || '';
    } catch (error) {
      console.warn(`Thumbnail fetch failed: ${error.message}`);
      // Continue without thumbnail
    }

    // Store or update
    const key = `game:${universeId}`;
    const data = {
      universeId,
      placeId,
      name,
      playing,
      thumbnail,
      timestamp: Date.now()
    };

    await kv.set(key, data);
    await kv.sadd('active_games', universeId);

    console.log(`Updated game ${universeId}: ${name}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
