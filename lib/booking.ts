import { prisma } from "@/lib/prisma";
import { BookingStatus, WaitlistStatus } from "@prisma/client";

export async function promoteFirstWaitlistedUser(slotId: string) {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) return null;

    if (slot.bookedCount >= slot.seatCap) return null;

    const nextWaitlistEntry = await tx.waitlistEntry.findFirst({
      where: {
        slotId,
        status: WaitlistStatus.ACTIVE,
      },
      orderBy: {
        position: "asc",
      },
    });

    if (!nextWaitlistEntry) return null;

    const existingBooking = await tx.booking.findUnique({
      where: {
        userId_slotId: {
          userId: nextWaitlistEntry.userId,
          slotId,
        },
      },
    });

    if (!existingBooking) {
      await tx.booking.create({
        data: {
          userId: nextWaitlistEntry.userId,
          slotId,
          status: BookingStatus.BOOKED,
          promotedFromWaitlist: true,
        },
      });

      await tx.slot.update({
        where: { id: slotId },
        data: {
          bookedCount: {
            increment: 1,
          },
        },
      });
    }

    await tx.waitlistEntry.update({
      where: { id: nextWaitlistEntry.id },
      data: {
        status: WaitlistStatus.NOTIFIED,
      },
    });

    await tx.slot.update({
      where: { id: slotId },
      data: {
        waitlistCount: {
          decrement: 1,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: nextWaitlistEntry.userId,
        type: "WAITLIST_OPENED",
        status: "UNREAD",
        title: "Seat opened for your class",
        body: "You were moved from the waitlist into a booked class.",
      },
    });

    return nextWaitlistEntry;
  });
}