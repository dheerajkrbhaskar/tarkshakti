
"use client";

import { createContext, createElement, useState, useEffect, useContext, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/db/supabase/browser-client";

const supabase = getSupabaseBrowserClient();

interface UserAuthContextType {
    user: any | null;
    loading: boolean;
    signout: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initializeSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            // console.log("access_token: ", data.session?.access_token);
            // console.log("refresh_token: ", data.session?.refresh_token);

            if (!isMounted) {
                return;
            }

            if (error) {
                setUser(null);
                setLoading(false);
                return;
            }

            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        initializeSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) {
                return;
            }

            setUser(session?.user ?? null);
        });

        return () => {
            isMounted = false;
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        signout: async () => {
            await supabase.auth.signOut();
            setUser(null);
        }
    };

    return createElement(UserAuthContext.Provider, { value }, children);
};

export const useUserAuth = () => {
    const context = useContext(UserAuthContext);

    if (!context) {
        throw new Error("useUserAuth must be used within a UserAuthContextProvider");
    }

    return context;
}
