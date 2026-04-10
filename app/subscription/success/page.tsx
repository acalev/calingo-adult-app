import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Link from "next/link";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h1 className="text-2xl font-bold">Subscription</h1>
            <p className="mt-3 text-slate-700">Missing userId.</p>
            <code className="mt-3 block rounded-lg bg-white border p-3 text-sm">
              /subscription?userId=YOUR_USER_ID
            </code>
          </div>
        </div>
      </div>
    );
  }

  const [user, currentSubscription, payments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, level: true },
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.FROZEN, SubscriptionStatus.GRACE_PERIOD],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            User not found.
          </div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription =
    currentSubscription &&
    [SubscriptionStatus.ACTIVE, SubscriptionStatus.GRACE_PERIOD].includes(currentSubscription.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Subscription</h1>
          <p className="mt-2 text-slate-600">
            Manage your plan, renewal settings, and billing history.
          </p>
        </div>

        {currentSubscription ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-900">Current Plan</h2>
                <p className="text-slate-700">
                  <span className="font-semibold">Student:</span> {user.fullName}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Plan:</span> {currentSubscription.plan}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Status:</span> {currentSubscription.status}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Started:</span>{" "}
                  {new Date(currentSubscription.startsAt).toLocaleDateString("ru-RU")}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Ends:</span>{" "}
                  {new Date(currentSubscription.endsAt).toLocaleDateString("ru-RU")}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Auto-renew:</span>{" "}
                  {currentSubscription.autoRenew ? "On" : "Off"}
                </p>

                {currentSubscription.status === SubscriptionStatus.FROZEN && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Your subscription is currently frozen.
                  </div>
                )}

                {!currentSubscription.autoRenew && hasActiveSubscription && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
                    Auto-renew is turned off. Access stays active until the current term ends.
                  </div>
                )}
              </div>

              <div className="grid gap-3 min-w-[240px]">
                {hasActiveSubscription && currentSubscription.autoRenew && (
                  <form action="/api/subscription/cancel" method="POST">
                    <input type="hidden" name="userId" value={userId} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-red-600 px-5 py-4 text-white font-semibold hover:bg-red-700"
                    >
                      Turn Off Auto-Renew
                    </button>
                  </form>
                )}

                {hasActiveSubscription && !currentSubscription.autoRenew && (
                  <form action="/api/subscription/renew" method="POST">
                    <input type="hidden" name="userId" value={userId} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 px-5 py-4 text-white font-semibold hover:bg-emerald-700"
                    >
                      Turn Auto-Renew Back On
                    </button>
                  </form>
                )}

                {currentSubscription.status === SubscriptionStatus.ACTIVE && (
                  <form action="/api/subscription/freeze" method="POST">
                    <input type="hidden" name="userId" value={userId} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-amber-500 px-5 py-4 text-slate-950 font-semibold hover:bg-amber-400"
                    >
                      Freeze Subscription
                    </button>
                  </form>
                )}

                <Link
                  href={`/schedule?userId=${userId}`}
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 font-semibold text-center hover:bg-slate-50"
                >
                  Go to Schedule
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">No Active Subscription</h2>
            <p className="mt-3 text-slate-600">
              Choose a plan to unlock class booking and study access.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold">Monthly</h3>
                <p className="mt-2 text-slate-600">Flexible access billed monthly.</p>
                <div className="mt-4 text-3xl font-black">9,990 ₽</div>
                <form action="/api/payments/create" method="POST" className="mt-6">
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="plan" value="MONTHLY" />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 px-5 py-4 text-white font-semibold hover:bg-blue-700"
                  >
                    Buy Monthly
                  </button>
                </form>
              </div>

              <div className="border-2 border-emerald-300 rounded-2xl p-6">
                <h3 className="text-xl font-bold">Annual</h3>
                <p className="mt-2 text-slate-600">Best value for committed learners.</p>
                <div className="mt-4 text-3xl font-black">99,900 ₽</div>
                <form action="/api/payments/create" method="POST" className="mt-6">
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="plan" value="ANNUAL" />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 px-5 py-4 text-white font-semibold hover:bg-emerald-700"
                  >
                    Buy Annual
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>

          {payments.length === 0 ? (
            <p className="mt-4 text-slate-600">No payments yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Description</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Provider</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100">
                      <td className="py-4 pr-4 text-slate-700">
                        {new Date(payment.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-4 pr-4 text-slate-900">
                        {payment.description || "Subscription payment"}
                      </td>
                      <td className="py-4 pr-4 text-slate-900">{payment.amountRub} ₽</td>
                      <td className="py-4 pr-4 text-slate-700">{payment.provider}</td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}