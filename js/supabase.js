// ==========================================
// MARKET INSIGHT — SUPABASE CONFIGURATION
// ==========================================

// Load Supabase JS v2
const { createClient } = window.supabase;

// Project Configuration
const SUPABASE_URL = 'https://ddzwmiqvsmphwwehdhxt.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sMlfvN5dg4omUi3Nes6EwQ_rZIAsG9G';

// Initialize Supabase Client
const miSupabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        db: {
            schema: 'public'
        },
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Global Access
window.miSupabase = miSupabase;

console.log('MARKET INSIGHT: Supabase initialized.');
