import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const slotId = String(formData.get("slotId") || "");
    const userId = String(formData.get("userId") || "");

    if (!slotId || !userId) {
      return NextResponse.json({ error: "Missing slotId or userId" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findUnique({
        where: {
          userId_slotId: { userId, slotId },
        },
      });

      if (existingBooking) {
        throw new Error("You already booked this slot");
      }

      const existingWaitlist = await tx.waitlistEntry.findUnique({
        where: {
          userId_slotId: { userId, slotId },
        },
      });

      if (existingWaitlist) {
        throw new Error("You are already on the waitlist for this slot");
      }

      const slot = await tx.slot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new Error("Slot not found");
      }

      if (slot.bookedCount < slot.seatCap) {
        throw new Error("Slot still has seats, book it directly");
      }

      const lastEntry = await tx.waitlistEntry.findFirst({
        where: { slotId },
        orderBy: { position: "desc" },
      });

      const nextPosition = lastEntry ? lastEntry.position + 1 : 1;

      const waitlistEntry = await tx.waitlistEntry.create({
        data: {
          userId,
          slotId,
          position: nextPosition,
        },
      });

      await tx.slot.update({
        where: { id: slotId },
        data: {
          waitlistCount: {
            increment: 1,
          },
        },
      });

      return waitlistEntry;
    });

    return NextResponse.redirect(new URL("/schedule", req.url));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Waitlist failed" },
      { status: 400 }
    );
  }
}