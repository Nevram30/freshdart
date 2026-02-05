"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const bulkOrderId = searchParams.get("bulk_order_id");

  const utils = api.useUtils();

  const updateStatus = api.order.updateMerchantOrderStatus.useMutation({
    onSuccess: () => {
      void utils.bulkOrder.getMyBulkOrders.invalidate();
      void utils.order.getMerchantOrders.invalidate();
    },
  });

  useEffect(() => {
    if (bulkOrderId && !updateStatus.isSuccess && !updateStatus.isPending) {
      updateStatus.mutate({
        id: bulkOrderId,
        status: "PAID",
        notes: "Payment completed via Paymongo",
      });
    }
  }, [bulkOrderId]);

  if (!bulkOrderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Invalid payment session</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {updateStatus.isPending ? (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-500" />
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Processing Payment...
            </h1>
            <p className="mt-2 text-gray-500">
              Please wait while we confirm your payment.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Payment Successful!
            </h1>
            <p className="mt-2 text-gray-500">
              Your payment has been confirmed. The producer will begin preparing
              your order.
            </p>
            <Link
              href="/merchant/orders"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
