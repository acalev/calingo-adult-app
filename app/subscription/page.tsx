"use client";

import { useEffect, useState } from "react";

type Plan = "monthly" | "annual" | null;

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [activePlan, setActivePlan] = useState<Plan>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem("subscriptionPlan") as Plan;
    if (savedPlan) {
      setActivePlan(savedPlan);
    }
  }, []);

  const handleBuy = () => {
    if (!selectedPlan) return;

    localStorage.setItem("subscriptionPlan", selectedPlan);
    setActivePlan(selectedPlan);
  };

  return (
    <main>
      <h1>Subscription</h1>
      <p>Choose your plan.</p>

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        <div
          style={{
            padding: "16px",
            border: selectedPlan === "monthly" ? "2px solid #111827" : "1px solid #ddd",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          onClick={() => setSelectedPlan("monthly")}
        >
          <h2>Monthly plan</h2>
          <p>1 month access</p>
          <p>₽2,990</p>
        </div>

        <div
          style={{
            padding: "16px",
            border: selectedPlan === "annual" ? "2px solid #111827" : "1px solid #ddd",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          onClick={() => setSelectedPlan("annual")}
        >
          <h2>Annual plan</h2>
          <p>12 months access</p>
          <p>₽24,990</p>
        </div>
      </div>

      <button
        onClick={handleBuy}
        style={{
          marginTop: "24px",
          padding: "12px 20px",
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Buy selected plan
      </button>

      <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
        <h2>Current plan</h2>
        <p>{activePlan ? activePlan : "No active subscription yet."}</p>
      </div>
    </main>
  );
}
