import { createClient } from "@supabase/supabase-js";

// same Supabase config
const SUPABASE_URL = "https://suuwatvyyvsdtqjnwlse.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dXdhdHZ5eXZzZHRxam53bHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwNDE4MCwiZXhwIjoyMDcxOTgwMTgwfQ.GPkIJTrUkCv6g61BVuodxtYqHvYX8ZlMBfPGz5vgjfM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  const { data } = await supabase.from("games").select("*");

  for (const game of data) {
    const updated = new Date(game.updated_at).getTime();
    if (now - updated > tenMinutes) {
      await supabase.from("games").delete().eq("GameId", game.GameId);
    }
  }

  res.json({ success: true });
}
