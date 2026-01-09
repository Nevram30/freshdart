"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const { data: order, isLoading } = api.checkout.getOrderStatus.useQuery(
    { orderId: orderId ?? "" },
    { enabled: !!orderId }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {/* Success Icon */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Order Confirmed!
        </h1>
        <p className="mb-8 text-gray-500">
          Thank you for your order. We&apos;ve received your payment and will
          start preparing your items.
        </p>

        {/* Order Details */}
        {order && (
          <div className="mb-8 rounded-2xl bg-gray-50 p-6 text-left">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">Order Details</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium text-gray-900">
                  #{order.orderNumber.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium text-gray-900">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.deliveryDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {order.deliveryTimeSlot && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Slot</span>
                  <span className="font-medium text-gray-900">
                    {order.deliveryTimeSlot === "morning"
                      ? "8:00 AM - 12:00 PM"
                      : order.deliveryTimeSlot === "afternoon"
                      ? "12:00 PM - 5:00 PM"
                      : "5:00 PM - 8:00 PM"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products">
            <Button variant="primary" className="w-full gap-2 sm:w-auto">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Email Notification */}
        <p className="mt-8 text-sm text-gray-500">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
}
