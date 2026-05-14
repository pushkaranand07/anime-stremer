const { z } = require('zod');

const addFavoriteSchema = z.object({
  animeId: z.union([z.string(), z.number()]).transform(v => String(v)),
  title: z.string().min(1),
  imageUrl: z.string().optional(),
  malId: z.union([z.string(), z.number()]).optional().transform(v => v != null ? String(v) : undefined),
  score: z.number().optional().nullable(),
  episodes: z.number().int().optional().nullable(),
  type: z.string().optional().nullable(),
  genres: z.array(z.string()).optional().default([]),
});

module.exports = {
  addFavoriteSchema,
};
