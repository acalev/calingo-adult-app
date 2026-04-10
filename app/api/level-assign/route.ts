import { prisma } from "@/lib/prisma";
import { CEFRLevel, NotificationStatus, NotificationType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, testScore } = await req.json();

    if (!userId || typeof testScore !== "number" || testScore < 0 || testScore > 100) {
      return NextResponse.json(
        { error: "Missing or invalid userId/testScore (0-100)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, level: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: `User not found: ${userId}` },
        { status: 404 }
      );
    }

    const level = scoreToCefrLevel(testScore);

    const studyPlan = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          level,
          testScore: Math.round(testScore),
          placementTestTakenAt: new Date(),
        },
      });

      return tx.studyPlan.upsert({
        where: { userId },
        update: {
          level,
          weeklyTargetClasses: level === "A1" ? 5 : 10,
          weeklyTargetWords: level === "A1" ? 20 : 50,
          firstVocabularyPack: `${level.toLowerCase()}-basics`,
        },
        create: {
          userId,
          level,
          weeklyTargetClasses: level === "A1" ? 5 : 10,
          weeklyTargetWords: level === "A1" ? 20 : 50,
          firstVocabularyPack: `${level.toLowerCase()}-basics`,
        },
      });
    });

    await prisma.notification.create({
      data: {
        userId,
        type: NotificationType.NEWS,
        status: NotificationStatus.UNREAD,
        title: `Your level is ${level}`,
        body: `Your study plan is ready with a target of ${studyPlan.weeklyTargetClasses} classes per week.`,
        actionUrl: `/study-plan?userId=${userId}`,
      },
    });

    return NextResponse.json({
      success: true,
      level,
      studyPlan,
    });
  } catch (error) {
    console.error("level-assign error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to assign level",
      },
      { status: 500 }
    );
  }
}

function scoreToCefrLevel(score: number): CEFRLevel {
  if (score < 20) return "A1";
  if (score < 40) return "A2";
  if (score < 60) return "B1";
  if (score < 80) return "B2";
  if (score < 95) return "C1";
  return "C2";
}