import { z } from 'zod';

export const createTuitionPostSchema = z.object({
  description: z.string({ required_error: 'Description is required' }),
  preferredTimeSlots: z.array(z.string(), { required_error: 'Preferred time slots are required' }),
  pay: z.number({ required_error: 'Pay is required' }),
  payType: z.enum(['fixed', 'negotiable'], { required_error: 'Pay type is required' }),
  mode: z.enum(['online', 'offline', 'hybrid'], { required_error: 'Mode is required' }),
  residingLocation: z.string({ required_error: 'Residing location is required' }),
  grade: z.string({ required_error: 'Grade is required' }),
  subject: z.array(z.string(), { required_error: 'Subject is required' }),
  tuitionLocation: z.string({ required_error: 'Tuition location is required' }),
  areaRange: z.string({ required_error: 'Area range is required' }),
  expiryDate: z.coerce.date({ required_error: 'Expiry date is required' }),
  sessionFrequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'flexible'], { required_error: 'Session frequency is required' }),
  numberOfStudents: z.number({ required_error: 'Number of students is required' }),
  tutorRequirements: z.array(z.string()).optional(),
  tutorGenderPreference: z.enum(['male', 'female', 'any']).optional(),
  additionalNotes: z.string().optional(),
});

export const updateTuitionPostSchema = createTuitionPostSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const getTuitionPostsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  page_size: z.coerce.number().min(1).max(100).default(10),
  sort_by: z.enum([
    'id', 
    'description', 
    'pay', 
    'mode', 
    'grade', 
    'expiryDate', 
    'created_at', 
    'residingLocation'
  ]).default('created_at'),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
  mode: z.enum(['online', 'offline', 'hybrid']).optional(),
  pay_min: z.coerce.number().min(0).optional(),
  pay_max: z.coerce.number().min(0).optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export const idSchema = z.object({
    id: z.coerce.number().min(1, 'ID must be a positive number').int('ID must be an integer'),
  });

export type CreateTuitionPostInput = z.infer<typeof createTuitionPostSchema>;
export type UpdateTuitionPostInput = z.infer<typeof updateTuitionPostSchema>;
export type GetTuitionPostsQuery = z.infer<typeof getTuitionPostsQuerySchema>;
export type IdInput = z.infer<typeof idSchema>;