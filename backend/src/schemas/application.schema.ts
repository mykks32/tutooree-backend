import { z } from "zod";

export const createTuitionApplicationSchema = z.object({
  coverLetter: z.string({ required_error: 'Cover letter is required' }),
  expectedPay: z.number().optional(),
  availableTimeSlots: z.array(z.string(), { required_error: 'Available time slots are required' }),
  yearsOfExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  preferredMode: z.enum(['online', 'offline', 'hybrid']).optional(),
  additionalNotes: z.string().optional(),
});