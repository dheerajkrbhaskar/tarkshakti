'use client'

import Header from "@/components/header";
import Footer from "@/components/footer";
import Landing from "@/components/landing";

import { useUserAuth } from "@/contexts/user-auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export  default  function Home() {
  const router =  useRouter()
  const {user, loading} = useUserAuth()



  useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard'); // redirect only after loading finishes
        }
    }, [loading, user, router]);

    if (loading) return null; // prevent flicker / render nothing while checking


  //server side auth checking(faster)
  // const supabase = await createSupabaseServerClient()
  // const {data:{user}} = await supabase.auth.getUser();
  // if (user) redirect('/dashboard');

  return (
    <main className="flex min-h-screen flex-col scroll-smooth">
      <Header />
      <Landing />
      <Footer />
    </main>
  );
}
