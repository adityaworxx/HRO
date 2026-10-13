import { env } from '@/lib/env';
import type { HroApiClient } from './api';
import { mockApi } from './mock/mockApi';
import { httpApi } from './http/httpApi';

export const api: HroApiClient = env.NEXT_PUBLIC_DATA_SOURCE === 'http' ? httpApi : mockApi;

export type { HroApiClient };
export * from './api';
