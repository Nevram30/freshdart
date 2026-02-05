"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const bulkOrderId = searchParams.get("bulk_order_id");

  const createPaymentSession =
    api.bulkOrder.createPaymentSession.useMutation();

  const handleRetryPayment = () => {
    if (!bulkOrderId) return;
    createPaymentSession.mutate(
      { bulkOrderId },
      {
        onSuccess: (data) => {
          window.location.href = data.checkoutUrl;
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-gray-500">
          Your payment was not completed. You can retry the payment or go back
          to your orders.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {bulkOrderId && (
            <button
              onClick={handleRetryPayment}
              disabled={createPaymentSession.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {createPaymentSession.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry Payment
            </button>
          )}
          <Link
            href="/merchant/orders"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
