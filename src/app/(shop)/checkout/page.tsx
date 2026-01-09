"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Lock, CreditCard, Truck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CartSummary } from "~/components/cart/cart-summary";
import { DeliveryDatePicker } from "~/components/checkout/delivery-date-picker";
import { useCartStore } from "~/stores/cart-store";
import { api } from "~/trpc/react";
import { formatPrice } from "~/lib/utils";

type ShippingType = "standard" | "express";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getShippingCost = useCartStore((state) => state.getShippingCost);

  const [shippingType, setShippingType] = useState<ShippingType>("standard");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    deliveryNotes: "",
  });

  const createSession = api.checkout.createSession.useMutation({
    onSuccess: (data) => {
      clearCart();
      // Redirect to Paymongo checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      alert(error.message);
      setIsSubmitting(false);
    },
  });

  const shipping = getShippingCost(shippingType);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select a delivery date and time slot");
      return;
    }

    setIsSubmitting(true);

    createSession.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: "Philippines",
        phone: formData.phone,
      },
      deliveryDate: selectedDate,
      deliveryTimeSlot: selectedTimeSlot,
      deliveryNotes: formData.deliveryNotes || undefined,
      shippingType,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mb-6 text-gray-500">
          Add some products before checking out.
        </p>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-green-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Shipping Address */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main St, Barangay..."
                      required
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Manila"
                    required
                  />
                  <Input
                    label="State/Province"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Metro Manila"
                    required
                  />
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="1000"
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>
              </section>

              {/* Shipping Method */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Shipping Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                      shippingType === "standard"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingType"
                        value="standard"
                        checked={shippingType === "standard"}
                        onChange={() => setShippingType("standard")}
                        className="h-4 w-4 text-green-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          Standard Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          Delivered in 2-3 business days
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(
                        getShippingCost("standard").cost
                      )}
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                      shippingType === "express"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingType"
                        value="express"
                        checked={shippingType === "express"}
                        onChange={() => setShippingType("express")}
                        className="h-4 w-4 text-green-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          Express Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          Delivered next business day
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(
                        getShippingCost("express").cost
                      )}
                    </span>
                  </label>
                </div>
              </section>

              {/* Delivery Schedule */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Delivery Schedule
                </h2>

                <DeliveryDatePicker
                  estimatedDays={shipping.estimatedDays}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onDateChange={setSelectedDate}
                  onTimeSlotChange={setSelectedTimeSlot}
                />

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
              </section>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="mb-6 max-h-64 space-y-4 overflow-y-auto">
                  {items.map((item) => {
                    const primaryImage =
                      item.product.images.find((img) => img.isPrimary) ??
                      item.product.images[0];
                    const price =
                      typeof item.product.price === "number"
                        ? item.product.price
                        : parseFloat(item.product.price.toString());

                    return (
                      <div key={item.productId} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">
                              🥬
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-gray-900">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} {item.product.stockUnit}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <CartSummary shippingType={shippingType} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full gap-2"
                  isLoading={isSubmitting}
                  disabled={!selectedDate || !selectedTimeSlot}
                >
                  <Lock className="h-4 w-4" />
                  Proceed to Payment
                </Button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3 w-3" />
                  <span>Secured by Paymongo</span>
                </div>

                {/* Payment Methods */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Visa, Mastercard, GCash, GrabPay, Maya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
