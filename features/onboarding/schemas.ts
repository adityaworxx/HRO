import { z } from 'zod';
import { onboardingItemSchema } from '@/types/schemas';

export const createOnboardingTaskFormSchema = onboardingItemSchema.omit({
  id: true,
});

export type CreateOnboardingTaskFormData = z.infer<typeof createOnboardingTaskFormSchema>;
