"use client";

import { useState } from "react";
import { Search, X, Loader2, Check, Image as ImageIcon } from "lucide-react";
import { api } from "~/trpc/react";

interface PexelsImage {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface PexelsImagePickerProps {
  selectedImageUrl: string | null;
  onSelect: (imageUrl: string | null) => void;
}

export function PexelsImagePicker({
  selectedImageUrl,
  onSelect,
}: PexelsImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("seafood");
  const [debouncedQuery, setDebouncedQuery] = useState("seafood");

  const { data, isLoading } = api.pexels.search.useQuery(
    { query: debouncedQuery, perPage: 12 },
    { enabled: isOpen && debouncedQuery.length > 0 }
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Simple debounce
    const timeout = setTimeout(() => {
      if (value.trim()) {
        setDebouncedQuery(value.trim());
      }
    }, 500);
    return () => clearTimeout(timeout);
  };

  const handleSelect = (image: PexelsImage) => {
    onSelect(image.url);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onSelect(null);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        Product Image
      </label>

      {selectedImageUrl ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
            <img
              src={selectedImageUrl}
              alt="Selected product"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-white/80">
                Image from Pexels
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-md bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-teal-400 hover:bg-teal-50/50"
        >
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-600">
              Select image from Pexels
            </p>
            <p className="text-xs text-gray-400">
              Search and choose a product image
            </p>
          </div>
        </button>
      )}

      {/* Image Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Product Image
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for images (e.g., fish, salmon, shrimp)"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Photos provided by{" "}
                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  Pexels
                </a>
              </p>
            </div>

            {/* Image Grid */}
            <div className="max-h-[50vh] overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="ml-3 text-gray-600">Loading images...</span>
                </div>
              ) : data?.images && data.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {data.images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleSelect(image)}
                      className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageUrl === image.url
                          ? "border-teal-500 ring-2 ring-teal-500"
                          : "border-transparent hover:border-teal-300"
                      }`}
                    >
                      <img
                        src={image.thumbUrl}
                        alt={image.alt}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      {selectedImageUrl === image.url && (
                        <div className="absolute right-2 top-2 rounded-full bg-teal-500 p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-xs text-white">
                          by {image.photographer}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    No images found. Try a different search term.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
