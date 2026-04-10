import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export default async function BookingsPage() {
  const mockUserEmail = "student@example.com";

  const user = await prisma.user.findUnique({
    where: { email: mockUserEmail },
  });

  if (!user) {
    return (
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
        <p>User not found.</p>
      </main>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: {
        in: ["BOOKED", "ATTENDED", "MISSED", "CANCELLED"],
      },
    },
    include: {
      slot: {
        include: {
          zoomRoom: true,
        },
      },
    },
    orderBy: {
      bookedAt: "desc",
    },
    take: 50,
  });

  const now = new Date();

  const upcoming = bookings.filter(
    (booking) =>
      booking.status === "BOOKED" && new Date(booking.slot.startsAt) >= now
  );

  const history = bookings.filter(
    (booking) =>
      booking.status !== "BOOKED" || new Date(booking.slot.startsAt) < now
  );

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">
          View upcoming classes, join Zoom, and manage cancellations.
        </p>
      </div>

      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Upcoming classes</h2>
            <p className="text-sm text-gray-500">
              Your booked live lessons with quick join and cancel actions.
            </p>
          </div>

          <a
            href="/schedule"
            className="px-4 py-2 rounded-lg bg-black text-white w-fit"
          >
            Book more classes
          </a>
        </div>

        <div className="grid gap-4">
          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming classes booked yet.</p>
          ) : (
            upcoming.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{booking.slot.title}</h3>

                  <p className="text-sm text-gray-600">
                    {formatDate(booking.slot.startsAt)} –{" "}
                    {formatTime(booking.slot.endsAt)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Level: {booking.slot.level} · Status: {booking.status}
                  </p>

                  {booking.slot.zoomRoom?.joinUrl && (
                    <p className="text-sm text-green-700 break-all">
                      Zoom: {booking.slot.zoomRoom.joinUrl}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.slot.zoomRoom?.joinUrl && (
                    <a
                      href={booking.slot.zoomRoom.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Join Zoom
                    </a>
                  )}

                  <CancelBookingButton
                    action={`/api/bookings/${booking.id}/cancel`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Booking history</h2>

        <div className="grid gap-4">
          {history.length === 0 ? (
            <p className="text-gray-500">No booking history yet.</p>
          ) : (
            history.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold">{booking.slot.title}</h3>

                  <p className="text-sm text-gray-600">
                    {formatDate(booking.slot.startsAt)} –{" "}
                    {formatTime(booking.slot.endsAt)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Level: {booking.slot.level} · Status: {booking.status}
                  </p>
                </div>

                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm w-fit">
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}