import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createSavedTripSchema = z.object({
  destinationId: objectIdSchema,
  notes: z.string().trim().max(1000).optional(),
  visitedStatus: z.enum(['planned', 'visited']).default('planned'),
  targetDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  targetBudget: z.coerce.number().min(0).optional().nullable()
});

export const updateSavedTripSchema = z.object({
  notes: z.string().trim().max(1000).optional(),
  visitedStatus: z.enum(['planned', 'visited']).optional(),
  targetDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  targetBudget: z.coerce.number().min(0).optional().nullable()
});

export const savedTripIdParamSchema = z.object({
  id: objectIdSchema
});
