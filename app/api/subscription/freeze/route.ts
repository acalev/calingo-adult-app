import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = String(formData.get("userId") || "");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
    }

    const frozenFrom = new Date();

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.FROZEN,
        frozenFrom,
        autoRenew: false,
      },
    });

    return NextResponse.redirect(
      new URL(`/subscription?userId=${userId}`, req.url)
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Freeze failed" },
      { status: 500 }
    );
  }
}