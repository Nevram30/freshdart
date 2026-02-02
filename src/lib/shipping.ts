// Shipping cost calculation based on weight and cold chain requirements

export interface ShippingRate {
  name: string;
  basePrice: number;
  pricePerKg: number;
  minWeightKg: number;
  maxWeightKg: number | null;
  estimatedDays: number;
}

export interface ColdChainConfig {
  surchargePerKg: number;
  additionalBaseFee: number;
  reducedShelfLifeMultiplier: number; // Multiplier for express shipping recommendation
}

// Cold chain configuration
export const COLD_CHAIN_CONFIG: ColdChainConfig = {
  surchargePerKg: 25, // PHP 25 per kg for cold chain
  additionalBaseFee: 50, // Additional base fee for cold chain handling
  reducedShelfLifeMultiplier: 0.5, // Products with < 3 days shelf life should use express
};

// Product types that require cold chain
export const COLD_CHAIN_PRODUCT_TYPES = ["FRESH", "FROZEN", "LIVE"] as const;

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
  {
    name: "Express Delivery",
    basePrice: 200,
    pricePerKg: 20,
    minWeightKg: 10,
    maxWeightKg: null,
    estimatedDays: 1,
  },
];

// Cold chain specific rates
export const COLD_CHAIN_SHIPPING_RATES: ShippingRate[] = [
  {
    name: "Cold Chain Standard",
    basePrice: 100,
    pricePerKg: 25,
    minWeightKg: 0,
    maxWeightKg: 5,
    estimatedDays: 2,
  },
  {
    name: "Cold Chain Standard",
    basePrice: 150,
    pricePerKg: 20,
    minWeightKg: 5,
    maxWeightKg: 15,
    estimatedDays: 2,
  },
  {
    name: "Cold Chain Standard",
    basePrice: 200,
    pricePerKg: 18,
    minWeightKg: 15,
    maxWeightKg: null,
    estimatedDays: 2,
  },
  {
    name: "Cold Chain Express",
    basePrice: 250,
    pricePerKg: 35,
    minWeightKg: 0,
    maxWeightKg: 10,
    estimatedDays: 1,
  },
  {
    name: "Cold Chain Express",
    basePrice: 300,
    pricePerKg: 30,
    minWeightKg: 10,
    maxWeightKg: null,
    estimatedDays: 1,
  },
];

export interface ShippingCalculationResult {
  cost: number;
  estimatedDays: number;
  rateName: string;
  coldChainSurcharge: number;
  totalCost: number;
  requiresColdChain: boolean;
  warnings: string[];
}

export interface ProductShippingInfo {
  weightKg: number;
  requiresColdChain: boolean;
  productType: string;
  shelfLifeDays?: number;
}

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

/**
 * Calculate shipping cost with cold chain support
 */
export function calculateShippingWithColdChain(
  products: ProductShippingInfo[],
  shippingType: "standard" | "express" = "standard"
): ShippingCalculationResult {
  const warnings: string[] = [];

  // Calculate totals
  let totalWeightKg = 0;
  let coldChainWeightKg = 0;
  let requiresColdChain = false;
  let minShelfLife = Infinity;

  for (const product of products) {
    totalWeightKg += product.weightKg;

    // Check if product requires cold chain
    const needsColdChain =
      product.requiresColdChain ||
      COLD_CHAIN_PRODUCT_TYPES.includes(product.productType as typeof COLD_CHAIN_PRODUCT_TYPES[number]);

    if (needsColdChain) {
      coldChainWeightKg += product.weightKg;
      requiresColdChain = true;
    }

    // Track minimum shelf life
    if (product.shelfLifeDays !== undefined && product.shelfLifeDays < minShelfLife) {
      minShelfLife = product.shelfLifeDays;
    }
  }

  // Generate warnings
  if (requiresColdChain && shippingType === "standard") {
    warnings.push(
      "This order contains cold chain products. Express shipping is recommended for optimal freshness."
    );
  }

  if (minShelfLife <= 2 && shippingType === "standard") {
    warnings.push(
      "Some products have a short shelf life. Consider express shipping to ensure freshness."
    );
  }

  // Select appropriate rates
  const rates = requiresColdChain
    ? COLD_CHAIN_SHIPPING_RATES.filter((rate) =>
        shippingType === "express"
          ? rate.name.toLowerCase().includes("express")
          : rate.name.toLowerCase().includes("standard")
      )
    : DEFAULT_SHIPPING_RATES.filter((rate) =>
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
    const fallback = rates[rates.length - 1];
    if (!fallback) {
      return {
        cost: 0,
        estimatedDays: 3,
        rateName: "Free Shipping",
        coldChainSurcharge: 0,
        totalCost: 0,
        requiresColdChain,
        warnings,
      };
    }

    const baseCost = fallback.basePrice + totalWeightKg * fallback.pricePerKg;
    const coldChainSurcharge = requiresColdChain
      ? COLD_CHAIN_CONFIG.additionalBaseFee +
        coldChainWeightKg * COLD_CHAIN_CONFIG.surchargePerKg
      : 0;

    return {
      cost: baseCost,
      estimatedDays: fallback.estimatedDays,
      rateName: fallback.name,
      coldChainSurcharge,
      totalCost: baseCost + coldChainSurcharge,
      requiresColdChain,
      warnings,
    };
  }

  const baseCost = applicableRate.basePrice + totalWeightKg * applicableRate.pricePerKg;

  // For cold chain rates, surcharge is already built into the rate
  // For regular rates with cold chain products, add surcharge
  const coldChainSurcharge =
    !applicableRate.name.includes("Cold Chain") && requiresColdChain
      ? COLD_CHAIN_CONFIG.additionalBaseFee +
        coldChainWeightKg * COLD_CHAIN_CONFIG.surchargePerKg
      : 0;

  return {
    cost: baseCost,
    estimatedDays: applicableRate.estimatedDays,
    rateName: applicableRate.name,
    coldChainSurcharge,
    totalCost: baseCost + coldChainSurcharge,
    requiresColdChain,
    warnings,
  };
}

/**
 * Check if an order requires cold chain shipping
 */
export function requiresColdChainShipping(products: ProductShippingInfo[]): boolean {
  return products.some(
    (product) =>
      product.requiresColdChain ||
      COLD_CHAIN_PRODUCT_TYPES.includes(product.productType as typeof COLD_CHAIN_PRODUCT_TYPES[number])
  );
}

/**
 * Get recommended shipping type based on products
 */
export function getRecommendedShippingType(
  products: ProductShippingInfo[]
): "standard" | "express" {
  // Check for cold chain or short shelf life
  const hasColdChain = requiresColdChainShipping(products);
  const hasShortShelfLife = products.some(
    (p) => p.shelfLifeDays !== undefined && p.shelfLifeDays <= 2
  );

  if (hasShortShelfLife || (hasColdChain && products.length > 0)) {
    return "express";
  }

  return "standard";
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

// Carrier information for tracking
export const SHIPPING_CARRIERS = [
  {
    id: "JT_EXPRESS",
    name: "J&T Express",
    trackingUrl: "https://www.jtexpress.ph/trajectoryQuery?waybillNo={tracking}",
    supportsColdChain: false,
  },
  {
    id: "LALAMOVE",
    name: "Lalamove",
    trackingUrl: null,
    supportsColdChain: true,
  },
  {
    id: "GRAB_EXPRESS",
    name: "Grab Express",
    trackingUrl: null,
    supportsColdChain: true,
  },
  {
    id: "LBC",
    name: "LBC Express",
    trackingUrl: "https://www.lbcexpress.com/track?tracking_no={tracking}",
    supportsColdChain: false,
  },
  {
    id: "GOGO_XPRESS",
    name: "GoGo Xpress",
    trackingUrl: "https://gogoxpress.com/track/{tracking}",
    supportsColdChain: true,
  },
  {
    id: "NINJA_VAN",
    name: "Ninja Van",
    trackingUrl: "https://www.ninjavan.co/en-ph/tracking?id={tracking}",
    supportsColdChain: false,
  },
  {
    id: "SELF_DELIVERY",
    name: "Self Delivery",
    trackingUrl: null,
    supportsColdChain: true,
  },
] as const;

/**
 * Get carriers that support cold chain
 */
export function getColdChainCarriers() {
  return SHIPPING_CARRIERS.filter((carrier) => carrier.supportsColdChain);
}

/**
 * Generate tracking URL for a carrier
 */
export function generateTrackingUrl(
  carrierId: string,
  trackingNumber: string
): string | null {
  const carrier = SHIPPING_CARRIERS.find((c) => c.id === carrierId);
  if (!carrier?.trackingUrl) return null;
  return carrier.trackingUrl.replace("{tracking}", trackingNumber);
}
