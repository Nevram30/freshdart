"use client";

import { useState } from "react";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Search,
  Clock,
  Loader2,
  XCircle,
  Snowflake,
  ExternalLink,
  Phone,
  Mail,
  X,
  Eye,
  User,
  FileText,
  ArrowRight,
  Play,
  MapPinned,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";

type ShipmentFilter = "ALL" | "READY_TO_SHIP" | "IN_TRANSIT" | "DELIVERED";

const statusConfig = {
  CONFIRMED: { variant: "warning" as const, label: "Confirmed", icon: Clock },
  PROCESSING: { variant: "warning" as const, label: "Processing", icon: Package },
  READY_FOR_PICKUP: { variant: "info" as const, label: "Ready for Pickup", icon: Package },
  SHIPPED: { variant: "info" as const, label: "Shipped", icon: Truck },
  IN_TRANSIT: { variant: "info" as const, label: "In Transit", icon: Truck },
  OUT_FOR_DELIVERY: { variant: "info" as const, label: "Out for Delivery", icon: MapPin },
  DELIVERED: { variant: "success" as const, label: "Delivered", icon: CheckCircle },
};

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

export default function ProducerShipmentsPage() {
  const [activeFilter, setActiveFilter] = useState<ShipmentFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data, isLoading, error, refetch } = api.shipping.getProducerShipments.useQuery({
    status: activeFilter,
    limit: 20,
  });

  const { data: carriers } = api.shipping.getCarriers.useQuery();

  const shipments = data?.shipments ?? [];

  const filteredShipments = shipments.filter((shipment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shipment.orderNumber.toLowerCase().includes(query) ||
      shipment.contactName.toLowerCase().includes(query) ||
      shipment.trackingNumber?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  const tabs = [
    { key: "ALL" as const, label: "All Shipments", icon: Package },
    { key: "READY_TO_SHIP" as const, label: "Ready to Ship", icon: Clock },
    { key: "IN_TRANSIT" as const, label: "In Transit", icon: Truck },
    { key: "DELIVERED" as const, label: "Delivered", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
        <p className="mt-2 text-gray-600">
          Manage shipments and track deliveries to merchants.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter((s) =>
                  ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP"].includes(s.status)
                ).length}
              </p>
              <p className="text-sm text-gray-500">Ready to Ship</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter((s) =>
                  ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)
                ).length}
              </p>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter((s) => s.status === "DELIVERED").length}
              </p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
              <Snowflake className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter((s) => s.requiresColdChain).length}
              </p>
              <p className="text-sm text-gray-500">Cold Chain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 px-6" aria-label="Shipment filters">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                    activeFilter === tab.key
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
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
              <p className="mt-4 text-gray-600">Failed to load shipments</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredShipments.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No shipments found</p>
              <p className="text-sm text-gray-500">
                Shipments will appear here when orders are confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Shipments List */}
        {!isLoading && !error && filteredShipments.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredShipments.map((shipment) => {
              const StatusIcon =
                statusConfig[shipment.status as keyof typeof statusConfig]?.icon ?? Package;
              const itemTotal = shipment.items.reduce(
                (sum, item) =>
                  sum + Number(item.finalTotalPrice ?? item.totalPrice),
                0
              );

              return (
                <div
                  key={shipment.id}
                  className="p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          shipment.status === "DELIVERED"
                            ? "bg-green-100"
                            : ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
                                shipment.status
                              )
                            ? "bg-blue-100"
                            : "bg-amber-100"
                        }`}
                      >
                        <StatusIcon
                          className={`h-6 w-6 ${
                            shipment.status === "DELIVERED"
                              ? "text-green-600"
                              : ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(
                                  shipment.status
                                )
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            #{shipment.orderNumber.slice(-8).toUpperCase()}
                          </h3>
                          <Badge
                            variant={
                              statusConfig[shipment.status as keyof typeof statusConfig]
                                ?.variant ?? "default"
                            }
                          >
                            {statusConfig[shipment.status as keyof typeof statusConfig]
                              ?.label ?? shipment.status}
                          </Badge>
                          {shipment.requiresColdChain && (
                            <Badge variant="info" className="gap-1">
                              <Snowflake className="h-3 w-3" />
                              Cold Chain
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">{shipment.contactName}</span>
                          {shipment.companyName && (
                            <span className="text-gray-400">
                              {shipment.companyName}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {shipment.items.length} item
                            {shipment.items.length > 1 ? "s" : ""}
                          </span>
                          <span>
                            {Number(shipment.estimatedWeightKg).toFixed(1)} kg
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>
                        {/* Tracking Info */}
                        {shipment.trackingNumber && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-500">
                              {carrierLabels[shipment.carrier ?? ""] ?? shipment.carrier}:
                            </span>
                            <span className="font-mono font-medium text-gray-900">
                              {shipment.trackingNumber}
                            </span>
                            {shipment.trackingUrl && (
                              <a
                                href={shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
                              >
                                Track <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                        {/* Contact Info */}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {shipment.contactPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {shipment.contactEmail}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                      {["CONFIRMED", "PROCESSING"].includes(shipment.status) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrderId(shipment.id);
                            setShowTrackingModal(true);
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Add Tracking
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrderId(shipment.id);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-4 flex gap-2">
                    {shipment.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <div className="h-8 w-8 rounded bg-gray-200">
                          {item.product.images[0]?.url && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.productName}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-gray-500">
                            {Number(item.quantity)} {item.unitType}
                          </p>
                        </div>
                      </div>
                    ))}
                    {shipment.items.length > 4 && (
                      <div className="flex items-center rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        +{shipment.items.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Tracking Modal */}
      {showTrackingModal && selectedOrderId && (
        <AddTrackingModal
          orderId={selectedOrderId}
          carriers={carriers ?? []}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedOrderId(null);
          }}
          onSuccess={() => {
            setShowTrackingModal(false);
            setSelectedOrderId(null);
            void refetch();
          }}
        />
      )}

      {/* Shipment Details Modal */}
      {showDetailsModal && selectedOrderId && (
        <ShipmentDetailsModal
          orderId={selectedOrderId}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrderId(null);
          }}
          onStatusChange={() => {
            void refetch();
          }}
          onAddTracking={() => {
            setShowDetailsModal(false);
            setShowTrackingModal(true);
          }}
        />
      )}
    </div>
  );
}

// Shipment Details Modal Component
function ShipmentDetailsModal({
  orderId,
  onClose,
  onStatusChange,
  onAddTracking,
}: {
  orderId: string;
  onClose: () => void;
  onStatusChange: () => void;
  onAddTracking: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState<string | null>(null);

  const { data: order, isLoading } = api.order.getProducerOrder.useQuery({ id: orderId });
  const { data: statusHistory } = api.shipping.getStatusHistory.useQuery({ orderId });
  const updateStatusMutation = api.shipping.updateShippingStatus.useMutation();

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  // Status transition configuration
  const statusTransitions: Record<string, { next: string; label: string; icon: React.ElementType; color: string }> = {
    CONFIRMED: { next: "PROCESSING", label: "Start Processing", icon: Play, color: "bg-amber-600 hover:bg-amber-700" },
    PROCESSING: { next: "READY_FOR_PICKUP", label: "Mark Ready for Pickup", icon: Package, color: "bg-blue-600 hover:bg-blue-700" },
    READY_FOR_PICKUP: { next: "SHIPPED", label: "Add Shipping Details", icon: Truck, color: "bg-teal-600 hover:bg-teal-700" },
    SHIPPED: { next: "IN_TRANSIT", label: "Mark In Transit", icon: Truck, color: "bg-indigo-600 hover:bg-indigo-700" },
    IN_TRANSIT: { next: "OUT_FOR_DELIVERY", label: "Mark Out for Delivery", icon: MapPinned, color: "bg-purple-600 hover:bg-purple-700" },
    OUT_FOR_DELIVERY: { next: "DELIVERED", label: "Mark Delivered", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700" },
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus as "PROCESSING" | "READY_FOR_PICKUP" | "SHIPPED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED",
        notes: notes || undefined,
        receivedBy: newStatus === "DELIVERED" ? receivedBy || undefined : undefined,
      });
      setShowStatusConfirm(null);
      setNotes("");
      setReceivedBy("");
      onStatusChange();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
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

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-gray-600">Shipment not found</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const currentTransition = statusTransitions[order.status];
  const itemTotal = order.items.reduce(
    (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
    0
  );

  // Status timeline steps
  const timelineSteps = [
    { status: "CONFIRMED", label: "Confirmed", timestamp: order.confirmedAt },
    { status: "PROCESSING", label: "Processing", timestamp: order.processingAt },
    { status: "READY_FOR_PICKUP", label: "Ready", timestamp: order.readyForPickupAt },
    { status: "SHIPPED", label: "Shipped", timestamp: order.shippedAt },
    { status: "IN_TRANSIT", label: "In Transit", timestamp: order.inTransitAt },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", timestamp: order.outForDeliveryAt },
    { status: "DELIVERED", label: "Delivered", timestamp: order.deliveredAt },
  ];

  const currentStatusIndex = timelineSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Shipment #{order.orderNumber.slice(-8).toUpperCase()}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant ?? "default"}>
                {statusConfig[order.status as keyof typeof statusConfig]?.label ?? order.status}
              </Badge>
              {order.requiresColdChain && (
                <Badge variant="info" className="gap-1">
                  <Snowflake className="h-3 w-3" />
                  Cold Chain
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Status Timeline */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Shipment Progress</h3>
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _isUpcoming = index > currentStatusIndex;

                return (
                  <div key={step.status} className="flex flex-1 flex-col items-center">
                    <div className="relative flex w-full items-center">
                      {index > 0 && (
                        <div
                          className={`absolute left-0 right-1/2 top-1/2 h-1 -translate-y-1/2 ${
                            isCompleted || isCurrent ? "bg-teal-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 right-0 top-1/2 h-1 -translate-y-1/2 ${
                            isCompleted ? "bg-teal-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-teal-500 text-white"
                            : isCurrent
                            ? "bg-teal-500 text-white ring-4 ring-teal-100"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`mt-2 text-center text-xs font-medium ${
                        isCurrent ? "text-teal-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(step.timestamp), "MMM d, h:mm a")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Section */}
          {currentTransition && !showStatusConfirm && (
            <div className="mb-6 rounded-lg border-2 border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                    <ArrowRight className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Next Step</p>
                    <p className="text-sm text-gray-600">
                      {currentTransition.next === "SHIPPED"
                        ? "Add tracking details to ship the order"
                        : `Update status to "${statusConfig[currentTransition.next as keyof typeof statusConfig]?.label}"`}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (currentTransition.next === "SHIPPED") {
                      onAddTracking();
                    } else {
                      setShowStatusConfirm(currentTransition.next);
                    }
                  }}
                  className={currentTransition.color}
                >
                  {(() => {
                    const Icon = currentTransition.icon;
                    return <Icon className="mr-2 h-4 w-4" />;
                  })()}
                  {currentTransition.label}
                </Button>
              </div>
            </div>
          )}

          {/* Status Confirmation */}
          {showStatusConfirm && (
            <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-3 font-medium text-gray-900">
                Confirm Status Change to &ldquo;{statusConfig[showStatusConfirm as keyof typeof statusConfig]?.label}&rdquo;
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Add any notes about this status change..."
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {showStatusConfirm === "DELIVERED" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Received By</label>
                    <input
                      type="text"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      placeholder="Name of person who received the delivery"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusConfirm(null);
                      setNotes("");
                      setReceivedBy("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleStatusUpdate(showStatusConfirm)}
                    disabled={updateStatusMutation.isPending}
                    className={statusTransitions[order.status]?.color ?? "bg-teal-600 hover:bg-teal-700"}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer Information */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <User className="h-4 w-4 text-gray-400" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {order.user?.image ? (
                    <img
                      src={order.user.image}
                      alt={order.user.name ?? ""}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{order.contactName}</p>
                    {order.companyName && (
                      <p className="text-sm text-gray-500">{order.companyName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {order.contactEmail}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {order.contactPhone}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                Delivery Address
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {typeof order.shippingAddress === "string"
                  ? order.shippingAddress
                  : order.shippingAddress
                    ? JSON.stringify(order.shippingAddress, null, 2)
                    : "No address provided"}
              </p>
              {order.deliveryNotes && (
                <div className="mt-3 rounded bg-amber-50 p-2">
                  <p className="text-xs font-medium text-amber-800">Delivery Notes:</p>
                  <p className="text-sm text-amber-700">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {order.trackingNumber && (
            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Truck className="h-4 w-4 text-gray-400" />
                Shipping Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Carrier</p>
                  <p className="font-medium text-gray-900">
                    {carrierLabels[order.carrier ?? ""] ?? order.carrier ?? order.carrierOther ?? "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium text-gray-900">{order.trackingNumber}</p>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated Delivery</p>
                  <p className="font-medium text-gray-900">
                    {order.estimatedDeliveryDate
                      ? format(new Date(order.estimatedDeliveryDate), "MMM d, yyyy")
                      : "Not set"}
                  </p>
                </div>
                {order.actualDeliveryDate && (
                  <div>
                    <p className="text-xs text-gray-500">Delivered On</p>
                    <p className="font-medium text-green-600">
                      {format(new Date(order.actualDeliveryDate), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                )}
              </div>
              {order.receivedBy && (
                <div className="mt-3 rounded bg-green-50 p-2">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Received by:</span> {order.receivedBy}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Package className="h-4 w-4 text-gray-400" />
              Items ({order.items.length})
            </h3>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.images[0]?.url ? (
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {Number(item.quantity)} {item.unitType} × {formatCurrency(Number(item.finalUnitPrice ?? item.unitPrice))}
                    </p>
                    {Number(item.weightKg) > 0 && (
                      <p className="text-xs text-gray-400">
                        Weight: {Number(item.weightKg).toFixed(2)} kg
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(item.finalTotalPrice ?? item.totalPrice))}
                    </p>
                    {item.finalTotalPrice && Number(item.finalTotalPrice) !== Number(item.totalPrice) && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatCurrency(Number(item.totalPrice))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(itemTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-medium text-gray-900">
                    {Number(order.estimatedWeightKg).toFixed(2)} kg
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          {statusHistory && statusHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-gray-400" />
                Status History
              </h3>
              <div className="space-y-3">
                {statusHistory.map((history, index) => (
                  <div
                    key={history.id}
                    className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        index === 0 ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {(() => {
                        const StatusIcon =
                          statusConfig[history.toStatus as keyof typeof statusConfig]?.icon ?? Clock;
                        return <StatusIcon className="h-4 w-4" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            statusConfig[history.toStatus as keyof typeof statusConfig]?.variant ?? "default"
                          }
                          className="text-xs"
                        >
                          {statusConfig[history.toStatus as keyof typeof statusConfig]?.label ??
                            history.toStatus}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          from{" "}
                          {statusConfig[history.fromStatus as keyof typeof statusConfig]?.label ??
                            history.fromStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {history.changedByName} ({history.changedByRole})
                      </p>
                      {history.notes && (
                        <p className="mt-1 text-sm text-gray-500">{history.notes}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {format(new Date(history.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-amber-50 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-amber-600" />
                Order Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add Tracking Modal Component
function AddTrackingModal({
  orderId,
  carriers,
  onClose,
  onSuccess,
}: {
  orderId: string;
  carriers: { value: string; label: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [carrier, setCarrier] = useState("");
  const [carrierOther, setCarrierOther] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");

  const addTrackingMutation = api.shipping.addTracking.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addTrackingMutation.mutateAsync({
        orderId,
        carrier: carrier as "JT_EXPRESS" | "LALAMOVE" | "GRAB_EXPRESS" | "LBC" | "GOGO_XPRESS" | "NINJA_VAN" | "SELF_DELIVERY" | "OTHER",
        carrierOther: carrier === "OTHER" ? carrierOther : undefined,
        trackingNumber,
        trackingUrl: trackingUrl || undefined,
        estimatedDeliveryDate: estimatedDate ? new Date(estimatedDate) : undefined,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to add tracking:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Add Shipping Details</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter the tracking information for this shipment.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Carrier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shipping Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">Select a carrier...</option>
              {carriers.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Other Carrier Name */}
          {carrier === "OTHER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Carrier Name
              </label>
              <input
                type="text"
                value={carrierOther}
                onChange={(e) => setCarrierOther(e.target.value)}
                required
                placeholder="Enter carrier name"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          )}

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
              placeholder="Enter tracking number"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Custom Tracking URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tracking URL{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Estimated Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              disabled={addTrackingMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {addTrackingMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Ship Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
