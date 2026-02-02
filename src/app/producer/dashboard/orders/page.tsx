"use client";

import { useState } from "react";
import {
  Download,
  Search,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Loader2,
  FileText,
  PackageCheck,
  Navigation,
  MapPin,
  Ban,
  X,
  User,
  Building2,
  Phone,
  Mail,
  Snowflake,
  Scale,
  History,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";

type OrderStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

const statusConfig: Record<
  OrderStatus,
  { variant: "info" | "warning" | "success" | "danger" | "default"; label: string; description: string }
> = {
  PENDING: { variant: "warning", label: "Pending", description: "Awaiting review" },
  REVIEWING: { variant: "info", label: "Reviewing", description: "Under review" },
  QUOTED: { variant: "info", label: "Quoted", description: "Quote sent to merchant" },
  CONFIRMED: { variant: "success", label: "Confirmed", description: "Merchant accepted" },
  PROCESSING: { variant: "info", label: "Processing", description: "Preparing order" },
  READY_FOR_PICKUP: { variant: "info", label: "Ready", description: "Ready for pickup" },
  SHIPPED: { variant: "info", label: "Shipped", description: "With courier" },
  IN_TRANSIT: { variant: "info", label: "In Transit", description: "On the way" },
  OUT_FOR_DELIVERY: { variant: "info", label: "Out for Delivery", description: "Last mile" },
  DELIVERED: { variant: "success", label: "Delivered", description: "Completed" },
  CANCELLED: { variant: "danger", label: "Cancelled", description: "Order cancelled" },
  REJECTED: { variant: "danger", label: "Rejected", description: "Order rejected" },
};

// Define valid status transitions for producer
const validTransitions: Record<string, { nextStatus: OrderStatus; label: string; icon: React.ElementType; color: string }[]> = {
  PENDING: [
    { nextStatus: "REVIEWING", label: "Start Review", icon: Clock, color: "blue" },
    { nextStatus: "REJECTED", label: "Reject Order", icon: Ban, color: "red" },
  ],
  REVIEWING: [
    { nextStatus: "QUOTED", label: "Send Quote", icon: FileText, color: "blue" },
    { nextStatus: "REJECTED", label: "Reject Order", icon: Ban, color: "red" },
  ],
  QUOTED: [
    // Merchant confirms - no action for producer here
  ],
  CONFIRMED: [
    { nextStatus: "PROCESSING", label: "Start Processing", icon: Package, color: "amber" },
  ],
  PROCESSING: [
    { nextStatus: "READY_FOR_PICKUP", label: "Mark Ready for Pickup", icon: PackageCheck, color: "teal" },
  ],
  READY_FOR_PICKUP: [
    { nextStatus: "SHIPPED", label: "Mark as Shipped", icon: Truck, color: "blue" },
  ],
  SHIPPED: [
    { nextStatus: "IN_TRANSIT", label: "Mark In Transit", icon: Navigation, color: "indigo" },
  ],
  IN_TRANSIT: [
    { nextStatus: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin, color: "purple" },
  ],
  OUT_FOR_DELIVERY: [
    { nextStatus: "DELIVERED", label: "Mark Delivered", icon: CheckCircle, color: "green" },
  ],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

const tabs = [
  { key: "all" as const, label: "All Orders" },
  { key: "PENDING" as const, label: "New" },
  { key: "REVIEWING" as const, label: "Reviewing" },
  { key: "CONFIRMED" as const, label: "Confirmed" },
  { key: "PROCESSING" as const, label: "Processing" },
  { key: "SHIPPED" as const, label: "Shipped" },
  { key: "DELIVERED" as const, label: "Delivered" },
];

// Shipping Carriers list
const CARRIERS = [
  { value: "JT_EXPRESS", label: "J&T Express" },
  { value: "LALAMOVE", label: "Lalamove" },
  { value: "GRAB_EXPRESS", label: "Grab Express" },
  { value: "LBC", label: "LBC Express" },
  { value: "GOGO_XPRESS", label: "GoGo Xpress" },
  { value: "NINJA_VAN", label: "Ninja Van" },
  { value: "SELF_DELIVERY", label: "Self Delivery" },
  { value: "OTHER", label: "Other" },
] as const;

type CarrierValue = typeof CARRIERS[number]["value"];

// Shipping Modal Component for marking orders as shipped
function ShippingModal({
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [carrier, setCarrier] = useState<CarrierValue>("JT_EXPRESS");
  const [carrierOther, setCarrierOther] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const addTrackingMutation = api.shipping.addTracking.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number");
      return;
    }

    try {
      await addTrackingMutation.mutateAsync({
        orderId,
        carrier,
        carrierOther: carrier === "OTHER" ? carrierOther : undefined,
        trackingNumber: trackingNumber.trim(),
        estimatedDeliveryDate: estimatedDeliveryDate
          ? new Date(estimatedDeliveryDate)
          : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add tracking:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ship Order</h2>
            <p className="text-sm text-gray-500">
              Order #{orderNumber.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Carrier Selection */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Shipping Carrier <span className="text-red-500">*</span>
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as CarrierValue)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Other Carrier Name */}
          {carrier === "OTHER" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Carrier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={carrierOther}
                onChange={(e) => setCarrierOther(e.target.value)}
                placeholder="Enter carrier name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
          )}

          {/* Tracking Number */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tracking Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 p-3">
            <div className="flex gap-2">
              <Truck className="h-5 w-5 shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Shipping Details</p>
                <p className="mt-1 text-blue-700">
                  Once you mark this order as shipped, the merchant will be notified
                  and can track the shipment.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addTrackingMutation.isPending || !trackingNumber.trim()}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {addTrackingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Shipping...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Mark as Shipped
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status Update Confirmation Modal
function StatusUpdateModal({
  orderId,
  orderNumber,
  currentStatus,
  newStatus,
  statusLabel,
  onClose,
  onSuccess,
}: {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  newStatus: OrderStatus;
  statusLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [receivedBy, setReceivedBy] = useState("");

  const updateStatusMutation = api.shipping.updateShippingStatus.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
        notes: notes || undefined,
        receivedBy: newStatus === "DELIVERED" ? receivedBy || undefined : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusIcon = () => {
    switch (newStatus) {
      case "REVIEWING":
        return <Clock className="h-8 w-8 text-blue-500" />;
      case "QUOTED":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "PROCESSING":
        return <Package className="h-8 w-8 text-amber-500" />;
      case "READY_FOR_PICKUP":
        return <PackageCheck className="h-8 w-8 text-teal-500" />;
      case "IN_TRANSIT":
        return <Navigation className="h-8 w-8 text-indigo-500" />;
      case "OUT_FOR_DELIVERY":
        return <MapPin className="h-8 w-8 text-purple-500" />;
      case "DELIVERED":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "REJECTED":
        return <Ban className="h-8 w-8 text-red-500" />;
      default:
        return <Package className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (newStatus) {
      case "REVIEWING":
      case "QUOTED":
        return "blue";
      case "PROCESSING":
        return "amber";
      case "READY_FOR_PICKUP":
        return "teal";
      case "IN_TRANSIT":
        return "indigo";
      case "OUT_FOR_DELIVERY":
        return "purple";
      case "DELIVERED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "gray";
    }
  };

  const color = getStatusColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Update Status</h2>
            <p className="text-sm text-gray-500">
              Order #{orderNumber.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Status Change Info */}
          <div className={`mb-6 rounded-lg bg-${color}-50 p-4 text-center`}>
            <div className="mb-2 flex justify-center">{getStatusIcon()}</div>
            <p className="text-sm text-gray-600">
              Change status from{" "}
              <span className="font-medium">
                {statusConfig[currentStatus as OrderStatus]?.label}
              </span>{" "}
              to
            </p>
            <p className={`mt-1 text-lg font-bold text-${color}-700`}>
              {statusLabel}
            </p>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Received By (for Delivered status) */}
          {newStatus === "DELIVERED" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Received By
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Name of person who received the order"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStatusMutation.isPending}
              className={`flex-1 ${
                newStatus === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const { data: order, isLoading, error } = api.order.getProducerOrder.useQuery({
    id: orderId,
  });

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white p-6">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-600">Failed to load order details</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const itemTotal = order.items.reduce(
    (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
    0
  );

  const totalWeight = order.items.reduce(
    (sum, item) => sum + Number(item.weightKg ?? 0) * Number(item.quantity),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500">
              Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={statusConfig[order.status as OrderStatus]?.variant ?? "default"}
              className="text-sm font-semibold"
            >
              {statusConfig[order.status as OrderStatus]?.label ?? order.status}
            </Badge>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Customer Information */}
          <div className="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <User className="h-5 w-5 text-teal-600" />
              Customer Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                  {order.contactName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.contactName}</p>
                  {order.companyName && (
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <Building2 className="h-3 w-3" />
                      {order.companyName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {order.contactEmail}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {order.contactPhone}
                </p>
              </div>
            </div>
            {order.shippingAddress && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-1 text-sm font-medium text-gray-700">Shipping Address</p>
                <p className="text-sm text-gray-600">
                  {(order.shippingAddress as { street?: string }).street && (
                    <>{(order.shippingAddress as { street: string }).street}<br /></>
                  )}
                  {(order.shippingAddress as { city?: string }).city},{" "}
                  {(order.shippingAddress as { state?: string }).state}{" "}
                  {(order.shippingAddress as { postalCode?: string }).postalCode}
                  <br />
                  {(order.shippingAddress as { country?: string }).country}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mb-6 rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Package className="h-5 w-5 text-teal-600" />
                Order Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>
                        {Number(item.quantity)} {item.unitType}
                      </span>
                      <span>@ {formatCurrency(Number(item.unitPrice))}/{item.unitType}</span>
                      {item.weightKg && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          {Number(item.weightKg).toFixed(2)} kg each
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(item.finalTotalPrice ?? item.totalPrice))}
                    </p>
                    {item.finalTotalPrice && Number(item.finalTotalPrice) !== Number(item.totalPrice) && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatCurrency(Number(item.totalPrice))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {/* Pricing */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(itemTotal)}</span>
                </div>
                {order.coldChainSurcharge && Number(order.coldChainSurcharge) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Snowflake className="h-3 w-3 text-blue-500" />
                      Cold Chain Surcharge
                    </span>
                    <span className="text-gray-900">
                      {formatCurrency(Number(order.coldChainSurcharge))}
                    </span>
                  </div>
                )}
                {order.finalShipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {formatCurrency(Number(order.finalShipping))}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-teal-600">
                      {formatCurrency(
                        Number(order.finalTotal ?? 0) ||
                          itemTotal +
                            Number(order.coldChainSurcharge ?? 0) +
                            Number(order.finalShipping ?? 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Weight</span>
                  <span className="text-gray-900">{totalWeight.toFixed(2)} kg</span>
                </div>
                {order.requiresColdChain && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cold Chain</span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Snowflake className="h-3 w-3" />
                      Required
                    </span>
                  </div>
                )}
                {order.preferredDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Delivery</span>
                    <span className="text-gray-900">
                      {format(new Date(order.preferredDeliveryDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="text-gray-900">
                      {format(new Date(order.estimatedDeliveryDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {(order.carrier != null || order.trackingNumber != null) && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Truck className="h-5 w-5 text-teal-600" />
                Shipping Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {order.carrier && (
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-medium text-gray-900">
                      {order.carrier === "OTHER" ? order.carrierOther : order.carrier.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono font-medium text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
                {order.shippedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Shipped Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(order.shippedAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Delivered Date</p>
                    <p className="font-medium text-green-600">
                      {format(new Date(order.actualDeliveryDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
                >
                  Track Shipment
                  <Navigation className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Quote Information */}
          {order.quote && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-teal-600" />
                Quote Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Quote Number</p>
                  <p className="font-medium text-gray-900">
                    #{order.quote.quoteNumber?.slice(-8).toUpperCase() ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={order.quote.status === "ACCEPTED" ? "success" : "info"}>
                    {order.quote.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-medium text-gray-900">
                    {order.quote.validUntil
                      ? format(new Date(order.quote.validUntil), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {(order.notes != null || order.deliveryNotes != null) && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Notes</h3>
              {order.deliveryNotes && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Delivery Notes</p>
                  <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Internal Notes</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Timestamps */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <History className="h-5 w-5 text-teal-600" />
              Status Timeline
            </h3>
            <div className="space-y-3">
              {order.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-gray-500">
                      {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.reviewedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Reviewed</p>
                    <p className="text-gray-500">
                      {format(new Date(order.reviewedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.quotedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Quote Sent</p>
                    <p className="text-gray-500">
                      {format(new Date(order.quotedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.confirmedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmed</p>
                    <p className="text-gray-500">
                      {format(new Date(order.confirmedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.processingAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Processing Started</p>
                    <p className="text-gray-500">
                      {format(new Date(order.processingAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.readyForPickupAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                    <PackageCheck className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ready for Pickup</p>
                    <p className="text-gray-500">
                      {format(new Date(order.readyForPickupAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Truck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipped</p>
                    <p className="text-gray-500">
                      {format(new Date(order.shippedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.inTransitAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <Navigation className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">In Transit</p>
                    <p className="text-gray-500">
                      {format(new Date(order.inTransitAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.outForDeliveryAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <MapPin className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Out for Delivery</p>
                    <p className="text-gray-500">
                      {format(new Date(order.outForDeliveryAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivered</p>
                    <p className="text-gray-500">
                      {format(new Date(order.deliveredAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cancelled</p>
                    <p className="text-gray-500">
                      {format(new Date(order.cancelledAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProducerOrdersPage() {
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Shipping modal state
  const [shippingModal, setShippingModal] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  // Status update modal state
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    orderId: string;
    orderNumber: string;
    currentStatus: string;
    newStatus: OrderStatus;
    statusLabel: string;
  } | null>(null);

  const { data, isLoading, error } = api.order.getProducerOrders.useQuery({
    limit: 10,
    status: activeTab === "all" ? undefined : activeTab,
    search: searchQuery || undefined,
  });

  const utils = api.useUtils();

  // Handle action button click
  const handleActionClick = (
    orderId: string,
    orderNumber: string,
    currentStatus: string,
    newStatus: OrderStatus,
    statusLabel: string
  ) => {
    // For SHIPPED status, show the shipping modal with carrier/tracking info
    if (newStatus === "SHIPPED") {
      setShippingModal({ orderId, orderNumber });
    } else {
      // For other statuses, show the confirmation modal
      setStatusUpdateModal({
        orderId,
        orderNumber,
        currentStatus,
        newStatus,
        statusLabel,
      });
    }
  };

  const handleStatusUpdateSuccess = async () => {
    await utils.order.getProducerOrders.invalidate();
  };

  const orders = data?.orders ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  // Get available actions for current status
  const getAvailableActions = (status: string) => {
    return validTransitions[status] ?? [];
  };

  // Get color classes for action button
  const getButtonColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-500 hover:bg-blue-100 hover:text-blue-700",
      amber: "text-amber-500 hover:bg-amber-100 hover:text-amber-700",
      teal: "text-teal-500 hover:bg-teal-100 hover:text-teal-700",
      indigo: "text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700",
      purple: "text-purple-500 hover:bg-purple-100 hover:text-purple-700",
      green: "text-green-500 hover:bg-green-100 hover:text-green-700",
      red: "text-red-500 hover:bg-red-100 hover:text-red-700",
    };
    return colors[color] ?? "text-gray-500 hover:bg-gray-100 hover:text-gray-700";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">
            Manage orders from merchants for your products.
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Status Flow Guide */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Order Status Flow:</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Pending</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">Reviewing</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">Quoted</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-green-100 px-2 py-1 text-green-700">Confirmed</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Processing</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-teal-100 px-2 py-1 text-teal-700">Ready</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">Shipped</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-indigo-100 px-2 py-1 text-indigo-700">In Transit</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-purple-100 px-2 py-1 text-purple-700">Out for Delivery</span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-green-100 px-2 py-1 text-green-700">Delivered</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-6 px-6" aria-label="Order status tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer name, or Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Calendar className="h-4 w-4" />
            Date Range
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-gray-600">Failed to load orders</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500">
                Orders from merchants will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => {
                  const itemTotal = order.items.reduce(
                    (sum, item) =>
                      sum + Number(item.finalTotalPrice ?? item.totalPrice),
                    0
                  );
                  const actions = getAvailableActions(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          #{order.orderNumber.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                            {order.contactName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.contactName}
                            </p>
                            {order.companyName && (
                              <p className="text-xs text-gray-500">
                                {order.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.productName)
                            .join(", ")}
                          {order.items.length > 2 && "..."}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(itemTotal)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={statusConfig[order.status as OrderStatus]?.variant ?? "default"}
                            className="text-xs font-semibold"
                          >
                            {statusConfig[order.status as OrderStatus]?.label ?? order.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {statusConfig[order.status as OrderStatus]?.description}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.nextStatus}
                                onClick={() =>
                                  handleActionClick(
                                    order.id,
                                    order.orderNumber,
                                    order.status,
                                    action.nextStatus,
                                    action.label
                                  )
                                }
                                className={`rounded p-1.5 transition-colors ${getButtonColorClasses(action.color)}`}
                                title={action.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                          {order.status === "QUOTED" && (
                            <span className="ml-2 text-xs text-gray-400">
                              Waiting for merchant
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-teal-600 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) =>
                  ["PENDING", "REVIEWING"].includes(o.status)
                ).length}
              </p>
              <p className="text-sm text-gray-500">New Orders</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "QUOTED").length}
              </p>
              <p className="text-sm text-gray-500">Awaiting Confirmation</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <Package className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) =>
                  ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP"].includes(o.status)
                ).length}
              </p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Truck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) =>
                  ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)
                ).length}
              </p>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Shipping Modal */}
      {shippingModal && (
        <ShippingModal
          orderId={shippingModal.orderId}
          orderNumber={shippingModal.orderNumber}
          onClose={() => setShippingModal(null)}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && (
        <StatusUpdateModal
          orderId={statusUpdateModal.orderId}
          orderNumber={statusUpdateModal.orderNumber}
          currentStatus={statusUpdateModal.currentStatus}
          newStatus={statusUpdateModal.newStatus}
          statusLabel={statusUpdateModal.statusLabel}
          onClose={() => setStatusUpdateModal(null)}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
}
