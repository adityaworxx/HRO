import type {
  Opening,
  Candidate,
  OnboardingItem,
  Notification,
  User,
  ActivityEvent,
} from '@/types/entities';
import type { OpeningStatus, CandidateStage } from '@/lib/domain/status-transitions';
import type { UserRole } from '@/lib/navigation';

export interface OpeningsApi {
  list(filter?: {
    status?: OpeningStatus;
    department?: string;
    search?: string;
  }): Promise<Opening[]>;
  getById(id: string): Promise<Opening>;
  create(data: Omit<Opening, 'id' | 'createdAt'>): Promise<Opening>;
  update(id: string, data: Partial<Opening>): Promise<Opening>;
  updateStatus(id: string, status: OpeningStatus): Promise<Opening>;
}

export interface CandidatesApi {
  list(filter?: {
    openingId?: string;
    stage?: CandidateStage;
    source?: string;
    search?: string;
  }): Promise<Candidate[]>;
  getById(id: string): Promise<Candidate>;
  create(data: Omit<Candidate, 'id'>): Promise<Candidate>;
  updateStage(id: string, stage: CandidateStage): Promise<Candidate>;
  shareWithManager(candidateIds: string[], note?: string): Promise<Candidate[]>;
  recordDecision(
    id: string,
    decision: 'Shortlisted' | 'Rejected',
    comment?: string
  ): Promise<Candidate>;
  scheduleInterview(
    id: string,
    date: string,
    mode: 'Video' | 'Phone' | 'Onsite',
    note?: string
  ): Promise<Candidate>;
  recordInterviewOutcome(
    id: string,
    outcome: 'Selected' | 'Rejected' | 'On Hold',
    note?: string
  ): Promise<Candidate>;
  assignToOpening(
    id: string,
    openingId: string,
    stage?: CandidateStage,
    notes?: string
  ): Promise<Candidate>;
}

export interface OnboardingApi {
  listAll(): Promise<OnboardingItem[]>;
  listByCandidate(candidateId: string): Promise<OnboardingItem[]>;
  toggleTask(id: string, done: boolean): Promise<OnboardingItem>;
  createTask(data: Omit<OnboardingItem, 'id'>): Promise<OnboardingItem>;
}

export interface NotificationsApi {
  list(role: UserRole): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(role: UserRole): Promise<void>;
}

export interface AuthApi {
  getCurrentUser(): Promise<User>;
  switchRole(role: UserRole): Promise<User>;
  listUsers(): Promise<User[]>;
  resetDemoData(): Promise<void>;
}

export interface UploadApi {
  uploadResume(file: { name: string; size: number }): Promise<{ fileName: string; url: string }>;
}

export interface ActivityApi {
  listRecent(limit?: number): Promise<ActivityEvent[]>;
  listByEntity(entityType: string, entityId: string): Promise<ActivityEvent[]>;
}

export interface HroApiClient {
  openings: OpeningsApi;
  candidates: CandidatesApi;
  onboarding: OnboardingApi;
  notifications: NotificationsApi;
  auth: AuthApi;
  upload: UploadApi;
  activity: ActivityApi;
}
