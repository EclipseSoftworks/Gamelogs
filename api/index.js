// Use 'node-fetch@2' for compatibility with CommonJS and Vercel's Node.js 18.x runtime
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');

const app = express();

// --- CONFIG ---
const ALLOWED_ORIGINS = [
  'https://gamelogs-six.vercel.app', // your frontend
  'http://localhost:3000',           // local testing
];

// --- MIDDLEWARE ---
app.use(express.json());

// --- CORS FIX ---
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// --- IN-MEMORY DB ---
const activeGames = new Map();
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// --- /api/update ---
app.post('/api/update', async (req, res) => {
  const { universeId, placeId } = req.body;

  if (!universeId || !placeId) {
    return res.status(400).json({ error: 'Missing universeId or placeId' });
  }

  try {
    // Fetch Roblox game data and icon
    const [gameDetailsResponse, iconResponse] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
      fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`)
    ]);

    const [gameDetailsData, iconData] = await Promise.all([
      gameDetailsResponse.json(),
      iconResponse.json()
    ]);

    const gameInfo = gameDetailsData?.data?.[0];
    const iconInfo = iconData?.data?.[0];

    if (!gameInfo || !iconInfo || iconInfo.state !== 'Completed') {
      return res.status(404).json({ error: 'Game data not found or icon not ready.' });
    }

    // Store data in memory
    activeGames.set(universeId.toString(), {
      placeId,
      universeId,
      name: gameInfo.name,
      playing: gameInfo.playing,
      imageUrl: iconInfo.imageUrl,
      lastUpdated: Date.now(),
    });

    return res.status(200).json({ success: true, name: gameInfo.name });
  } catch (error) {
    console.error('Error fetching game data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- /api/games ---
app.get('/api/games', (req, res) => {
  const now = Date.now();

  // Auto-clean expired entries
  for (const [universeId, game] of activeGames.entries()) {
    if (now - game.lastUpdated > FIVE_MINUTES_MS) {
      activeGames.delete(universeId);
    }
  }

  res.status(200).json(Array.from(activeGames.values()));
});

// --- EXPORT FOR VERCEL ---
module.exports = app;
