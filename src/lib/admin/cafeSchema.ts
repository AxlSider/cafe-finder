import { z } from "zod";

/** Shared validation for admin cafe create/update. */
export const cafeInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  region: z.enum(["LUZON", "SWITZERLAND"]),
  locality: z.string().trim().min(1).max(160),
  address: z.string().trim().max(400).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().int().min(0).optional().nullable(),
  priceLevel: z.enum(["BUDGET", "MODERATE", "EXPENSIVE"]).optional().nullable(),
  phone: z.string().trim().max(60).optional().nullable(),
  website: z.string().trim().url().max(300).optional().nullable().or(z.literal("")),
  description: z.string().trim().max(1000).optional().nullable(),
  ratingSource: z.string().trim().max(120).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  photoAttribution: z.string().trim().max(300).optional().nullable(),
  googlePlaceId: z.string().trim().max(200).optional().nullable(),
  featured: z.boolean().optional(),
  featuredRank: z.coerce.number().int().optional().nullable(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

export type CafeInput = z.infer<typeof cafeInputSchema>;
