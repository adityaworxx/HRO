import { z } from 'zod';
import { candidateSchema } from '@/types/schemas';

export const createCandidateFormSchema = candidateSchema.omit({
  id: true,
  managerDecision: true,
  managerComment: true,
  interviewDate: true,
  interviewMode: true,
  interviewOutcome: true,
  interviewNote: true,
});

export type CreateCandidateFormData = z.infer<typeof createCandidateFormSchema>;
