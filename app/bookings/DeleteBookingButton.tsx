"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBookingButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this booking?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }

      router.refresh();
    } catch (error) {
      alert("Could not delete booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        marginTop: "12px",
        background: "#dc2626",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        padding: "8px 12px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}