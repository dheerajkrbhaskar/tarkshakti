import Header from "@/components/header";
import Landing from "@/components/landing";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col h-screen ">
      <Header />
      <Landing />
    </main>
  );
}
