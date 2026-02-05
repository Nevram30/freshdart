"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingCart, Trash2, FileText, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BulkOrderItem } from "./bulk-order-item";
import { BulkOrderSummary } from "./bulk-order-summary";
import { useBulkOrderStore } from "~/stores/bulk-order-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type FormMode = "list" | "submit" | "quote";

interface ContactInfo {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
}

export function BulkOrderDrawer() {
  const router = useRouter();
  const isOpen = useBulkOrderStore((state) => state.isOpen);
  const closeDrawer = useBulkOrderStore((state) => state.closeDrawer);
  const items = useBulkOrderStore((state) => state.items);
  const clearOrder = useBulkOrderStore((state) => state.clearOrder);
  const getItemCount = useBulkOrderStore((state) => state.getItemCount);

  const [formMode, setFormMode] = useState<FormMode>("list");
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyName: "",
  });
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // tRPC mutations
  const submitBulkOrder = api.bulkOrder.submitBulkOrder.useMutation({
    onSuccess: (data) => {
      // If checkout URL is available, redirect to payment
      if (data.checkoutUrl) {
        setSuccessMessage("Order created! Redirecting to payment...");
        clearOrder();
        closeDrawer();
        setFormMode("list");
        resetForm();
        // Redirect to Paymongo checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback if payment session creation failed
        setSuccessMessage(data.message);
        setTimeout(() => {
          clearOrder();
          closeDrawer();
          setFormMode("list");
          setSuccessMessage(null);
          resetForm();
          router.push("/merchant/orders");
        }, 3000);
      }
    },
  });

  const requestQuote = api.bulkOrder.requestQuote.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      setTimeout(() => {
        clearOrder();
        closeDrawer();
        setFormMode("list");
        setSuccessMessage(null);
        resetForm();
      }, 3000);
    },
  });

  const resetForm = () => {
    setContactInfo({
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      companyName: "",
    });
    setDeliveryNotes("");
    setQuoteNotes("");
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    if (!contactInfo.contactName || !contactInfo.contactEmail || !contactInfo.contactPhone) {
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      variantId: item.variantId,
    }));

    submitBulkOrder.mutate({
      items: orderItems,
      contactInfo,
      deliveryNotes: deliveryNotes || undefined,
    });
  };

  const handleRequestQuote = async () => {
    if (!contactInfo.contactName || !contactInfo.contactEmail || !contactInfo.contactPhone) {
      return;
    }

    const quoteItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      variantId: item.variantId,
    }));

    requestQuote.mutate({
      items: quoteItems,
      contactInfo,
      notes: quoteNotes || undefined,
    });
  };

  const isLoading = submitBulkOrder.isPending || requestQuote.isPending;
  const error = submitBulkOrder.error ?? requestQuote.error;

  const isFormValid = contactInfo.contactName && contactInfo.contactEmail && contactInfo.contactPhone;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-teal-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              {formMode === "list" && "Bulk Order"}
              {formMode === "submit" && "Submit Order"}
              {formMode === "quote" && "Request Quote"}
            </h2>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
              {getItemCount()} products
            </span>
          </div>
          <button
            onClick={() => {
              if (formMode !== "list") {
                setFormMode("list");
              } else {
                closeDrawer();
              }
            }}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={formMode !== "list" ? "Go back" : "Close bulk order"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-3 bg-green-50 px-6 py-4 text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 px-6 py-4 text-red-800">
            <p className="text-sm font-medium">{error.message}</p>
          </div>
        )}

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
              <ShoppingCart className="h-10 w-10 text-teal-300" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No items yet
            </h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              Browse our sourcing market and add products to your bulk order. We offer competitive wholesale pricing for merchants.
            </p>
            <Button onClick={closeDrawer} variant="primary" className="bg-teal-600 hover:bg-teal-700">
              Browse Products
            </Button>
          </div>
        ) : formMode === "list" ? (
          <>
            {/* Clear All Button */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-2">
              <p className="text-sm text-gray-600">Review your bulk order</p>
              <button
                onClick={clearOrder}
                className="flex items-center gap-1.5 text-sm text-red-600 transition-colors hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <BulkOrderItem key={item.productId} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <BulkOrderSummary />

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setFormMode("submit")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  <Send className="h-4 w-4" />
                  Submit Bulk Order Request
                </button>
                <button
                  onClick={() => setFormMode("quote")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Request Quote
                </button>
                <button
                  onClick={closeDrawer}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Contact Form */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {formMode === "submit" ? "Order Details" : "Quote Request Details"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide your contact information so we can process your request.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      value={contactInfo.contactName}
                      onChange={(e) => setContactInfo({ ...contactInfo, contactName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={contactInfo.contactEmail}
                      onChange={(e) => setContactInfo({ ...contactInfo, contactEmail: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={contactInfo.contactPhone}
                      onChange={(e) => setContactInfo({ ...contactInfo, contactPhone: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={contactInfo.companyName}
                      onChange={(e) => setContactInfo({ ...contactInfo, companyName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Enter your company name"
                    />
                  </div>

                  {formMode === "submit" && (
                    <div>
                      <label htmlFor="deliveryNotes" className="block text-sm font-medium text-gray-700">
                        Delivery Notes <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        id="deliveryNotes"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Any special delivery instructions..."
                      />
                    </div>
                  )}

                  {formMode === "quote" && (
                    <div>
                      <label htmlFor="quoteNotes" className="block text-sm font-medium text-gray-700">
                        Additional Notes <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        id="quoteNotes"
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Any additional requirements or questions..."
                      />
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-gray-600">
                        <span className="truncate pr-2">{item.product.name}</span>
                        <span className="whitespace-nowrap">
                          {item.quantity} {item.product.stockUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <BulkOrderSummary compact />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="space-y-2">
                {formMode === "submit" ? (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isLoading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Bulk Order
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRequestQuote}
                    disabled={isLoading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Request Quote
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setFormMode("list")}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back to Items
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
