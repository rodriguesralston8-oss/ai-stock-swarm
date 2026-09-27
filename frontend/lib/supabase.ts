import { createClient } from '@supabase/supabase-js';

// The fallback string guarantees the Docker build NEVER crashes
const url = "https://fguaiblbdzvpyoijjlzb.supabase.co" || "https://placeholder.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndWFpYmxiZHp2cHlvaWpqbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzcwMjYsImV4cCI6MjEwNTkxMzAyNn0.00_r0bZ33XcHeRJ4KK68evTPoZ9kiLDgTpTpBVFcF7A" || "placeholder-anon-key";

export const supabase = createClient(url, key);
