import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(numPrice);
}

export function formatWeight(weightKg: number): string {
  if (weightKg < 1) {
    return `${Math.round(weightKg * 1000)}g`;
  }
  return `${weightKg.toFixed(2)}kg`;
}

export function getDaysUntilExpiry(bestBefore: Date | null): number | null {
  if (!bestBefore) return null;
  const now = new Date();
  const diffTime = bestBefore.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
