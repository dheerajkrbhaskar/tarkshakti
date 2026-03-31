'use client';

import Image from "next/image";
import { useState } from "react";
import ChooseTopic from "@/components/choose-topic";

export default function Landing() {

  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <section className="flex flex-col lg:flex-row min-h-screen">

      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 lg:px-20 py-16">

        <div className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
          <p>Learn</p>
          <p>new concepts</p>
          <p>for each <span className="text-accent">question</span></p>
        </div>

        <p className="text-lg mb-8 text-foreground/70 max-w-md">
          We help you learn faster with fun and interactive quizzes designed to improve your understanding.
        </p>

        <div className="flex gap-4">
          <button
            className="bg-accent text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            onClick={() => setMenuVisible(!menuVisible)}
          >
            Quick Start
          </button>
          <a className="border border-foreground/20 px-6 py-3 rounded-lg hover:border-accent hover:text-accent transition">
            Learn More
          </a>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
        <Image
          src="/coverImage.png"
          alt="Quiz Illustration"
          width={600}
          height={600}
          className="object-contain"
          loading="eager"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      {menuVisible && <ChooseTopic setMenuVisible={setMenuVisible} />}
    </section>
  );
}