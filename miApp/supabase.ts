import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://hkphcloyxywagkgvloci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcGhjbG95eHl3YWdrZ3Zsb2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTE1NjYsImV4cCI6MjA5MTYyNzU2Nn0.OWxwwxBFLCPumvK7byNrayjUKgbTwaeB1Rqe9qbaQjA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/* no tocar, esto es nuestra conexion con la base de datos en supa base, si esto se toca entonces el programa no funciona en su totalidad */