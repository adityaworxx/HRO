import { z } from 'zod';
import {
  userSchema,
  openingSchema,
  candidateSchema,
  onboardingItemSchema,
  activityEventSchema,
  notificationSchema,
  apiErrorSchema,
} from './schemas';

export type User = z.infer<typeof userSchema>;
export type Opening = z.infer<typeof openingSchema>;
export type Candidate = z.infer<typeof candidateSchema>;
export type OnboardingItem = z.infer<typeof onboardingItemSchema>;
export type ActivityEvent = z.infer<typeof activityEventSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
