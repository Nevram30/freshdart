import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

export const pexelsRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(30).default(12),
      })
    )
    .query(async ({ input }) => {
      const apiKey = env.PEXELS_API_KEY;

      if (!apiKey) {
        return {
          total: 6,
          totalPages: 1,
          images: getDemoImages(input.query),
        };
      }

      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(input.query)}&page=${input.page}&per_page=${input.perPage}`,
          {
            headers: {
              Authorization: apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch images from Pexels");
        }

        const data = (await response.json()) as PexelsSearchResponse;

        return {
          total: data.total_results,
          totalPages: Math.ceil(data.total_results / input.perPage),
          images: data.photos.map((photo) => ({
            id: String(photo.id),
            url: photo.src.large,
            thumbUrl: photo.src.medium,
            alt: photo.alt || `Photo by ${photo.photographer}`,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
          })),
        };
      } catch (error) {
        console.error("Pexels API error:", error);
        return {
          total: 6,
          totalPages: 1,
          images: getDemoImages(input.query),
        };
      }
    }),
});

function getDemoImages(query: string) {
  const seafoodKeywords = ["fish", "seafood", "salmon", "tuna", "shrimp", "lobster", "crab", "oyster"];
  const isSeafoodQuery = seafoodKeywords.some((k) => query.toLowerCase().includes(k));

  const baseImages = isSeafoodQuery
    ? [
        { id: "1", keyword: "fresh+fish" },
        { id: "2", keyword: "salmon+fillet" },
        { id: "3", keyword: "seafood+market" },
        { id: "4", keyword: "raw+fish" },
        { id: "5", keyword: "shrimp+prawns" },
        { id: "6", keyword: "tuna+steak" },
      ]
    : [
        { id: "1", keyword: query.replace(/\s+/g, "+") },
        { id: "2", keyword: query.replace(/\s+/g, "+") + "+fresh" },
        { id: "3", keyword: query.replace(/\s+/g, "+") + "+food" },
        { id: "4", keyword: "food+" + query.replace(/\s+/g, "+") },
        { id: "5", keyword: query.replace(/\s+/g, "+") + "+market" },
        { id: "6", keyword: query.replace(/\s+/g, "+") + "+organic" },
      ];

  return baseImages.map((img, index) => ({
    id: `demo-${img.id}`,
    url: `https://images.pexels.com/photos/${getDemoPhotoId(index)}/pexels-photo-${getDemoPhotoId(index)}.jpeg?auto=compress&cs=tinysrgb&w=800`,
    thumbUrl: `https://images.pexels.com/photos/${getDemoPhotoId(index)}/pexels-photo-${getDemoPhotoId(index)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
    alt: `${query} product image`,
    photographer: "Pexels",
    photographerUrl: "https://www.pexels.com",
  }));
}

function getDemoPhotoId(index: number): string {
  const photoIds = [
    "3296398",
    "3296279",
    "566344",
    "725992",
    "3843224",
    "2871757",
  ];
  return photoIds[index % photoIds.length] ?? photoIds[0]!;
}
