import { z } from 'zod';
import {
  OPENING_STATUSES,
  CANDIDATE_STAGES,
  CANDIDATE_SOURCES,
  MANAGER_DECISIONS,
  INTERVIEW_OUTCOMES,
  INTERVIEW_MODES,
  URGENCY_LEVELS,
  ONBOARDING_OWNERS,
  ONBOARDING_PHASES,
  ONBOARDING_STATUSES,
} from '@/lib/constants';

export const userRoleSchema = z.enum(['manager', 'hr']);

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: userRoleSchema,
  department: z.string().min(1),
  avatarInitials: z.string().min(1).max(3),
});

export const openingStatusSchema = z.enum(OPENING_STATUSES);

export const openingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  headcount: z.number().int().positive(),
  experienceRange: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  budgetRange: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  mustHaveSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  description: z.string().min(1),
  urgency: z.enum(URGENCY_LEVELS),
  targetStartDate: z.string().datetime(),
  status: openingStatusSchema,
  managerId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const candidateStageSchema = z.enum(CANDIDATE_STAGES);
export const candidateSourceSchema = z.enum(CANDIDATE_SOURCES);
export const managerDecisionSchema = z.enum(MANAGER_DECISIONS);
export const interviewOutcomeSchema = z.enum(INTERVIEW_OUTCOMES);
export const interviewModeSchema = z.enum(INTERVIEW_MODES);

export const candidateSchema = z.object({
  id: z.string().uuid(),
  openingId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  currentCompany: z.string().min(1),
  currentRole: z.string().min(1),
  experienceYears: z.number().nonnegative(),
  noticePeriod: z.string().min(1),
  expectedCtc: z.number().positive(),
  source: candidateSourceSchema,
  profileUrl: z.string().url().optional(),
  resumeFileName: z.string().optional(),
  hrNotes: z.string().optional(),
  stage: candidateStageSchema,
  managerDecision: managerDecisionSchema.default('Pending'),
  managerComment: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
  interviewMode: interviewModeSchema.optional(),
  interviewOutcome: interviewOutcomeSchema.default('Pending'),
  interviewNote: z.string().optional(),
});

export const onboardingItemSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  title: z.string().min(1),
  owner: z.enum(ONBOARDING_OWNERS),
  phase: z.enum(ONBOARDING_PHASES),
  dueDate: z.string().datetime(),
  done: z.boolean(),
  status: z.enum(ONBOARDING_STATUSES).default('Pending'),
  notes: z.string().optional(),
});

export const activityEventSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['opening', 'candidate', 'onboarding']),
  entityId: z.string().uuid(),
  actor: z.string().min(1),
  message: z.string().min(1),
  timestamp: z.string().datetime(),
});

export const notificationSchema = z.object({
  id: z.string().uuid(),
  recipientRole: userRoleSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  read: z.boolean().default(false),
  link: z.string().optional(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
});
