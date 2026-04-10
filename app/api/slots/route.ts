import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");

  if (!level) {
    return NextResponse.json({ error: "Missing level" }, { status: 400 });
  }

  const slots = await prisma.slot.findMany({
    where: {
      level: level as any,
      slotType: "WEEKDAY_CLASS",
      status: "SCHEDULED",
      startsAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 50,
    include: {
      zoomRoom: true,
    },
  });

  return NextResponse.json(slots);
}