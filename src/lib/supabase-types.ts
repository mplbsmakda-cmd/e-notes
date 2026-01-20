// supabase-types.ts

// Types for Supabase Tables

export type User = {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
};

export type Post = {
    id: string;
    title: string;
    content: string;
    user_id: string;
    created_at: string;
    updated_at: string;
};

export type Comment = {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export type Profile = {
    id: string;
    username: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
};

export type OtherTable = {
    // Define other tables here
};