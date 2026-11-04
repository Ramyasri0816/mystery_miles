import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const destinationQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  state: z.string().trim().optional(),
  budgetTier: z.enum(['budget', 'mid-range', 'luxury']).optional(),
  minDailyBudget: z.coerce.number().min(0).optional(),
  maxDailyBudget: z.coerce.number().min(0).optional(),
  travelStyle: z.string().trim().toLowerCase().optional(),
  season: z.string().trim().optional(),
  interests: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        return val.split(',').map((s) => s.trim().toLowerCase());
      }
      return val.map((s) => s.toLowerCase());
    }),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(['rating', 'price_asc', 'price_desc', 'duration', 'name', 'newest']).default('rating'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const destinationIdParamSchema = z.object({
  id: objectIdSchema
});

export const discoveryQuerySchema = z.object({
  budget: z.coerce.number().positive('Budget must be greater than 0').optional(),
  budgetTier: z.enum(['budget', 'mid-range', 'luxury', 'any']).optional(),
  availableTimeDays: z.coerce.number().int().min(1).max(90).optional(),
  interests: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        return val.split(',').map((s) => s.trim().toLowerCase());
      }
      return val.map((s) => s.toLowerCase());
    }),
  startingLocation: z.string().trim().optional(),
  travelStyle: z.string().trim().toLowerCase().optional(),
  season: z.string().trim().optional(),
  category: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});
