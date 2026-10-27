import type { HroApiClient } from '@/services/api';

export class NotImplementedError extends Error {
  constructor(methodName: string) {
    super(`HttpApi.${methodName} is not implemented. A real backend is not connected yet.`);
    this.name = 'NotImplementedError';
  }
}

export const httpApi: HroApiClient = {
  openings: {
    list: async () => {
      throw new NotImplementedError('openings.list');
    },
    getById: async () => {
      throw new NotImplementedError('openings.getById');
    },
    create: async () => {
      throw new NotImplementedError('openings.create');
    },
    update: async () => {
      throw new NotImplementedError('openings.update');
    },
    updateStatus: async () => {
      throw new NotImplementedError('openings.updateStatus');
    },
  },
  candidates: {
    list: async () => {
      throw new NotImplementedError('candidates.list');
    },
    getById: async () => {
      throw new NotImplementedError('candidates.getById');
    },
    create: async () => {
      throw new NotImplementedError('candidates.create');
    },
    updateStage: async () => {
      throw new NotImplementedError('candidates.updateStage');
    },
    shareWithManager: async () => {
      throw new NotImplementedError('candidates.shareWithManager');
    },
    recordDecision: async () => {
      throw new NotImplementedError('candidates.recordDecision');
    },
    scheduleInterview: async () => {
      throw new NotImplementedError('candidates.scheduleInterview');
    },
    recordInterviewOutcome: async () => {
      throw new NotImplementedError('candidates.recordInterviewOutcome');
    },
    assignToOpening: async () => {
      throw new NotImplementedError('candidates.assignToOpening');
    },
  },
  onboarding: {
    listAll: async () => {
      throw new NotImplementedError('onboarding.listAll');
    },
    listByCandidate: async () => {
      throw new NotImplementedError('onboarding.listByCandidate');
    },
    toggleTask: async () => {
      throw new NotImplementedError('onboarding.toggleTask');
    },
    createTask: async () => {
      throw new NotImplementedError('onboarding.createTask');
    },
  },
  notifications: {
    list: async () => {
      throw new NotImplementedError('notifications.list');
    },
    markAsRead: async () => {
      throw new NotImplementedError('notifications.markAsRead');
    },
    markAllAsRead: async () => {
      throw new NotImplementedError('notifications.markAllAsRead');
    },
  },
  auth: {
    getCurrentUser: async () => {
      throw new NotImplementedError('auth.getCurrentUser');
    },
    switchRole: async () => {
      throw new NotImplementedError('auth.switchRole');
    },
    listUsers: async () => {
      throw new NotImplementedError('auth.listUsers');
    },
    resetDemoData: async () => {
      throw new NotImplementedError('auth.resetDemoData');
    },
  },
  upload: {
    uploadResume: async () => {
      throw new NotImplementedError('upload.uploadResume');
    },
  },
  activity: {
    listRecent: async () => {
      throw new NotImplementedError('activity.listRecent');
    },
    listByEntity: async () => {
      throw new NotImplementedError('activity.listByEntity');
    },
  },
};
