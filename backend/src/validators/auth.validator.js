import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
}).strict(); // strict rejects unexpected keys like 'role' to prevent privilege escalation

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  avatar: z.string().trim().optional()
}).strict(); // strictly rejects 'role'

export const updatePreferencesSchema = z.object({
  startingLocation: z.string().trim().optional(),
  budgetTier: z.enum(['budget', 'mid-range', 'luxury', 'any']).optional(),
  preferredStyle: z.enum(['solo', 'couple', 'family', 'adventure', 'relaxation', 'backpacker', 'luxury', 'cultural', 'any']).optional(),
  interests: z.array(z.string().trim().toLowerCase()).optional(),
  preferredDurationDays: z.coerce.number().int().min(1).max(90).optional()
});
