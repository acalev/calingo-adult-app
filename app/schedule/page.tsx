"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: number;
  time: string;
  level: string;
  seatsLeft: number;
  booked: boolean;
  waitlisted: boolean;
};

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, time: "09:00 MSK", level: "A2", seatsLeft: 3, booked: false, waitlisted: false },
    { id: 2, time: "09:30 MSK", level: "A2", seatsLeft: 0, booked: false, waitlisted: false },
    { id: 3, time: "10:00 MSK", level: "A2", seatsLeft: 5, booked: false, waitlisted: false },
    { id: 4, time: "10:30 MSK", level: "A2", seatsLeft: 1, booked: false, waitlisted: false },
    { id: 5, time: "11:00 MSK", level: "A2", seatsLeft: 0, booked: false, waitlisted: false },
  ]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    setSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        booked: savedBookings.some((b: Slot) => b.id === slot.id),
      }))
    );
  }, []);

  const handleBook = (id: number) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id && slot.seatsLeft > 0 && !slot.booked) {
          const updatedSlot = {
            ...slot,
            seatsLeft: slot.seatsLeft - 1,
            booked: true,
          };

          const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
          localStorage.setItem(
            "bookings",
            JSON.stringify([...existingBookings, updatedSlot])
          );

          return updatedSlot;
        }
        return slot;
      })
    );
  };

  const handleWaitlist = (id: number) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.seatsLeft === 0 && !slot.waitlisted
          ? {
              ...slot,
              waitlisted: true,
            }
          : slot
      )
    );
  };

  return (
    <main>
      <h1>Schedule</h1>
      <p>Book your next class. Weekday classes run every 30 minutes.</p>

      <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
        {slots.map((slot) => (
          <div
            key={slot.id}
            style={{
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "12px",
            }}
          >
            <h2 style={{ margin: "0 0 8px" }}>{slot.time}</h2>
            <p style={{ margin: "4px 0" }}>Level: {slot.level}</p>
            <p style={{ margin: "4px 0" }}>Seats left: {slot.seatsLeft}</p>

            {slot.booked ? (
              <button
                disabled
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#d1fae5",
                  border: "1px solid #10b981",
                  borderRadius: "8px",
                }}
              >
                Booked
              </button>
            ) : slot.seatsLeft > 0 ? (
              <button
                onClick={() => handleBook(slot.id)}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#111827",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Book class
              </button>
            ) : slot.waitlisted ? (
              <button
                disabled
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px",
                }}
              >
                Waitlisted
              </button>
            ) : (
              <button
                onClick={() => handleWaitlist(slot.id)}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
              >
                Join waitlist
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
