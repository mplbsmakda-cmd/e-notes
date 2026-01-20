import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_ANON_KEY'; // Replace with your Supabase anon key

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email: string, password: string) => {
    const { user, error } = await supabase.auth.signIn({ email, password });
    return { user, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return error;
};

export const getUser = () => {
    return supabase.auth.user();
};