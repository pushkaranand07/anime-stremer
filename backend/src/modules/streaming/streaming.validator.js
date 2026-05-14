const { z } = require('zod');

const infoQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(200, 'Query too long').trim(),
});

const watchParamsSchema = z.object({
  episodeId: z.string().min(1).max(500),
});

const watchQuerySchema = z.object({
  provider: z.string().optional().default('Hianime'),
  subOrDub: z.enum(['sub', 'dub']).optional().default('sub'),
});

module.exports = { infoQuerySchema, watchParamsSchema, watchQuerySchema };
