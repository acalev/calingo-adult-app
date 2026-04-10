import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  NotificationStatus,
  NotificationType,
  SubscriptionStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const slotId = String(formData.get("slotId") || "");
    const userId = String(formData.get("userId") || "");

    if (!slotId || !userId) {
      return NextResponse.json({ error: "Missing slotId or userId" }, { status: 400 });
    }

    const now = new Date();

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: { endsAt: "desc" },
    });

    if (!activeSubscription) {
      return NextResponse.redirect(
        new URL(`/subscription?userId=${userId}`, req.url)
      );
    }

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_slotId: {
          userId,
          slotId,
        },
      },
    });

    if (
      existingBooking &&
      [BookingStatus.BOOKED, BookingStatus.ATTENDED, BookingStatus.MISSED].includes(
        existingBooking.status
      )
    ) {
      return NextResponse.json(
        { error: "You already booked this slot" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const freshSlot = await tx.slot.findUnique({
        where: { id: slotId },
        select: { id: true, bookedCount: true, seatCap: true },
      });

      if (!freshSlot) {
        throw new Error("Slot not found");
      }

      if (freshSlot.bookedCount >= freshSlot.seatCap) {
        throw new Error("Slot is full");
      }

      if (existingBooking && existingBooking.status === BookingStatus.CANCELLED) {
        await tx.booking.update({
          where: { id: existingBooking.id },
          data: {
            status: BookingStatus.BOOKED,
            cancelledAt: null,
            promotedFromWaitlist: false,
          },
        });
      } else if (!existingBooking) {
        await tx.booking.create({
          data: {
            userId,
            slotId,
            status: BookingStatus.BOOKED,
          },
        });
      }

      await tx.slot.update({
        where: { id: slotId },
        data: {
          bookedCount: {
            increment: 1,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.CLASS_BOOKED,
          status: NotificationStatus.UNREAD,
          title: "Class booked",
          body: "Your class was booked successfully.",
          actionUrl: `/bookings?userId=${userId}`,
        },
      });
    });

    return NextResponse.redirect(
      new URL(`/schedule?userId=${userId}`, req.url)
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Booking failed",
      },
      { status: 400 }
    );
  }
}