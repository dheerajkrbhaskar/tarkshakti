'use client'

import { UserAuthContextProvider, useUserAuth } from "@/contexts/user-auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function MainLayout({ children }: { children: React.ReactNode; }) {
    const { user, loading } = useUserAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/'); 
        }
    }, [loading, user, router]);

    if (loading || !user) return null; 
    

    return <>{children}</>;
}