import { z } from 'zod';
import { notificationSchema } from '@/types/schemas';

export { notificationSchema };
export const notificationFilterSchema = z.object({
  unreadOnly: z.boolean().optional(),
});
