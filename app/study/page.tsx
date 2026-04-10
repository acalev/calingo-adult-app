"use client";

import { useEffect, useState } from "react";

interface Flashcard {
  front: string;
  back: string;
  level: string;
}

const A1_VOCAB: Flashcard[] = [
  { front: "Hello", back: "Привет", level: "A1" },
  { front: "Goodbye", back: "Пока", level: "A1" },
  { front: "Thank you", back: "Спасибо", level: "A1" },
  { front: "Please", back: "Пожалуйста", level: "A1" },
  { front: "Yes", back: "Да", level: "A1" },
  { front: "No", back: "Нет", level: "A1" },
  { front: "Name", back: "Имя", level: "A1" },
  { front: "I am", back: "Я", level: "A1" },
  { front: "You are", back: "Ты", level: "A1" },
  { front: "Water", back: "Вода", level: "A1" },
];

export default function StudyPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"flashcard" | "type" | "match">("flashcard");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    setCards(A1_VOCAB);
  }, []);

  if (cards.length === 0) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Study Area</h1>
          <p>Loading your flashcards...</p>
        </div>
      </main>
    );
  }

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  const handleFlip = () => {
    if (mode === "flashcard") {
      setFlipped((prev) => !prev);
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setUserAnswer("");
    if (isLastCard) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleCheckAnswer = () => {
    if (userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase()) {
      setScore((prev) => prev + 1);
    }
    handleNext();
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Study Area</h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("flashcard");
              setFlipped(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === "flashcard"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Flashcard
          </button>

          <button
            onClick={() => {
              setMode("type");
              setFlipped(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === "type"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Type
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              Card {currentIndex + 1} of {cards.length} · Level {currentCard.level}
            </div>

            <div className="text-sm text-gray-500">
              Score: {score}/{Math.max(currentIndex, 1)}
            </div>
          </div>

          <div className="[perspective:1000px]">
            <div
              onClick={handleFlip}
              className={`relative w-full h-64 cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-100 shadow-lg p-8 text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                <div className="text-2xl md:text-4xl font-bold text-gray-800">
                  {currentCard.front}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-100 shadow-lg p-8 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                <div className="text-2xl md:text-4xl font-bold text-gray-800">
                  {currentCard.back}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            {mode === "flashcard" && (
              <>
                <button
                  onClick={handleFlip}
                  className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-300"
                >
                  {flipped ? "Show English" : "Show Russian"}
                </button>

                {flipped && (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                  >
                    {isLastCard ? "Finish" : "Next Card"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {mode === "type" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Type the translation</h3>

            <div className="space-y-4">
              <div className="text-3xl font-bold text-center p-8 bg-gray-50 rounded-2xl">
                {currentCard.front}
              </div>

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the Russian translation..."
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />

              <div className="flex gap-4">
                <button
                  onClick={handleCheckAnswer}
                  className="flex-1 bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-green-700"
                >
                  Check
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-gray-600"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}