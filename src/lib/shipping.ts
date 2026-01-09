// Shipping cost calculation based on weight

export interface ShippingRate {
  name: string;
  basePrice: number;
  pricePerKg: number;
  minWeightKg: number;
  maxWeightKg: number | null;
  estimatedDays: number;
}

// Default shipping rates (can be configured from database)
export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    name: "Standard Delivery",
    basePrice: 50,
    pricePerKg: 15,
    minWeightKg: 0,
    maxWeightKg: 5,
    estimatedDays: 3,
  },
  {
    name: "Standard Delivery",
    basePrice: 75,
    pricePerKg: 12,
    minWeightKg: 5,
    maxWeightKg: 15,
    estimatedDays: 3,
  },
  {
    name: "Standard Delivery",
    basePrice: 100,
    pricePerKg: 10,
    minWeightKg: 15,
    maxWeightKg: null,
    estimatedDays: 3,
  },
  {
    name: "Express Delivery",
    basePrice: 150,
    pricePerKg: 25,
    minWeightKg: 0,
    maxWeightKg: 10,
    estimatedDays: 1,
  },
];

export function calculateShippingCost(
  totalWeightKg: number,
  shippingType: "standard" | "express" = "standard"
): { cost: number; estimatedDays: number; rateName: string } {
  const rates = DEFAULT_SHIPPING_RATES.filter((rate) =>
    shippingType === "express"
      ? rate.name.toLowerCase().includes("express")
      : rate.name.toLowerCase().includes("standard")
  );

  const applicableRate = rates.find(
    (rate) =>
      totalWeightKg >= rate.minWeightKg &&
      (rate.maxWeightKg === null || totalWeightKg < rate.maxWeightKg)
  );

  if (!applicableRate) {
    // Fallback to the highest weight tier
    const fallback = rates[rates.length - 1];
    if (!fallback) {
      return { cost: 0, estimatedDays: 3, rateName: "Free Shipping" };
    }
    return {
      cost: fallback.basePrice + totalWeightKg * fallback.pricePerKg,
      estimatedDays: fallback.estimatedDays,
      rateName: fallback.name,
    };
  }

  return {
    cost: applicableRate.basePrice + totalWeightKg * applicableRate.pricePerKg,
    estimatedDays: applicableRate.estimatedDays,
    rateName: applicableRate.name,
  };
}

export function getAvailableDeliveryDates(
  estimatedDays: number,
  daysToShow = 7
): Date[] {
  const dates: Date[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + estimatedDays);

  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    // Skip Sundays (optional business logic)
    if (date.getDay() !== 0) {
      dates.push(date);
    }
  }

  return dates;
}

export const DELIVERY_TIME_SLOTS = [
  { id: "morning", label: "Morning (8:00 AM - 12:00 PM)" },
  { id: "afternoon", label: "Afternoon (12:00 PM - 5:00 PM)" },
  { id: "evening", label: "Evening (5:00 PM - 8:00 PM)" },
] as const;
