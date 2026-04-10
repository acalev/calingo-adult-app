// app/api/payments/mock-confirm/route.ts
import { prisma } from "@/lib/prisma";
import {
  NotificationStatus,
  NotificationType,
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const paymentId = String(formData.get("paymentId") || "");
    const userId = String(formData.get("userId") || "");

    if (!paymentId || !userId) {
      return NextResponse.json(
        { error: "Missing paymentId or userId" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.userId !== userId) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      return NextResponse.redirect(
        new URL(`/subscription/success?userId=${userId}`, req.url)
      );
    }

    const plan: SubscriptionPlan =
      payment.amountRub >= 99900 ? SubscriptionPlan.ANNUAL : SubscriptionPlan.MONTHLY;

    const startsAt = new Date();
    const endsAt = new Date(startsAt);

    if (plan === SubscriptionPlan.MONTHLY) {
      endsAt.setMonth(endsAt.getMonth() + 1);
    } else {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCEEDED,
          paidAt: new Date(),
        },
      });

      await tx.subscription.updateMany({
        where: {
          userId,
          status: {
            in: [
              SubscriptionStatus.ACTIVE,
              SubscriptionStatus.PENDING,
              SubscriptionStatus.GRACE_PERIOD,
            ],
          },
        },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          autoRenew: false,
        },
      });

      await tx.subscription.create({
        data: {
          userId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          startsAt,
          endsAt,
          autoRenew: true,
          sourcePaymentId: paymentId,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.SUBSCRIPTION_UPDATE,
          status: NotificationStatus.UNREAD,
          title: "Subscription activated",
          body:
            plan === SubscriptionPlan.MONTHLY
              ? "Your monthly subscription is now active."
              : "Your annual subscription is now active.",
          actionUrl: `/subscription/success?userId=${userId}`,
        },
      });
    });

    return NextResponse.redirect(
      new URL(`/subscription/success?userId=${userId}`, req.url)
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to confirm payment",
      },
      { status: 500 }
    );
  }
}