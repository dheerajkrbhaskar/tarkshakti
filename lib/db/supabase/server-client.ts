import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function createSupabaseServerClient() {

    if(!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase URL or Key. Please check your environment variables.");
    }

    //Access cookis from header
    //await because nextjs app router uses streaming,
    // async rendering, edge runtime, 
    // so we need to wait for the cookies 
    // to be available before creating the client
    const cookieStore = await cookies();

    const client = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                //pass cookies to supabase(read session, validate user)
                getAll() {
                    const allCookies = cookieStore.getAll();
                    return allCookies;
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(cookie =>
                            cookieStore.set(cookie.name, cookie.value, cookie.options)
                        );
                    } catch (error) {
                        console.error("Error setting cookies:", error);
                    }
                }

            }
        })

    return client;
}