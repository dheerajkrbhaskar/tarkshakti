'use client'

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

type SupabaseSchema = Record<string, any>

let client: SupabaseClient<SupabaseSchema> | null = null

export function getSupabaseBrowserClient() : SupabaseClient<SupabaseSchema> {
    //return existing supabase client if it exists, otherwise create a new one
    if(client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

    if(!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase URL or Key. Please check your environment variables.");
    }

    client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseKey);
    return client;
}