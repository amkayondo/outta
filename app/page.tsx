"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function Home() {
  const [currentWord, setCurrentWord] = useState<{ word: string; phonetic: string; meaning: string; pronunciation: string } | null>(null);
  const { data: savedWordCount } = api.words.getSavedCount.useQuery();
  const saveWordMutation = api.words.saveWord.useMutation();

  useEffect(() => {
    fetchRandomWord();
  }, []);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch("https://random-word-api.herokuapp.com/word?number=1");
      const [randomWord] = await response.json();
      
      const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
      const data = await definitionResponse.json();
      
      if (data && data[0]) {
        setCurrentWord({
          word: data[0].word,
          phonetic: data[0].phonetic || "",
          meaning: data[0].meanings[0]?.definitions[0]?.definition || "No definition available",
          pronunciation: "Damn, mini! That's the pronunciation."
        });
      } else {
        setCurrentWord({
          word: randomWord,
          phonetic: "",
          meaning: "No definition available",
          pronunciation: "Damn, mini! No pronunciation available."
        });
      }
    } catch (error) {
      console.error("Error fetching random word:", error);
    }
  };

  const handleSaveWord = async () => {
    if (currentWord) {
      try {
        await saveWordMutation.mutateAsync({ word: currentWord.word });
        fetchRandomWord();
      } catch (error) {
        console.error("Error saving word:", error);
      }
    }
  };

  const pronounceWord = () => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      window.speechSynthesis.speak(utterance);
    }
  };

  const shareWord = () => {
    if (currentWord) {
      const shareText = `Check out this word: ${currentWord.word}\nMeaning: ${currentWord.meaning}\nLearn more at: ${window.location.href}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Word details copied to clipboard! Share it with your friends.");
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-12 text-center">
          Word of the Moment
        </h1>
        <div className="mb-12 w-full max-w-md border border-gray-200 p-6 rounded-lg shadow-sm">
          <p className="text-5xl font-light text-center mb-4">{currentWord ? currentWord.word : "Generating..."}</p>
          {currentWord && (
            <>
              <p className="text-xl text-center text-gray-500 mb-2">{currentWord.phonetic}</p>
              <p className="text-lg text-center text-gray-600">{currentWord.meaning}</p>
              <p className="text-md text-center text-gray-400 mt-2">{currentWord.pronunciation}</p>
            </>
          )}
          <div className="flex justify-center mt-4 space-x-2">
            <button 
              onClick={pronounceWord}
              className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out"
            >
              🔊 Listen
            </button>
            <button 
              onClick={shareWord}
              className="bg-green-500 text-white font-medium py-2 px-4 rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
            >
              📋 Share
            </button>
          </div>
        </div>
        <button 
          onClick={handleSaveWord}
          className="bg-blue-500 text-white font-medium py-2 px-6 rounded-full mb-12 hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Save & New Word
        </button>
        <div className="mb-12 border border-gray-200 p-4 rounded-lg shadow-sm">
          <p className="text-3xl font-light text-center mb-1">{savedWordCount ?? "..."}</p>
          <p className="text-sm text-center text-gray-500">Words collected</p>
        </div>
        <Link href="/words" className="text-lg text-blue-500 hover:underline transition duration-300 ease-in-out">
          View Collection
        </Link>
      </div>
    </main>
  );
}
