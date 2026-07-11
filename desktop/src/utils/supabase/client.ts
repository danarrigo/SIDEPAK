import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvjtlvmcqzhmqajgpinc.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2anRsdm1jcXpobXFhamdwaW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDM2OTAsImV4cCI6MjA5Nzg3OTY5MH0.a-U3yYllXCKu9YEhloFa4EmWcJK9QpXa8IK9S25Uuew";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
