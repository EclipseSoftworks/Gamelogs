// pages/api/gamelogs.js
global.gamelogs = global.gamelogs || [];

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  res.status(200).json(global.gamelogs);
}
