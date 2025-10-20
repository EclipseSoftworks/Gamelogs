// Use 'node-fetch@2' for compatibility with Vercel's Node.js 18.x runtime
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors'); // <-- This package is the CORS fix

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // <-- This line *applies* the CORS fix. It allows your website to make requests.
app.use(express.json()); // <-- This allows the server to read JSON from Roblox

// This is our in-memory "database" to store active games
const activeGames = new Map();

// 5 minutes in milliseconds
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// --- Endpoint 1: Receives data from Roblox ---
// This is your '/api/update' endpoint
app.post('/api/update', async (req, res) => {
  const { universeId, placeId } = req.body;

  if (!universeId || !placeId) {
    return res.status(400).json({ error: 'Missing universeId or placeId' });
  }

  try {
    // 1. Get Game Details (Name, Players)
    const gameDetailsResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameDetailsData = await gameDetailsResponse.json();
    
    // 2. Get Game Icon
    const iconResponse = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
    const iconData = await iconResponse.json();

    // Extract the needed data
    const gameInfo = gameDetailsData?.data[0];
    const iconInfo = iconData?.data[0];

    if (!gameInfo || !iconInfo || iconInfo.state !== 'Completed') {
      return res.status(404).json({ error: 'Game data not found or icon not ready.' });
    }

    // Store or update the game data
    activeGames.set(universeId.toString(), {
      placeId: placeId,
      universeId: universeId,
      name: gameInfo.name,
      playing: gameInfo.playing,
      imageUrl: iconInfo.imageUrl,
      lastUpdated: Date.now(), // Store the timestamp
    });

    res.status(200).json({ success: true, name: gameInfo.name });

  } catch (error) {
    console.error('Error fetching game data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Endpoint 2: Sends data to your website ---
// This is your '/api/games' endpoint
app.get('/api/games', (req, res) => {
  const now = Date.now();
  
  // Prune old entries (games not updated in 5 minutes)
  for (const [universeId, game] of activeGames.entries()) {
    if (now - game.lastUpdated > FIVE_MINUTES_MS) {
      activeGames.delete(universeId);
    }
  }

  // Convert the Map values to an array for the frontend
  const gamesList = Array.from(activeGames.values());
  res.status(200).json(gamesList);
});

// Export the app for Vercel
module.exports = app;
