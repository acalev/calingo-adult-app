"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  time: string;
  level: string;
};

export default function ProgressPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quizScore, setQuizScore] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const savedQuizScore = localStorage.getItem("quizScore");
    const savedPlan = localStorage.getItem("subscriptionPlan");
    const savedBalance = localStorage.getItem("walletBalance");

    setBookings(savedBookings);
    setQuizScore(savedQuizScore);
    setSubscriptionPlan(savedPlan);
    setWalletBalance(savedBalance ? Number(savedBalance) : 5000);
  }, []);

  const levelProgress = 42;
  const examReadiness = quizScore ? Math.min(Number(quizScore), 100) : 0;

  return (
    <main>
      <h1>Progress</h1>
      <p>Your learning dashboard.</p>

      <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Level progress</h2>
          <p>{levelProgress}% complete</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Classes booked</h2>
          <p>{bookings.length}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Latest quiz score</h2>
          <p>{quizScore ? `${quizScore}%` : "No quiz completed yet."}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Exam readiness</h2>
          <p>{examReadiness}%</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Subscription</h2>
          <p>{subscriptionPlan ? `Active: ${subscriptionPlan}` : "No active subscription"}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Wallet balance</h2>
          <p>{walletBalance} coins</p>
        </div>
      </div>
    </main>
  );
}
