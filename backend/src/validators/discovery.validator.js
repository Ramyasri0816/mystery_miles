import { z } from 'zod';

export const spinDiscoverySchema = z.object({
  budget: z
    .coerce
    .number({ required_error: 'Budget is required' })
    .positive('Budget must be greater than zero')
    .min(500, 'Minimum budget for matching is ₹500'),
  durationValue: z
    .coerce
    .number({ required_error: 'Duration value is required' })
    .positive('Duration must be greater than zero')
    .min(1, 'Duration must be at least 1 day or hour'),
  durationUnit: z
    .enum(['days', 'hours'])
    .default('days'),
  startingLocation: z
    .string()
    .trim()
    .optional(),
  interests: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') {
        return val.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      }
      return val.map((s) => s.trim().toLowerCase()).filter(Boolean);
    }),
  travelStyle: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
});
