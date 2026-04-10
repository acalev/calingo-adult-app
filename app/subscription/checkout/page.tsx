import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; userId?: string }>;
}) {
  const { paymentId, userId } = await searchParams;

  if (!paymentId || !userId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            Missing paymentId or userId.
          </div>
        </div>
      </div>
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      amountRub: true,
      status: true,
      description: true,
    },
  });

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            Payment not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>

          <div className="space-y-2 text-slate-700">
            <p><span className="font-semibold">Payment:</span> {payment.description}</p>
            <p><span className="font-semibold">Amount:</span> {payment.amountRub} ₽</p>
            <p><span className="font-semibold">Status:</span> {payment.status}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800">
            Local development mode: this uses mock confirmation instead of a live payment provider.
          </div>

          <form action="/api/payments/mock-confirm" method="POST">
            <input type="hidden" name="paymentId" value={payment.id} />
            <input type="hidden" name="userId" value={userId} />
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-5 py-4 text-white font-semibold hover:bg-emerald-700"
            >
              Confirm Mock Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}