import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Drawing = {
  id: string;
  title: string;
  grid_data: number[][];
  grid_size: number;
  palette_name: string;
  created_at: string;
  updated_at: string;
  is_permanent: boolean;
};
