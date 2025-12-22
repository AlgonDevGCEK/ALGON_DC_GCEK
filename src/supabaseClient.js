import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://omqrlshawfaqhcpqjflb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXJsc2hhd2ZhcWhjcHFqZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDI1NDAsImV4cCI6MjA4MTgxODU0MH0.YH_sonP1DhEbHgUEIzGlmhepf24Af-kV0jG3cdAdaHU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey,  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY);