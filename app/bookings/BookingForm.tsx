"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingForm() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [level, setLevel] = useState("A1");
  const [seatsLeft, setSeatsLeft] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time,
          level,
          seatsLeft,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create booking");
      }

      setTime("");
      setLevel("A1");
      setSeatsLeft(10);
      router.refresh();
    } catch (err) {
      setError("Could not create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#ffffff",
        color: "#111827",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ margin: "0 0 16px 0", fontSize: "24px", fontWeight: 700 }}>
        Create Booking
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Time
          </label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="2026-04-10T18:00:00+03:00"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Seats Left
          </label>
          <input
            type="number"
            value={seatsLeft}
            onChange={(e) => setSeatsLeft(Number(e.target.value))}
            min={0}
            max={10}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>

      {error ? (
        <p style={{ color: "#dc2626", marginTop: "12px" }}>{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: "16px",
          background: "#111827",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Booking"}
      </button>
    </form>
  );
}