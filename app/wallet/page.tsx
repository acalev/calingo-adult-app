"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  type: string;
  amount: number;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(5000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "Referral reward", amount: 2000 },
    { id: 2, type: "Promo bonus", amount: 3000 },
  ]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);

  useEffect(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    const savedTransactions = localStorage.getItem("walletTransactions");
    const savedPlan = localStorage.getItem("subscriptionPlan");

    if (savedBalance) setBalance(Number(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedPlan) setSubscriptionPlan(savedPlan);
  }, []);

  const payWithWallet = (plan: "monthly" | "annual") => {
    const prices = {
      monthly: 2990,
      annual: 24990,
    };

    const price = prices[plan];

    if (balance < price) {
      alert("Not enough coins in wallet.");
      return;
    }

    const newBalance = balance - price;
    const newTransaction = {
      id: Date.now(),
      type: `Wallet payment for ${plan} plan`,
      amount: -price,
    };

    const updatedTransactions = [newTransaction, ...transactions];

    setBalance(newBalance);
    setTransactions(updatedTransactions);
    setSubscriptionPlan(plan);

    localStorage.setItem("walletBalance", String(newBalance));
    localStorage.setItem("walletTransactions", JSON.stringify(updatedTransactions));
    localStorage.setItem("subscriptionPlan", plan);
  };

  return (
    <main>
      <h1>Wallet</h1>
      <p>Your internal wallet coins.</p>

      <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Current balance</h2>
          <p>{balance} coins</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Pay with wallet</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
            <button
              onClick={() => payWithWallet("monthly")}
              style={{
                padding: "10px 16px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Pay monthly (2990)
            </button>

            <button
              onClick={() => payWithWallet("annual")}
              style={{
                padding: "10px 16px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Pay annual (24990)
            </button>
          </div>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Current subscription</h2>
          <p>{subscriptionPlan ? subscriptionPlan : "No active subscription"}</p>
        </div>

        <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "12px" }}>
          <h2>Wallet history</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <ul>
              {transactions.map((tx) => (
                <li key={tx.id}>
                  {tx.type}: {tx.amount > 0 ? "+" : ""}
                  {tx.amount} coins
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
