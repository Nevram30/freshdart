"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { getAvailableDeliveryDates, DELIVERY_TIME_SLOTS } from "~/lib/shipping";

interface DeliveryDatePickerProps {
  estimatedDays?: number;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onDateChange: (date: Date) => void;
  onTimeSlotChange: (slot: string) => void;
  className?: string;
}

export function DeliveryDatePicker({
  estimatedDays = 1,
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onTimeSlotChange,
  className,
}: DeliveryDatePickerProps) {
  const [startIndex, setStartIndex] = useState(0);
  const dates = getAvailableDeliveryDates(estimatedDays, 14);
  const visibleDates = dates.slice(startIndex, startIndex + 5);

  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + 5 < dates.length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Date Selection */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Select Delivery Date</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartIndex((prev) => Math.max(0, prev - 5))}
            disabled={!canGoBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous dates"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 gap-2 overflow-hidden">
            {visibleDates.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onDateChange(date)}
                  className={cn(
                    "flex flex-1 flex-col items-center rounded-xl border-2 p-3 transition-all",
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium uppercase",
                      isSelected ? "text-green-600" : "text-gray-500"
                    )}
                  >
                    {format(date, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-green-700" : "text-gray-900"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isSelected ? "text-green-600" : "text-gray-500"
                    )}
                  >
                    {format(date, "MMM")}
                  </span>
                  {isToday && (
                    <span className="mt-1 text-[10px] font-medium text-green-600">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setStartIndex((prev) => Math.min(dates.length - 5, prev + 5))
            }
            disabled={!canGoForward}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next dates"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Select Time Slot</h3>
        </div>

        <div className="grid gap-2">
          {DELIVERY_TIME_SLOTS.map((slot) => {
            const isSelected = selectedTimeSlot === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => onTimeSlotChange(slot.id)}
                className={cn(
                  "rounded-xl border-2 px-4 py-3 text-left transition-all",
                  isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    isSelected ? "text-green-700" : "text-gray-900"
                  )}
                >
                  {slot.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedDate && selectedTimeSlot && (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm text-green-700">
            <span className="font-semibold">Delivery scheduled for:</span>
            <br />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
            <br />
            {DELIVERY_TIME_SLOTS.find((s) => s.id === selectedTimeSlot)?.label}
          </p>
        </div>
      )}
    </div>
  );
}
