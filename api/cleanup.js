import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://suuwatvyyvsdtqjnwlse.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dXdhdHZ5eXZzZHRxam53bHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwNDE4MCwiZXhwIjoyMDcxOTgwMTgwfQ.GPkIJTrUkCv6g61BVuodxtYqHvYX8ZlMBfPGz5vgjfM"
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { GameID, PlaceID, ImageURL, Playing } = req.body;

    const { data: existing } = await supabase
      .from("gamelogs")
      .select("*")
      .eq("GameID", GameID)
      .single();

    if (existing) {
      await supabase
        .from("gamelogs")
        .update({ Playing, updated_at: new Date() })
        .eq("GameID", GameID);
    } else {
      await supabase.from("gamelogs").insert([
        {
          GameID,
          PlaceID,
          ImageURL,
          Playing,
          updated_at: new Date(),
        },
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
