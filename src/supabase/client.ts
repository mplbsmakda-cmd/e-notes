import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation } from 'react-query';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook for table operations
export const useTable = (tableName: string) => {
    return useQuery([tableName], async () => {
        const { data, error } = await supabase.from(tableName).select();
        if (error) throw new Error(error.message);
        return data;
    });
};

// Hook for row operations
export const useRow = (tableName: string, id: string) => {
    return useQuery([tableName, id], async () => {
        const { data, error } = await supabase.from(tableName).select().eq('id', id);
        if (error) throw new Error(error.message);
        return data;
    });
};
