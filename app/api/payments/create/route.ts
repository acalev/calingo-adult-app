import { prisma } from "@/lib/prisma";
import { PaymentProvider, PaymentStatus, SubscriptionPlan } from "@prisma/client";
import { NextResponse } from "next/server";

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  MONTHLY: 9990,
  ANNUAL: 99900,
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const userId = String(formData.get("userId") || "");
    const plan = String(formData.get("plan") || "") as SubscriptionPlan;

    if (!userId || !["MONTHLY", "ANNUAL"].includes(plan)) {
      return NextResponse.json({ error: "Invalid userId or plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amountRub = PLAN_PRICES[plan];

    const payment = await prisma.payment.create({
      data: {
        userId,
        provider: PaymentProvider.MANUAL,
        status: PaymentStatus.PENDING,
        amountRub,
        description: `${plan} subscription for ${user.fullName}`,
      },
    });

    return NextResponse.redirect(
      new URL(`/subscription/checkout?paymentId=${payment.id}&userId=${userId}`, req.url)
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}