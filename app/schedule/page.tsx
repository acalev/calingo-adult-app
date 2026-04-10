import { prisma } from "@/lib/prisma";
import CancelBookingButton from "./CancelBookingButton";

export default async function SchedulePage() {
  const mockUserEmail = "student@example.com";

  const user = await prisma.user.findUnique({
    where: { email: mockUserEmail },
  });

  if (!user) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        <p>No test user found. Create a user with email: {mockUserEmail}</p>
      </main>
    );
  }

  if (!user.level) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        <p>User has no CEFR level yet.</p>
      </main>
    );
  }

  const slots = await prisma.slot.findMany({
    where: {
      level: user.level,
      slotType: "WEEKDAY_CLASS",
      status: "SCHEDULED",
      startsAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 30,
    include: {
      bookings: {
        where: {
          userId: user.id,
          status: {
            in: ["BOOKED", "ATTENDED", "MISSED"],
          },
        },
      },
      waitlistEntries: {
        where: {
          userId: user.id,
          status: {
            in: ["ACTIVE", "NOTIFIED"],
          },
        },
      },
      zoomRoom: true,
    },
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Schedule</h1>
      <p className="mb-6 text-gray-600">
        Showing upcoming {user.level} weekday classes.
      </p>

      <div className="grid gap-4">
        {slots.map((slot) => {
          const seatsLeft = slot.seatCap - slot.bookedCount;
          const activeBooking = slot.bookings[0];
          const alreadyBooked = !!activeBooking;
          const alreadyWaitlisted = slot.waitlistEntries.length > 0;
          const isFull = seatsLeft <= 0;

          return (
            <div
              key={slot.id}
              className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-lg">{slot.title}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(slot.startsAt).toLocaleString("en-RU", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    –{" "}
                    {new Date(slot.endsAt).toLocaleTimeString("en-RU", {
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Level: {slot.level} · Seats left: {Math.max(seatsLeft, 0)} /{" "}
                    {slot.seatCap}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {alreadyBooked ? (
                    <>
                      <span className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm">
                        Booked
                      </span>
                      <CancelBookingButton action={`/api/bookings/${activeBooking.id}/cancel`} />
                    </>
                  ) : alreadyWaitlisted ? (
                    <span className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm">
                      Waitlisted
                    </span>
                  ) : isFull ? (
                    <form action={`/api/waitlist`} method="POST">
                      <input type="hidden" name="slotId" value={slot.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
                      >
                        Join Waitlist
                      </button>
                    </form>
                  ) : (
                    <form action={`/api/bookings`} method="POST">
                      <input type="hidden" name="slotId" value={slot.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-black text-white"
                      >
                        Book
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {alreadyBooked && slot.zoomRoom ? (
                <p className="text-xs text-green-700">
                  Zoom: {slot.zoomRoom.joinUrl}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Zoom link becomes visible after booking.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}