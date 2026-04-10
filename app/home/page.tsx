"use client";

import { useEffect, useState } from "react";
import { getSavedLanguage } from "../../lib/getLanguage";
import { translations, Language } from "../../lib/translations";

type Booking = {
  id: number;
  time: string;
  level: string;
};

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<string | null>(null);

  useEffect(() => {
    const savedLanguage = getSavedLanguage() as Language;
    setLanguage(savedLanguage);

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(savedBookings);

    const savedPlan = localStorage.getItem("subscriptionPlan");
    setSubscriptionPlan(savedPlan);

    const savedBalance = localStorage.getItem("walletBalance");
    setWalletBalance(savedBalance ? Number(savedBalance) : 5000);

    const savedQuizScore = localStorage.getItem("quizScore");
    setQuizScore(savedQuizScore);
  }, []);

  const t = translations[language];

  return (
    <main>
      <h1>{t.home.title}</h1>
      <p>{t.home.selectedLanguage}: {language}</p>
      <p>{t.home.welcome}</p>

      <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>{t.home.level}</h2>
          <p>A2</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>{t.home.nextClass}</h2>
          <p>{bookings.length > 0 ? bookings[0].time : "Today at 19:00 MSK"}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>{t.home.weeklyTarget}</h2>
          <p>{t.home.targetText}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>{t.home.streak}</h2>
          <p>{t.home.streakText}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>My bookings</h2>
          {bookings.length === 0 ? (
            <p>No booked classes yet.</p>
          ) : (
            <ul>
              {bookings.map((booking) => (
                <li key={booking.id}>
                  {booking.time} · {booking.level}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Subscription status</h2>
          <p>{subscriptionPlan ? `Active: ${subscriptionPlan}` : "No active subscription"}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Wallet balance</h2>
          <p>{walletBalance} coins</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Latest quiz score</h2>
          <p>{quizScore ? `${quizScore}%` : "No quiz completed yet."}</p>
        </div>
      </div>
    </main>
  );
}
