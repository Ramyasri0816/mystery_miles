import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().trim().max(100).optional(),
  comment: z
    .string({ required_error: 'Comment is required' })
    .trim()
    .min(5, 'Review comment must be at least 5 characters')
    .max(2000, 'Review comment cannot exceed 2000 characters')
});

export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().min(5).max(2000).optional()
});

export const reviewIdParamSchema = z.object({
  id: objectIdSchema
});

export const destinationReviewParamSchema = z.object({
  destinationId: objectIdSchema
});
