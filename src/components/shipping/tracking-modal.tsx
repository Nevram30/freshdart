"use client";

import { useState } from "react";
import {
  X,
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  Snowflake,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";

interface TrackingModalProps {
  orderId: string;
  onClose: () => void;
}

const statusSteps = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: Clock },
  { key: "PENDING_CONFIRMATION", label: "Pending Confirmation", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { key: "AWAITING_PAYMENT", label: "Awaiting Payment", icon: Clock },
  { key: "PAID", label: "Paid", icon: CheckCircle },
  { key: "PREPARING", label: "Preparing", icon: Package },
  { key: "READY_FOR_SHIPMENT", label: "Ready to Ship", icon: Package },
  { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: MapPin },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle },
];

const carrierLabels: Record<string, string> = {
  JT_EXPRESS: "J&T Express",
  LALAMOVE: "Lalamove",
  GRAB_EXPRESS: "Grab Express",
  LBC: "LBC Express",
  GOGO_XPRESS: "GoGo Xpress",
  NINJA_VAN: "Ninja Van",
  SELF_DELIVERY: "Self Delivery",
  OTHER: "Other",
};

export function TrackingModal({ orderId, onClose }: TrackingModalProps) {
  const { data: tracking, isLoading, error } = api.shipping.getTrackingInfo.useQuery({
    orderId,
  });

  const confirmDeliveryMutation = api.shipping.confirmDelivery.useMutation();
  const utils = api.useUtils();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [receivedBy, setReceivedBy] = useState("");

  const handleConfirmDelivery = async () => {
    try {
      await confirmDeliveryMutation.mutateAsync({
        orderId,
        receivedBy: receivedBy || undefined,
      });
      await utils.shipping.getTrackingInfo.invalidate({ orderId });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Failed to confirm delivery:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-600">Failed to load tracking information</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine current step index
  const currentStepIndex = statusSteps.findIndex((s) => s.key === tracking.status);
  const isDelivered = ["DELIVERED", "COMPLETED"].includes(tracking.status);
  const canConfirmDelivery = tracking.status === "IN_TRANSIT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Order #{tracking.orderNumber.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500">Tracking Information</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Current Status</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {statusSteps.find((s) => s.key === tracking.status)?.label ??
                    tracking.status}
                </p>
              </div>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  isDelivered ? "bg-green-100" : "bg-blue-100"
                }`}
              >
                {isDelivered ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Truck className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          {/* Tracking Details */}
          {tracking.trackingNumber && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Shipping Details</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Carrier</span>
                  <span className="font-medium text-gray-900">
                    {carrierLabels[tracking.carrier ?? ""] ?? tracking.carrier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tracking Number</span>
                  <span className="font-mono font-medium text-gray-900">
                    {tracking.trackingNumber}
                  </span>
                </div>
                {tracking.trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-sm font-medium text-blue-600 hover:bg-gray-200"
                    >
                      Track on Carrier Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {tracking.inTransitAt && (
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Shipped Date
                </div>
                <p className="mt-1 font-medium text-gray-900">
                  {format(new Date(tracking.inTransitAt), "MMM dd, yyyy")}
                </p>
              </div>
            )}
            {tracking.estimatedDeliveryDate && (
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Estimated Delivery
                </div>
                <p className="mt-1 font-medium text-gray-900">
                  {format(new Date(tracking.estimatedDeliveryDate), "MMM dd, yyyy")}
                </p>
              </div>
            )}
            {tracking.actualDeliveryDate && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Delivered Date
                </div>
                <p className="mt-1 font-medium text-green-900">
                  {format(new Date(tracking.actualDeliveryDate), "MMM dd, yyyy")}
                </p>
                {tracking.receivedBy && (
                  <p className="mt-1 text-sm text-green-700">
                    Received by: {tracking.receivedBy}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900">Order Progress</h3>
            <div className="relative">
              {statusSteps.slice(0, 8).map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                // Find history entry for this step
                const historyEntry = tracking.statusHistory?.find(
                  (h) => h.toStatus === step.key
                );

                return (
                  <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Connector Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 h-full w-0.5 ${
                          isCompleted ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : isCompleted
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-medium ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {historyEntry && (
                        <p className="text-sm text-gray-500">
                          {format(new Date(historyEntry.createdAt), "MMM dd, yyyy h:mm a")}
                        </p>
                      )}
                      {historyEntry?.notes && (
                        <p className="mt-1 text-sm text-gray-600">
                          {historyEntry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address */}
          {tracking.shippingAddress && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                {(tracking.shippingAddress as { street?: string; city?: string; state?: string; postalCode?: string; country?: string }).street && (
                  <p>{(tracking.shippingAddress as { street: string }).street}</p>
                )}
                <p>
                  {(tracking.shippingAddress as { city?: string }).city},{" "}
                  {(tracking.shippingAddress as { state?: string }).state}{" "}
                  {(tracking.shippingAddress as { postalCode?: string }).postalCode}
                </p>
                <p>{(tracking.shippingAddress as { country?: string }).country}</p>
              </div>
            </div>
          )}

          {/* Proof of Delivery */}
          {tracking.deliveryProofUrl && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Proof of Delivery</h3>
              <img
                src={tracking.deliveryProofUrl}
                alt="Proof of delivery"
                className="mt-2 max-h-48 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Confirm Delivery Button */}
          {canConfirmDelivery && (
            <div className="mt-6">
              {!showConfirmDialog ? (
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Delivery Received
                </Button>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-900">
                    Confirm you have received this delivery?
                  </p>
                  <input
                    type="text"
                    placeholder="Received by (optional)"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-green-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmDelivery}
                      disabled={confirmDeliveryMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {confirmDeliveryMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
