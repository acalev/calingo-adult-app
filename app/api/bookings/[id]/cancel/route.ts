import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  NotificationStatus,
  NotificationType,
} from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== BookingStatus.BOOKED) {
      return NextResponse.json(
        { error: "Only booked classes can be cancelled" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: {
          bookedCount: {
            decrement: 1,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.userId,
          type: NotificationType.CLASS_CANCELLED,
          status: NotificationStatus.UNREAD,
          title: "Class cancelled",
          body: "Your booking was cancelled successfully.",
          actionUrl: "/bookings",
        },
      });
    });

    return NextResponse.redirect(new URL("/bookings", req.url));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Cancellation failed",
      },
      { status: 400 }
    );
  }
}