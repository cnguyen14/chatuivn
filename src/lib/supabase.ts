import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: number;
  session_id: string;
  created_at: string;
}

export interface WebhookSettings {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_variables: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export default supabase;
