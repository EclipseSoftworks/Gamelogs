import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://suuwatvyyvsdtqjnwlse.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dXdhdHZ5eXZzZHRxam53bHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwNDE4MCwiZXhwIjoyMDcxOTgwMTgwfQ.GPkIJTrUkCv6g61BVuodxtYqHvYX8ZlMBfPGz5vgjfM"
);

module.exports = async (req, res) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const { error } = await supabase
    .from("gamelogs")
    .delete()
    .lt("updated_at", tenMinutesAgo);

  if (error) res.status(500).json({ error: error.message });
  else res.status(200).json({ success: true });
};
