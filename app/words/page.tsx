"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export default function Home() {
  const { data: latestWord } = api.words.getLatest.useQuery();
  const { data: savedWordCount } = api.words.getSavedCount.useQuery();
  const { data: previousWords } = api.words.getPreviousWords.useQuery({ limit: 5 });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Word of the Day</h1>
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-3xl mb-2">{latestWord?.word || "Loading..."}</p>
          <p className="text-sm opacity-70">Latest word</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-3xl mb-2">{savedWordCount !== undefined ? savedWordCount : "Loading..."}</p>
          <p className="text-sm opacity-70">Words saved so far</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Previous Words</h2>
          <ul className="list-disc list-inside">
            {previousWords?.map((word, index) => (
              <li key={index} className="text-xl mb-2">{word}</li>
            ))}
          </ul>
        </div>
        <Link href="/words" className="text-xl underline">View All Words</Link>
      </div>
    </main>
  );
}
