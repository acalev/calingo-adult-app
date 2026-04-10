import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StudyPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-slate-900">Study Plan</h1>
          <div className="bg-red-50 text-slate-900 border border-red-200 p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Missing userId</h2>
            <p className="text-lg text-slate-700">
              Open this page with a valid query string.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const data = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        level: true,
        testScore: true,
        placementTestTakenAt: true,
      },
    });

    const plan = await tx.studyPlan.findUnique({
      where: { userId },
      select: {
        level: true,
        weeklyTargetClasses: true,
        weeklyTargetWords: true,
        nextRecommendedSlotId: true,
        firstVocabularyPack: true,
        notes: true,
      },
    });

    return { user, plan };
  });

  if (!data.user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-slate-900">Study Plan</h1>
          <div className="bg-red-50 text-slate-900 border border-red-200 p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">User not found</h2>
            <p className="text-lg text-slate-700">No user exists for id: {userId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data.user.level || !data.plan) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-slate-900">Study Plan</h1>
          <div className="bg-yellow-50 text-slate-900 border border-yellow-200 p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Take Entry Test First</h2>
            <p className="mb-6 text-lg text-slate-700">
              Complete your placement test to get assigned to A1-C2 level.
            </p>
            <a
              href="https://calingo.ru/test"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold"
            >
              Start Test
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Your Study Plan</h1>
          <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-3xl text-slate-900">
            <div className="text-5xl font-black text-emerald-700 mb-4">
              {data.user.level}
            </div>
            <p className="text-2xl text-emerald-800 mb-2">
              Test Score: {data.user.testScore ?? "—"}%
            </p>
            <p className="text-lg text-emerald-700">{data.user.fullName}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white text-slate-900 border border-slate-200 p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-slate-900">This Week</h3>
            <div className="space-y-4 text-lg">
              <div className="text-slate-800">
                <span className="font-mono text-2xl text-slate-900">
                  {data.plan.weeklyTargetClasses}
                </span>{" "}
                Classes
              </div>
              <div className="text-slate-800">
                <span className="font-mono text-2xl text-slate-900">
                  {data.plan.weeklyTargetWords}
                </span>{" "}
                New Words
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-900 border border-slate-200 p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-slate-900">Start Here</h3>
            <div className="space-y-3">
              {data.plan.firstVocabularyPack && (
                <Link
                  href="/study"
                  className="block p-4 border border-blue-200 rounded-xl hover:bg-blue-50 text-slate-900"
                >
                  📚 {data.plan.firstVocabularyPack}
                </Link>
              )}
              <Link
                href="/schedule"
                className="block w-full bg-blue-600 text-white p-4 rounded-xl text-center font-semibold"
              >
                📅 Book First Class
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}