"use client";

export default function CancelBookingButton({
  action,
}: {
  action: string;
}) {
  return (
    <form
      action={action}
      method="POST"
      onSubmit={(e) => {
        const ok = window.confirm("Cancel this booking?");
        if (!ok) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-red-600 text-white"
      >
        Cancel
      </button>
    </form>
  );
}