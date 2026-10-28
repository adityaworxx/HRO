import { generateSeedData } from '@/scripts/seed';
import type {
  Opening,
  Candidate,
  OnboardingItem,
  ActivityEvent,
  User,
  Notification,
} from '@/types/entities';
import { LOCAL_STORAGE_KEY } from '@/lib/constants';

export interface StoreState {
  version: string;
  users: User[];
  openings: Opening[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  activities: ActivityEvent[];
  notifications: Notification[];
}

let memoryStore: StoreState | null = null;

function getInitialStore(): StoreState {
  const seed = generateSeedData();
  const initialNotifications: Notification[] = [
    {
      id: crypto.randomUUID(),
      recipientRole: 'manager',
      title: '3 Candidates Shortlisted',
      message: 'Talent Acquisition shortlisted 3 candidates for Senior Backend Engineer.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      link: '/shortlist',
    },
    {
      id: crypto.randomUUID(),
      recipientRole: 'manager',
      title: 'Candidate Shared for Review',
      message: 'HR shared candidate Priya Sharma for technical review.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: false,
      link: '/shortlist',
    },
    {
      id: crypto.randomUUID(),
      recipientRole: 'hr',
      title: 'New Opening Awaiting Sourcing',
      message: 'Hiring Manager created opening "Principal DevOps Architect" (Engineering).',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      link: '/openings',
    },
    {
      id: crypto.randomUUID(),
      recipientRole: 'hr',
      title: 'Review Complete: 2 Shortlisted',
      message: 'Manager completed review and requested interview scheduling.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      read: true,
      link: '/interviews',
    },
  ];

  return {
    version: LOCAL_STORAGE_KEY,
    users: seed.users,
    openings: seed.openings,
    candidates: seed.candidates,
    onboarding: seed.onboarding,
    activities: seed.activities,
    notifications: initialNotifications,
  };
}

export function getStore(): StoreState {
  if (typeof window === 'undefined') {
    if (!memoryStore) {
      memoryStore = getInitialStore();
    }
    return memoryStore;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      if (parsed.version === LOCAL_STORAGE_KEY) {
        if (!Array.isArray(parsed.notifications)) {
          parsed.notifications = getInitialStore().notifications;
        }
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn('Failed to parse localStorage store, resetting to seed data.', err);
  }

  const initial = getInitialStore();
  saveStore(initial);
  memoryStore = initial;
  return memoryStore;
}

export function saveStore(state: StoreState): void {
  memoryStore = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }
}

export function resetStore(): StoreState {
  const fresh = getInitialStore();
  saveStore(fresh);
  return fresh;
}
