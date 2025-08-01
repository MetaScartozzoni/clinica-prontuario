import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evymdirordklgqtfucdp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eW1kaXJvcmRrbGdxdGZ1Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg2MDEsImV4cCI6MjA2MzE2NDYwMX0.EVecSBaZFOoRmEMgbPEHPIwYwuLKlVWX5bjOQ7JGpmg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);