import type { HroApiClient } from '@/services/api';
import type { Opening, Candidate, OnboardingItem, User } from '@/types/entities';
import { getStore, saveStore, resetStore } from './store';
import { simulateLatency, getForceFailure } from './latency';
import { PRIMARY_MANAGER, PRIMARY_HR } from '@/fixtures/users';

function checkFailure(): void {
  if (getForceFailure()) {
    throw {
      code: 'SIMULATED_SERVER_ERROR',
      message: 'Simulated server failure for testing error states and recovery.',
    };
  }
}

let activeUser: User = PRIMARY_MANAGER;

let mockNotifications = [
  {
    id: 'n1',
    recipientRole: 'manager' as const,
    title: '3 Candidates Shortlisted',
    message: 'Hiring Manager shortlisted 3 candidates for Senior Backend Engineer.',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'n2',
    recipientRole: 'manager' as const,
    title: 'New Opening Submitted',
    message: 'Frontend Tech Lead opening has been created and awaits sourcing.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
  {
    id: 'n3',
    recipientRole: 'manager' as const,
    title: 'Interview Scheduled',
    message: 'Technical round with Rohan Mehta confirmed for tomorrow at 11:00 AM.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
];

export const mockApi: HroApiClient = {
  openings: {
    list: async (filter) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      let result = [...store.openings];

      if (filter?.status) {
        result = result.filter((o) => o.status === filter.status);
      }
      if (filter?.department) {
        result = result.filter((o) => o.department === filter.department);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(
          (o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)
        );
      }
      return result;
    },

    getById: async (id) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const item = store.openings.find((o) => o.id === id);
      if (!item) {
        throw { code: 'NOT_FOUND', message: `Opening ${id} was not found.` };
      }
      return item;
    },

    create: async (data) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const newOpening: Opening = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      store.openings.unshift(newOpening);
      saveStore(store);
      return newOpening;
    },

    update: async (id, data) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.openings.findIndex((o) => o.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Opening ${id} not found.` };

      const updated = { ...store.openings[idx]!, ...data };
      store.openings[idx] = updated;
      saveStore(store);
      return updated;
    },

    updateStatus: async (id, status) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.openings.findIndex((o) => o.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Opening ${id} not found.` };

      const updated = { ...store.openings[idx]!, status };
      store.openings[idx] = updated;
      saveStore(store);
      return updated;
    },
  },

  candidates: {
    list: async (filter) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      let result = [...store.candidates];

      if (filter?.openingId) {
        result = result.filter((c) => c.openingId === filter.openingId);
      }
      if (filter?.stage) {
        result = result.filter((c) => c.stage === filter.stage);
      }
      if (filter?.source) {
        result = result.filter((c) => c.source === filter.source);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(
          (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
      }
      return result;
    },

    getById: async (id) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const item = store.candidates.find((c) => c.id === id);
      if (!item) throw { code: 'NOT_FOUND', message: `Candidate ${id} was not found.` };
      return item;
    },

    create: async (data) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const newCandidate: Candidate = {
        ...data,
        id: crypto.randomUUID(),
      };
      store.candidates.unshift(newCandidate);
      saveStore(store);
      return newCandidate;
    },

    updateStage: async (id, stage) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.candidates.findIndex((c) => c.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Candidate ${id} not found.` };

      const updated = { ...store.candidates[idx]!, stage };
      store.candidates[idx] = updated;
      saveStore(store);
      return updated;
    },

    shareWithManager: async (candidateIds, note) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const updatedList: Candidate[] = [];

      store.candidates = store.candidates.map((c) => {
        if (candidateIds.includes(c.id)) {
          const updated = {
            ...c,
            stage: 'Shared with Manager' as const,
            hrNotes: note ? `${c.hrNotes ? c.hrNotes + '\n' : ''}${note}` : c.hrNotes,
          };
          updatedList.push(updated);
          return updated;
        }
        return c;
      });

      saveStore(store);
      return updatedList;
    },

    recordDecision: async (id, decision, comment) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.candidates.findIndex((c) => c.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Candidate ${id} not found.` };

      const updated = {
        ...store.candidates[idx]!,
        managerDecision: decision,
        managerComment: comment,
        stage: decision === 'Rejected' ? ('Rejected' as const) : store.candidates[idx]!.stage,
      };
      store.candidates[idx] = updated;
      saveStore(store);
      return updated;
    },

    scheduleInterview: async (id, date, mode) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.candidates.findIndex((c) => c.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Candidate ${id} not found.` };

      const updated = {
        ...store.candidates[idx]!,
        interviewDate: date,
        interviewMode: mode,
        stage: 'Interview' as const,
      };
      store.candidates[idx] = updated;
      saveStore(store);
      return updated;
    },

    recordInterviewOutcome: async (id, outcome, note) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.candidates.findIndex((c) => c.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Candidate ${id} not found.` };

      const targetStage =
        outcome === 'Selected'
          ? ('Selected' as const)
          : outcome === 'Rejected'
            ? ('Rejected' as const)
            : store.candidates[idx]!.stage;
      const updated = {
        ...store.candidates[idx]!,
        interviewOutcome: outcome,
        interviewNote: note,
        stage: targetStage,
      };
      store.candidates[idx] = updated;
      saveStore(store);
      return updated;
    },
  },

  onboarding: {
    listAll: async () => {
      await simulateLatency();
      checkFailure();
      return getStore().onboarding;
    },

    listByCandidate: async (candidateId) => {
      await simulateLatency();
      checkFailure();
      return getStore().onboarding.filter((item) => item.candidateId === candidateId);
    },

    toggleTask: async (id, done) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const idx = store.onboarding.findIndex((item) => item.id === id);
      if (idx === -1) throw { code: 'NOT_FOUND', message: `Onboarding item ${id} not found.` };

      const updated = {
        ...store.onboarding[idx]!,
        done,
        status: done ? ('Done' as const) : ('Pending' as const),
      };
      store.onboarding[idx] = updated;
      saveStore(store);
      return updated;
    },

    createTask: async (data) => {
      await simulateLatency();
      checkFailure();
      const store = getStore();
      const newItem: OnboardingItem = {
        ...data,
        id: crypto.randomUUID(),
      };
      store.onboarding.push(newItem);
      saveStore(store);
      return newItem;
    },
  },

  notifications: {
    list: async (role) => {
      await simulateLatency();
      checkFailure();
      return mockNotifications.map((n) => ({ ...n, recipientRole: role }));
    },

    markAsRead: async (id) => {
      await simulateLatency();
      mockNotifications = mockNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const found = mockNotifications.find((n) => n.id === id);
      return (
        found ?? {
          id,
          recipientRole: 'manager',
          title: 'Notification',
          message: 'Marked as read',
          timestamp: new Date().toISOString(),
          read: true,
        }
      );
    },

    markAllAsRead: async () => {
      await simulateLatency();
      mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    },
  },

  auth: {
    getCurrentUser: async () => {
      await simulateLatency(100, 200);
      return activeUser;
    },

    switchRole: async (role) => {
      await simulateLatency(100, 200);
      activeUser = role === 'manager' ? PRIMARY_MANAGER : PRIMARY_HR;
      return activeUser;
    },

    listUsers: async () => {
      await simulateLatency(100, 200);
      return getStore().users;
    },

    resetDemoData: async () => {
      await simulateLatency(100, 200);
      resetStore();
    },
  },

  upload: {
    uploadResume: async (file) => {
      await simulateLatency(500, 1000);
      return {
        fileName: file.name,
        url: `blob://mock-storage/${file.name}`,
      };
    },
  },

  activity: {
    listRecent: async (limit = 20) => {
      await simulateLatency();
      checkFailure();
      return getStore().activities.slice(0, limit);
    },

    listByEntity: async (entityType, entityId) => {
      await simulateLatency();
      checkFailure();
      return getStore().activities.filter(
        (a) => a.entityType === entityType && a.entityId === entityId
      );
    },
  },
};
