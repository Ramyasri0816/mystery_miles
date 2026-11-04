import { z } from 'zod';

export const travelDiscoverySchema = z.object({
  budget: z.coerce.number().positive('Budget must be greater than 0').optional(),
  budgetTier: z.enum(['budget', 'mid-range', 'luxury', 'any']).optional(),
  availableTimeDays: z.coerce.number().int().min(1, 'At least 1 day is required').max(90).optional(),
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
  travelStyle: z.string().trim().toLowerCase().optional()
});

export const destinationIdSchema = z.object({
  id: z.string().min(1, 'Destination ID is required')
});
