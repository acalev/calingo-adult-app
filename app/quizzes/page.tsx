"use client";

import { useState } from "react";

const quizQuestions = [
  {
    id: 1,
    question: 'Choose the correct sentence:',
    options: [
      'She go to work every day.',
      'She goes to work every day.',
      'She going to work every day.',
    ],
    correctAnswer: 'She goes to work every day.',
  },
  {
    id: 2,
    question: 'Choose the correct translation of "яблоко":',
    options: ['Banana', 'Apple', 'Orange'],
    correctAnswer: 'Apple',
  },
  {
    id: 3,
    question: 'Which word is a verb?',
    options: ['Run', 'Blue', 'Table'],
    correctAnswer: 'Run',
  },
];

export default function QuizzesPage() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;

    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quizQuestions.length) * 100);
    setScore(finalScore);
    localStorage.setItem("quizScore", String(finalScore));
  };

  return (
    <main>
      <h1>Quizzes</h1>
      <p>Complete today’s mini quiz.</p>

      <div style={{ display: "grid", gap: "24px", marginTop: "24px" }}>
        {quizQuestions.map((q) => (
          <div
            key={q.id}
            style={{
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "12px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{q.question}</h2>

            <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
              {q.options.map((option) => (
                <label key={option} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleSelect(q.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "24px",
          padding: "12px 20px",
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Submit quiz
      </button>

      {score !== null && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>Your result</h2>
          <p>{score}%</p>
        </div>
      )}
    </main>
  );
}
