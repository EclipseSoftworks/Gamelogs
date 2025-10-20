import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://suuwatvyyvsdtqjnwlse.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dXdhdHZ5eXZzZHRxam53bHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwNDE4MCwiZXhwIjoyMDcxOTgwMTgwfQ.GPkIJTrUkCv6g61BVuodxtYqHvYX8ZlMBfPGz5vgjfM"
);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("gamelogs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
