"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Search,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Eye,
  XCircle,
  Package,
  Loader2,
  Truck,
  MapPin,
  ExternalLink,
  CheckCircle,
  X,
  Ban,
  Clock,
  FileText,
  PackageCheck,
  Check,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { TrackingModal } from "~/components/shipping/tracking-modal";
import { cn } from "~/lib/utils";
import { useDebounce } from "~/hooks/use-debounce";

type OrderStatus =
  | "ORDER_PLACED"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY_FOR_SHIPMENT"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "RESOLVED"
  | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  { variant: "info" | "warning" | "success" | "danger" | "default"; label: string }
> = {
  ORDER_PLACED: { variant: "warning", label: "ORDER PLACED" },
  PENDING_CONFIRMATION: { variant: "info", label: "PENDING CONFIRMATION" },
  CONFIRMED: { variant: "success", label: "CONFIRMED" },
  AWAITING_PAYMENT: { variant: "warning", label: "AWAITING PAYMENT" },
  PAID: { variant: "success", label: "PAID" },
  PREPARING: { variant: "info", label: "PREPARING" },
  READY_FOR_SHIPMENT: { variant: "info", label: "READY TO SHIP" },
  IN_TRANSIT: { variant: "info", label: "IN TRANSIT" },
  DELIVERED: { variant: "success", label: "DELIVERED" },
  COMPLETED: { variant: "success", label: "COMPLETED" },
  DISPUTED: { variant: "danger", label: "DISPUTED" },
  RESOLVED: { variant: "default", label: "RESOLVED" },
  CANCELLED: { variant: "danger", label: "CANCELLED" },
};

const carrierLabels: Record<string, string> = {
  JT_EXPRESS: "J&T",
  LALAMOVE: "Lalamove",
  GRAB_EXPRESS: "Grab",
  LBC: "LBC",
  GOGO_XPRESS: "GoGo",
  NINJA_VAN: "Ninja Van",
  SELF_DELIVERY: "Self",
  OTHER: "Other",
};

// Order Action Modal for confirming/cancelling/paying/completing/disputing orders
function OrderActionModal({
  orderId,
  orderNumber,
  action,
  onClose,
  onSuccess,
}: {
  orderId: string;
  orderNumber: string;
  action: "confirm" | "cancel" | "pay" | "complete" | "dispute";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState("");

  const updateStatusMutation = api.order.updateMerchantOrderStatus.useMutation();

  const actionStatusMap: Record<typeof action, "CONFIRMED" | "PAID" | "COMPLETED" | "DISPUTED" | "CANCELLED"> = {
    confirm: "CONFIRMED",
    pay: "PAID",
    complete: "COMPLETED",
    dispute: "DISPUTED",
    cancel: "CANCELLED",
  };

  const actionConfig: Record<typeof action, {
    title: string;
    message: string;
    buttonLabel: string;
    placeholder: string;
    colorClass: string;
    bgClass: string;
    textClass: string;
    icon: typeof CheckCircle;
  }> = {
    confirm: {
      title: "Confirm Order",
      message: "Are you sure you want to confirm this order? The producer will start processing your order.",
      buttonLabel: "Confirm Order",
      placeholder: "Any additional notes for the producer...",
      colorClass: "bg-green-600 hover:bg-green-700",
      bgClass: "bg-green-50",
      textClass: "text-green-800",
      icon: CheckCircle,
    },
    pay: {
      title: "Pay for Order",
      message: "Are you sure you want to mark this order as paid? This confirms payment has been made.",
      buttonLabel: "Confirm Payment",
      placeholder: "Payment reference or notes...",
      colorClass: "bg-blue-600 hover:bg-blue-700",
      bgClass: "bg-blue-50",
      textClass: "text-blue-800",
      icon: CheckCircle,
    },
    complete: {
      title: "Complete Order",
      message: "Are you sure you want to mark this order as completed? This confirms you have received everything satisfactorily.",
      buttonLabel: "Complete Order",
      placeholder: "Any notes about the delivery...",
      colorClass: "bg-green-600 hover:bg-green-700",
      bgClass: "bg-green-50",
      textClass: "text-green-800",
      icon: CheckCircle,
    },
    dispute: {
      title: "Dispute Order",
      message: "Are you sure you want to dispute this order? Please provide details about the issue.",
      buttonLabel: "Submit Dispute",
      placeholder: "Describe the issue with the order...",
      colorClass: "bg-orange-600 hover:bg-orange-700",
      bgClass: "bg-orange-50",
      textClass: "text-orange-800",
      icon: Ban,
    },
    cancel: {
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action cannot be undone.",
      buttonLabel: "Cancel Order",
      placeholder: "Reason for cancellation...",
      colorClass: "bg-red-600 hover:bg-red-700",
      bgClass: "bg-red-50",
      textClass: "text-red-800",
      icon: Ban,
    },
  };

  const config = actionConfig[action];
  const ActionIcon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: actionStatusMap[action],
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {config.title}
            </h2>
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
          {/* Action Info */}
          <div className={`mb-6 rounded-lg p-4 text-center ${config.bgClass}`}>
            <div className="mb-2 flex justify-center">
              <ActionIcon className={`h-12 w-12 ${action === "cancel" || action === "dispute" ? "text-red-500" : "text-green-500"}`} />
            </div>
            <p className={`text-sm ${config.textClass}`}>
              {config.message}
            </p>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes {action === "dispute" ? "(Required)" : "(Optional)"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
              required={action === "dispute"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              type="submit"
              disabled={updateStatusMutation.isPending}
              className={`flex-1 ${config.colorClass}`}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ActionIcon className="mr-2 h-4 w-4" />
                  {config.buttonLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Order Details Modal
function OrderDetailsModal({
  orderId,
  onClose,
  onConfirm,
  onCancel,
  onPay,
  onComplete,
  onDispute,
}: {
  orderId: string;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onPay?: () => void;
  onComplete?: () => void;
  onDispute?: () => void;
}) {
  const { data: order, isLoading, error } = api.shipping.getTrackingInfo.useQuery({
    orderId,
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

  const canConfirm = order.status === "PENDING_CONFIRMATION";
  const canPay = order.status === "AWAITING_PAYMENT";
  const canComplete = order.status === "DELIVERED";
  const canDispute = order.status === "DELIVERED";
  const canCancel = !["IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED", "DISPUTED", "RESOLVED"].includes(order.status);

  // Status timeline steps
  const statusSteps = [
    { key: "ORDER_PLACED", label: "Order Placed", icon: Clock },
    { key: "PENDING_CONFIRMATION", label: "Pending Confirmation", icon: Eye },
    { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
    { key: "AWAITING_PAYMENT", label: "Awaiting Payment", icon: FileText },
    { key: "PAID", label: "Paid", icon: CheckCircle },
    { key: "PREPARING", label: "Preparing", icon: Package },
    { key: "READY_FOR_SHIPMENT", label: "Ready for Shipment", icon: PackageCheck },
    { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: MapPin },
    { key: "COMPLETED", label: "Completed", icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500">Order Details & Tracking</p>
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
          {/* Action Buttons for PENDING_CONFIRMATION status */}
          {canConfirm && (
            <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">Order Ready for Confirmation</p>
                  <p className="text-sm text-green-700">
                    Review the order details and confirm to proceed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Order
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Button for AWAITING_PAYMENT status */}
          {canPay && (
            <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-800">Payment Required</p>
                  <p className="text-sm text-blue-700">
                    This order is awaiting payment. Please complete payment to proceed.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    onClose();
                    onPay?.();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons for DELIVERED status */}
          {canComplete && (
            <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">Order Delivered</p>
                  <p className="text-sm text-green-700">
                    Confirm receipt and complete the order, or dispute if there are issues.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onDispute?.();
                    }}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Dispute
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      onComplete?.();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Order
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900">Order Progress</h3>
            <div className="relative">
              {statusSteps.slice(0, 10).map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                // Find history entry for this step
                const historyEntry = order.statusHistory?.find(
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Details */}
          {order.trackingNumber && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Shipping Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Carrier</p>
                  <p className="font-medium text-gray-900">
                    {carrierLabels[order.carrier ?? ""] ?? order.carrier}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-mono font-medium text-gray-900">
                    {order.trackingNumber}
                  </p>
                </div>
                {order.inTransitAt && (
                  <div>
                    <p className="text-sm text-gray-500">Shipped Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(order.inTransitAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(order.estimatedDeliveryDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-sm font-medium text-blue-600 hover:bg-gray-200"
                >
                  Track on Carrier Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Delivery Address */}
          {order.shippingAddress && (
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
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

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          {canCancel && order.status !== "PENDING_CONFIRMATION" ? (
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          ) : (
            <div />
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Date range filter state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // More filters state
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedCarriers, setSelectedCarriers] = useState<
    ("JT_EXPRESS" | "LALAMOVE" | "GRAB_EXPRESS" | "LBC" | "GOGO_XPRESS" | "NINJA_VAN" | "SELF_DELIVERY" | "OTHER")[]
  >([]);
  const [coldChainFilter, setColdChainFilter] = useState<"all" | "yes" | "no">("all");
  const moreFiltersRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        moreFiltersRef.current &&
        !moreFiltersRef.current.contains(event.target as Node)
      ) {
        setShowMoreFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Active filter indicators
  const activeMoreFiltersCount = [
    minAmount || maxAmount ? 1 : 0,
    selectedCarriers.length > 0 ? 1 : 0,
    coldChainFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const dateRangeText =
    dateFrom && dateTo
      ? `${format(dateFrom, "MMM d")} - ${format(dateTo, "MMM d, yyyy")}`
      : dateFrom
        ? `From ${format(dateFrom, "MMM d, yyyy")}`
        : dateTo
          ? `Until ${format(dateTo, "MMM d, yyyy")}`
          : null;

  // Date range helpers
  const applyDatePreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case "today":
        setDateFrom(startOfDay(now));
        setDateTo(endOfDay(now));
        break;
      case "last7":
        setDateFrom(startOfDay(subDays(now, 7)));
        setDateTo(endOfDay(now));
        break;
      case "last30":
        setDateFrom(startOfDay(subDays(now, 30)));
        setDateTo(endOfDay(now));
        break;
      case "thisMonth":
        setDateFrom(startOfMonth(now));
        setDateTo(endOfDay(now));
        break;
      case "lastMonth": {
        const lastMonth = subMonths(now, 1);
        setDateFrom(startOfMonth(lastMonth));
        setDateTo(endOfMonth(lastMonth));
        break;
      }
    }
    setShowDatePicker(false);
    setCurrentPage(1);
  };

  const clearDateRange = () => {
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
  };

  const clearMoreFilters = () => {
    setMinAmount("");
    setMaxAmount("");
    setSelectedCarriers([]);
    setColdChainFilter("all");
    setCurrentPage(1);
  };

  const toggleCarrier = (carrier: typeof selectedCarriers[number]) => {
    setSelectedCarriers((prev) =>
      prev.includes(carrier)
        ? prev.filter((c) => c !== carrier)
        : [...prev, carrier]
    );
  };

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    orderId: string;
    orderNumber: string;
    action: "confirm" | "cancel" | "pay" | "complete" | "dispute";
  } | null>(null);

  // Details modal state (separate from tracking)
  const [detailsModal, setDetailsModal] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const { data, isLoading, error } = api.order.getMerchantOrders.useQuery({
    limit: 10,
    status: activeTab === "all" ? undefined : activeTab,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    carriers: selectedCarriers.length > 0 ? selectedCarriers : undefined,
    requiresColdChain:
      coldChainFilter === "all" ? undefined : coldChainFilter === "yes",
  });

  const utils = api.useUtils();

  // Payment session mutation for "Pay Now" button
  const createPaymentSession = api.bulkOrder.createPaymentSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Paymongo checkout
      window.location.href = data.checkoutUrl;
    },
  });

  const handlePayNow = (orderId: string) => {
    createPaymentSession.mutate({ bulkOrderId: orderId });
  };

  const handleActionSuccess = async () => {
    await utils.order.getMerchantOrders.invalidate();
  };

  const orders = data?.orders ?? [];
  const totalCount = data?.totalCount ?? 0;
  const counts = data?.counts ?? {
    all: 0,
    ORDER_PLACED: 0,
    PENDING_CONFIRMATION: 0,
    CONFIRMED: 0,
    AWAITING_PAYMENT: 0,
    PAID: 0,
    PREPARING: 0,
    READY_FOR_SHIPMENT: 0,
    IN_TRANSIT: 0,
    DELIVERED: 0,
    COMPLETED: 0,
    DISPUTED: 0,
    RESOLVED: 0,
    CANCELLED: 0,
  };

  const totalPages = Math.ceil(totalCount / 10);

  const tabs = [
    { key: "all" as const, label: "All Orders", count: counts.all },
    { key: "ORDER_PLACED" as OrderStatus, label: "Pending", count: (counts.ORDER_PLACED ?? 0) + (counts.PENDING_CONFIRMATION ?? 0) },
    { key: "IN_TRANSIT" as OrderStatus, label: "In Transit", count: counts.IN_TRANSIT ?? 0 },
    { key: "DELIVERED" as OrderStatus, label: "Delivered", count: (counts.DELIVERED ?? 0) + (counts.COMPLETED ?? 0) },
    { key: "CANCELLED" as OrderStatus, label: "Cancelled", count: counts.CANCELLED ?? 0 },
  ];

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  // Group items by producer
  const getProducerFromOrder = (order: typeof orders[0]) => {
    if (order.items.length === 0) return { name: "Unknown Producer", icon: "?" };
    const firstItem = order.items[0];
    if (firstItem?.product?.merchant) {
      return {
        name: firstItem.product.merchant.businessName,
        icon: firstItem.product.merchant.businessName.charAt(0).toUpperCase(),
      };
    }
    return { name: "Unknown Producer", icon: "?" };
  };

  // Check if order is trackable (has shipping info)
  const isTrackable = (status: string) => {
    return ["IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your seafood sourcing history.
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6" aria-label="Order status tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Product..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Range Picker */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowMoreFilters(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                dateRangeText
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {dateRangeText ?? "Select Date Range"}
              </span>
              {dateRangeText && (
                <X
                  className="h-3.5 w-3.5 shrink-0 text-blue-400 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateRange();
                  }}
                />
              )}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                {/* Quick Presets */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Quick Select
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "today", label: "Today" },
                      { key: "last7", label: "Last 7 Days" },
                      { key: "last30", label: "Last 30 Days" },
                      { key: "thisMonth", label: "This Month" },
                      { key: "lastMonth", label: "Last Month" },
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => applyDatePreset(preset.key)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Range */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Custom Range
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFrom ? format(dateFrom, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          setDateFrom(
                            e.target.value ? new Date(e.target.value) : null
                          );
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">
                        To
                      </label>
                      <input
                        type="date"
                        value={dateTo ? format(dateTo, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          setDateTo(
                            e.target.value ? new Date(e.target.value) : null
                          );
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                  <button
                    onClick={clearDateRange}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg bg-blue-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* More Filters */}
          <div className="relative" ref={moreFiltersRef}>
            <button
              onClick={() => {
                setShowMoreFilters(!showMoreFilters);
                setShowDatePicker(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                activeMoreFiltersCount > 0
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
              {activeMoreFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {activeMoreFiltersCount}
                </span>
              )}
            </button>

            {showMoreFilters && (
              <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                {/* Amount Range */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount Range (PHP)
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        min="0"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        min="0"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Carrier Filter */}
                <div className="mb-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Shipping Carrier
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(carrierLabels) as (typeof selectedCarriers)[number][]).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleCarrier(key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedCarriers.includes(key)
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {selectedCarriers.includes(key) && (
                          <Check className="h-3 w-3" />
                        )}
                        {carrierLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cold Chain Filter */}
                <div className="mb-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cold Chain Required
                  </p>
                  <div className="flex gap-2">
                    {(
                      [
                        { key: "all", label: "All" },
                        { key: "yes", label: "Yes" },
                        { key: "no", label: "No" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setColdChainFilter(option.key)}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          coldChainFilter === option.key
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between border-t border-gray-100 pt-4">
                  <button
                    onClick={clearMoreFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreFilters(false);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg bg-blue-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                Your orders will appear here once you place them.
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
                    Producer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Amount
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
                  const producer = getProducerFromOrder(order);
                  const orderWithTracking = order as typeof order & {
                    carrier?: string;
                    trackingNumber?: string;
                    trackingUrl?: string;
                  };
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-medium text-blue-700">
                            {producer.icon}
                          </div>
                          <span className="text-sm text-gray-900">
                            {producer.name}
                          </span>
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
                        {formatCurrency(Number(order.estimatedTotal))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={statusConfig[order.status as OrderStatus]?.variant ?? "default"}
                            className="text-xs font-semibold uppercase"
                          >
                            {statusConfig[order.status as OrderStatus]?.label ?? order.status}
                          </Badge>
                          {/* Show tracking info if available */}
                          {orderWithTracking.trackingNumber && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Truck className="h-3 w-3" />
                              <span>
                                {carrierLabels[orderWithTracking.carrier ?? ""] ?? orderWithTracking.carrier}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Confirm button for PENDING_CONFIRMATION orders */}
                          {order.status === "PENDING_CONFIRMATION" && (
                            <button
                              onClick={() =>
                                setActionModal({
                                  orderId: order.id,
                                  orderNumber: order.orderNumber,
                                  action: "confirm",
                                })
                              }
                              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
                              title="Confirm Order"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Confirm
                            </button>
                          )}
                          {/* Pay Now button for AWAITING_PAYMENT orders */}
                          {order.status === "AWAITING_PAYMENT" && (
                            <button
                              onClick={() => handlePayNow(order.id)}
                              disabled={createPaymentSession.isPending}
                              className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                              title="Pay Now"
                            >
                              {createPaymentSession.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Pay Now
                            </button>
                          )}
                          {/* Complete Order button for DELIVERED orders */}
                          {order.status === "DELIVERED" && (
                            <button
                              onClick={() =>
                                setActionModal({
                                  orderId: order.id,
                                  orderNumber: order.orderNumber,
                                  action: "complete",
                                })
                              }
                              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
                              title="Complete Order"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </button>
                          )}
                          {/* Dispute Order button for DELIVERED orders */}
                          {order.status === "DELIVERED" && (
                            <button
                              onClick={() =>
                                setActionModal({
                                  orderId: order.id,
                                  orderNumber: order.orderNumber,
                                  action: "dispute",
                                })
                              }
                              className="flex items-center gap-1 rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100"
                              title="Dispute Order"
                            >
                              <Ban className="h-3 w-3" />
                              Dispute
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDetailsModal({
                                orderId: order.id,
                                orderNumber: order.orderNumber,
                              })
                            }
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </button>
                          {isTrackable(order.status) && (
                            <button
                              onClick={() => setSelectedOrderId(order.id)}
                              className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                              title="Track Shipment"
                            >
                              <MapPin className="h-3 w-3" />
                              Track
                            </button>
                          )}
                          {orderWithTracking.trackingUrl && (
                            <a
                              href={orderWithTracking.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                              title="Track on carrier website"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
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
                        ? "bg-blue-900 text-white"
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

      {/* Support Section */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Headphones className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Need assistance with an order?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Our support team is available 24/7 to help with logistics or
                disputes.
              </p>
            </div>
          </div>
          <Button className="bg-white text-blue-900 hover:bg-gray-50">
            Contact Support
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 text-sm text-gray-600">
        <div className="flex gap-6">
          <button className="transition-colors hover:text-gray-900">
            Market Trends
          </button>
          <button className="transition-colors hover:text-gray-900">
            Order Guidelines
          </button>
          <button className="transition-colors hover:text-gray-900">
            Support
          </button>
        </div>
        <div className="text-gray-500">
          © 2024 AquaConnect B2B. Empowering MSME Merchants.
        </div>
      </div>

      {/* Tracking Modal */}
      {selectedOrderId && (
        <TrackingModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Order Details Modal */}
      {detailsModal && (
        <OrderDetailsModal
          orderId={detailsModal.orderId}
          onClose={() => setDetailsModal(null)}
          onConfirm={() => {
            setDetailsModal(null);
            setActionModal({
              orderId: detailsModal.orderId,
              orderNumber: detailsModal.orderNumber,
              action: "confirm",
            });
          }}
          onCancel={() => {
            setDetailsModal(null);
            setActionModal({
              orderId: detailsModal.orderId,
              orderNumber: detailsModal.orderNumber,
              action: "cancel",
            });
          }}
          onPay={() => {
            setDetailsModal(null);
            handlePayNow(detailsModal.orderId);
          }}
          onComplete={() => {
            setDetailsModal(null);
            setActionModal({
              orderId: detailsModal.orderId,
              orderNumber: detailsModal.orderNumber,
              action: "complete",
            });
          }}
          onDispute={() => {
            setDetailsModal(null);
            setActionModal({
              orderId: detailsModal.orderId,
              orderNumber: detailsModal.orderNumber,
              action: "dispute",
            });
          }}
        />
      )}

      {/* Order Action Modal */}
      {actionModal && (
        <OrderActionModal
          orderId={actionModal.orderId}
          orderNumber={actionModal.orderNumber}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
