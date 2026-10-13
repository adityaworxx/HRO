import { generateSeedData } from '@/scripts/seed';
import type { Opening, Candidate, OnboardingItem, ActivityEvent, User } from '@/types/entities';
import { LOCAL_STORAGE_KEY } from '@/lib/constants';

export interface StoreState {
  version: string;
  users: User[];
  openings: Opening[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  activities: ActivityEvent[];
}

let memoryStore: StoreState | null = null;

function getInitialStore(): StoreState {
  const seed = generateSeedData();
  return {
    version: LOCAL_STORAGE_KEY,
    users: seed.users,
    openings: seed.openings,
    candidates: seed.candidates,
    onboarding: seed.onboarding,
    activities: seed.activities,
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
