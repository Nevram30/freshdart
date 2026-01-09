"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "~/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max,
  step = 1,
  unit = "unit",
  size = "md",
  className,
}: QuantitySelectorProps) {
  const isWeightBased = unit === "kg" || unit === "g";

  const handleDecrement = () => {
    const newValue = quantity - step;
    if (newValue >= min) {
      onChange(Number(newValue.toFixed(3)));
    }
  };

  const handleIncrement = () => {
    const newValue = quantity + step;
    if (!max || newValue <= max) {
      onChange(Number(newValue.toFixed(3)));
    }
  };

  const sizes = {
    sm: {
      button: "h-7 w-7",
      icon: "h-3 w-3",
      text: "text-sm min-w-[4rem]",
    },
    md: {
      button: "h-9 w-9",
      icon: "h-4 w-4",
      text: "text-base min-w-[5rem]",
    },
    lg: {
      button: "h-11 w-11",
      icon: "h-5 w-5",
      text: "text-lg min-w-[6rem]",
    },
  };

  const sizeStyles = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-gray-200 bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={cn(
          "flex items-center justify-center rounded-l-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600",
          sizeStyles.button
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={sizeStyles.icon} />
      </button>

      <div
        className={cn(
          "flex items-center justify-center border-x border-gray-200 font-medium text-gray-900",
          sizeStyles.text
        )}
      >
        {isWeightBased ? (
          <span>
            {quantity.toFixed(unit === "g" ? 0 : 2)} {unit}
          </span>
        ) : (
          <span>{quantity}</span>
        )}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={max !== undefined && quantity >= max}
        className={cn(
          "flex items-center justify-center rounded-r-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600",
          sizeStyles.button
        )}
        aria-label="Increase quantity"
      >
        <Plus className={sizeStyles.icon} />
      </button>
    </div>
  );
}
