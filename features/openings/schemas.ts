import { z } from 'zod';
import { openingSchema } from '@/types/schemas';

export const createOpeningFormSchema = openingSchema.omit({
  id: true,
  createdAt: true,
  status: true,
  managerId: true,
});

export type CreateOpeningFormData = z.infer<typeof createOpeningFormSchema>;
