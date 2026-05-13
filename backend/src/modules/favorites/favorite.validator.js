const { z } = require('zod');

const addFavoriteSchema = z.object({
  animeId: z.string().or(z.number()).transform(v => String(v)),
  title: z.string(),
  imageUrl: z.string().optional(),
  malId: z.string().optional().or(z.number()).transform(v => v ? String(v) : undefined),
});

module.exports = {
  addFavoriteSchema,
};
