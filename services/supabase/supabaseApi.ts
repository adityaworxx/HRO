import type { HroApiClient } from '@/services/api';
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
import { PRIMARY_MANAGER, PRIMARY_HR, INITIAL_USERS } from '@/fixtures/users';
import { supabase } from './client';
import { resetSupabaseDemoData } from '@/lib/demo-data';

let currentActiveUser: User = PRIMARY_MANAGER;

function getActiveUserName(): string {
  if (typeof window !== 'undefined') {
    const savedRole = localStorage.getItem('hro:demo-role');
    if (savedRole === 'hr') return PRIMARY_HR.name;
  }
  return currentActiveUser.name;
}

// Row Interfaces
interface OpeningRow {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  headcount: number;
  experience_min: number;
  experience_max: number;
  budget_min: number;
  budget_max: number;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  description: string;
  urgency: 'Low' | 'Normal' | 'High';
  target_start_date: string;
  status: OpeningStatus;
  manager_id: string;
  created_at: string;
}

interface CandidateRow {
  id: string;
  opening_id: string;
  name: string;
  email: string;
  phone: string;
  current_company: string;
  current_role: string;
  experience_years: number;
  notice_period: string;
  expected_ctc: number;
  source: 'LinkedIn' | 'Naukri' | 'Indeed' | 'Referral' | 'Other';
  profile_url: string | null;
  resume_file_name: string | null;
  hr_notes: string | null;
  stage: CandidateStage;
  manager_decision: 'Pending' | 'Shortlisted' | 'Rejected';
  manager_comment: string | null;
  interview_date: string | null;
  interview_mode: 'Video' | 'Phone' | 'Onsite' | null;
  interview_outcome: 'Pending' | 'Selected' | 'Rejected' | 'On Hold';
  interview_note: string | null;
}

interface OnboardingRow {
  id: string;
  candidate_id: string;
  title: string;
  owner: 'HR' | 'Manager';
  phase: 'Before joining' | 'Day 1' | 'First 30 days';
  due_date: string;
  done: boolean;
  status: 'Pending' | 'Done' | 'Blocked';
  notes: string | null;
}

interface ActivityRow {
  id: string;
  entity_type: 'opening' | 'candidate' | 'onboarding';
  entity_id: string;
  actor: string;
  message: string;
  timestamp: string;
}

interface NotificationRow {
  id: string;
  recipient_role: 'manager' | 'hr';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string | null;
}

// Mappers
function mapOpening(row: OpeningRow): Opening {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    headcount: Number(row.headcount),
    experienceRange: {
      min: Number(row.experience_min),
      max: Number(row.experience_max),
    },
    budgetRange: {
      min: Number(row.budget_min),
      max: Number(row.budget_max),
    },
    mustHaveSkills: row.must_have_skills || [],
    niceToHaveSkills: row.nice_to_have_skills || [],
    description: row.description,
    urgency: row.urgency,
    targetStartDate: row.target_start_date,
    status: row.status,
    managerId: row.manager_id,
    createdAt: row.created_at,
  };
}

function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    openingId: row.opening_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    currentCompany: row.current_company,
    currentRole: row.current_role,
    experienceYears: Number(row.experience_years),
    noticePeriod: row.notice_period,
    expectedCtc: Number(row.expected_ctc),
    source: row.source,
    profileUrl: row.profile_url || undefined,
    resumeFileName: row.resume_file_name || undefined,
    hrNotes: row.hr_notes || undefined,
    stage: row.stage,
    managerDecision: row.manager_decision || 'Pending',
    managerComment: row.manager_comment || undefined,
    interviewDate: row.interview_date || undefined,
    interviewMode: row.interview_mode || undefined,
    interviewOutcome: row.interview_outcome || 'Pending',
    interviewNote: row.interview_note || undefined,
  };
}

function mapOnboarding(row: OnboardingRow): OnboardingItem {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    title: row.title,
    owner: row.owner,
    phase: row.phase,
    dueDate: row.due_date,
    done: Boolean(row.done),
    status: row.status,
    notes: row.notes || undefined,
  };
}

function mapActivity(row: ActivityRow): ActivityEvent {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actor: row.actor,
    message: row.message,
    timestamp: row.timestamp,
  };
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    recipientRole: row.recipient_role,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp,
    read: Boolean(row.read),
    link: row.link || undefined,
  };
}

async function createNotification(
  recipientRole: 'manager' | 'hr',
  title: string,
  message: string,
  link?: string
) {
  try {
    await supabase.from('notifications').insert({
      recipient_role: recipientRole,
      title,
      message,
      link: link || null,
      timestamp: new Date().toISOString(),
      read: false,
    });
  } catch (err) {
    console.warn('Failed to insert notification into Supabase', err);
  }
}

async function recordActivity(
  entityType: 'opening' | 'candidate' | 'onboarding',
  entityId: string,
  message: string
) {
  try {
    await supabase.from('activities').insert({
      entity_type: entityType,
      entity_id: entityId,
      actor: getActiveUserName(),
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to record activity log in Supabase', err);
  }
}

export const supabaseApi: HroApiClient = {
  openings: {
    list: async (filter) => {
      let query = supabase.from('openings').select('*').order('created_at', { ascending: false });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.department) {
        query = query.eq('department', filter.department);
      }
      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,department.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as OpeningRow[]).map(mapOpening);
    },

    getById: async (id) => {
      const { data, error } = await supabase.from('openings').select('*').eq('id', id).single();
      if (error) throw error;
      return mapOpening(data as OpeningRow);
    },

    create: async (openingData) => {
      const row = {
        title: openingData.title,
        department: openingData.department,
        location: openingData.location,
        employment_type: openingData.employmentType,
        headcount: openingData.headcount,
        experience_min: openingData.experienceRange.min,
        experience_max: openingData.experienceRange.max,
        budget_min: openingData.budgetRange.min,
        budget_max: openingData.budgetRange.max,
        must_have_skills: openingData.mustHaveSkills,
        nice_to_have_skills: openingData.niceToHaveSkills,
        description: openingData.description,
        urgency: openingData.urgency,
        target_start_date: openingData.targetStartDate,
        status: openingData.status,
        manager_id: openingData.managerId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('openings').insert(row).select().single();
      if (error) throw error;
      const created = mapOpening(data as OpeningRow);

      await recordActivity('opening', created.id, `Created new opening "${created.title}"`);
      await createNotification(
        'hr',
        'New Opening Created',
        `Hiring Manager created new opening "${created.title}" in ${created.department}.`,
        '/openings'
      );
      return created;
    },

    update: async (id, patch) => {
      const updateData: Record<string, unknown> = {};
      if (patch.title !== undefined) updateData.title = patch.title;
      if (patch.department !== undefined) updateData.department = patch.department;
      if (patch.location !== undefined) updateData.location = patch.location;
      if (patch.employmentType !== undefined) updateData.employment_type = patch.employmentType;
      if (patch.headcount !== undefined) updateData.headcount = patch.headcount;
      if (patch.experienceRange !== undefined) {
        updateData.experience_min = patch.experienceRange.min;
        updateData.experience_max = patch.experienceRange.max;
      }
      if (patch.budgetRange !== undefined) {
        updateData.budget_min = patch.budgetRange.min;
        updateData.budget_max = patch.budgetRange.max;
      }
      if (patch.mustHaveSkills !== undefined) updateData.must_have_skills = patch.mustHaveSkills;
      if (patch.niceToHaveSkills !== undefined)
        updateData.nice_to_have_skills = patch.niceToHaveSkills;
      if (patch.description !== undefined) updateData.description = patch.description;
      if (patch.urgency !== undefined) updateData.urgency = patch.urgency;
      if (patch.targetStartDate !== undefined) updateData.target_start_date = patch.targetStartDate;
      if (patch.status !== undefined) updateData.status = patch.status;

      const { data, error } = await supabase
        .from('openings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = mapOpening(data as OpeningRow);
      await recordActivity('opening', id, `Updated opening "${updated.title}"`);
      return updated;
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('openings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = mapOpening(data as OpeningRow);
      await recordActivity('opening', id, `Status changed to ${status}`);
      return updated;
    },
  },

  candidates: {
    list: async (filter) => {
      let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });

      if (filter?.openingId) {
        query = query.eq('opening_id', filter.openingId);
      }
      if (filter?.stage) {
        query = query.eq('stage', filter.stage);
      }
      if (filter?.source) {
        query = query.eq('source', filter.source);
      }
      if (filter?.search) {
        query = query.or(
          `name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,current_company.ilike.%${filter.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as CandidateRow[]).map(mapCandidate);
    },

    getById: async (id) => {
      const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
      if (error) throw error;
      return mapCandidate(data as CandidateRow);
    },

    create: async (candidateData) => {
      const row = {
        opening_id: candidateData.openingId,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        current_company: candidateData.currentCompany,
        current_role: candidateData.currentRole,
        experience_years: candidateData.experienceYears,
        notice_period: candidateData.noticePeriod,
        expected_ctc: candidateData.expectedCtc,
        source: candidateData.source,
        profile_url: candidateData.profileUrl || null,
        resume_file_name: candidateData.resumeFileName || null,
        hr_notes: candidateData.hrNotes || null,
        stage: candidateData.stage || 'Sourced',
        manager_decision: candidateData.managerDecision || 'Pending',
        manager_comment: candidateData.managerComment || null,
        interview_date: candidateData.interviewDate || null,
        interview_mode: candidateData.interviewMode || null,
        interview_outcome: candidateData.interviewOutcome || 'Pending',
        interview_note: candidateData.interviewNote || null,
      };

      const { data, error } = await supabase.from('candidates').insert(row).select().single();
      if (error) throw error;
      const created = mapCandidate(data as CandidateRow);

      await recordActivity('candidate', created.id, `Candidate "${created.name}" added to pipeline`);
      return created;
    },

    updateStage: async (id, stage) => {
      const { data, error } = await supabase
        .from('candidates')
        .update({ stage })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = mapCandidate(data as CandidateRow);
      await recordActivity('candidate', id, `Moved to stage "${stage}"`);
      if (stage === 'Shared with Manager') {
        await createNotification(
          'manager',
          'Candidate Shared for Review',
          `HR shared candidate "${updated.name}" for technical review.`,
          '/shortlist'
        );
      }
      return updated;
    },

    shareWithManager: async (candidateIds, note) => {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          stage: 'Shared with Manager',
          manager_decision: 'Pending',
          hr_notes: note ? note : undefined,
        })
        .in('id', candidateIds)
        .select();

      if (error) throw error;
      const updated = (data as CandidateRow[]).map(mapCandidate);

      for (const c of updated) {
        await recordActivity('candidate', c.id, 'Shared with hiring manager for review');
      }

      if (updated.length > 0) {
        const names = updated.map((c) => c.name).join(', ');
        await createNotification(
          'manager',
          updated.length === 1 ? 'Candidate Shared for Review' : `${updated.length} Candidates Shared for Review`,
          `HR shared ${names} for technical evaluation.`,
          '/shortlist'
        );
      }

      return updated;
    },

    recordDecision: async (id, decision, comment) => {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          manager_decision: decision,
          manager_comment: comment || null,
          stage: decision === 'Shortlisted' ? 'Interview' : 'Rejected',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = mapCandidate(data as CandidateRow);
      await recordActivity('candidate', id, `Manager marked decision as "${decision}"`);
      return updated;
    },

    scheduleInterview: async (id, date, mode) => {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          interview_date: date,
          interview_mode: mode,
          stage: 'Interview',
          interview_outcome: 'Pending',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = mapCandidate(data as CandidateRow);
      await recordActivity('candidate', id, `Interview scheduled for ${new Date(date).toLocaleDateString()} (${mode})`);
      return updated;
    },

    recordInterviewOutcome: async (id, outcome, note) => {
      let nextStage: CandidateStage = 'Interview';
      if (outcome === 'Selected') nextStage = 'Selected';
      else if (outcome === 'Rejected') nextStage = 'Rejected';

      const { data, error } = await supabase
        .from('candidates')
        .update({
          interview_outcome: outcome,
          interview_note: note || null,
          stage: nextStage,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = mapCandidate(data as CandidateRow);
      await recordActivity('candidate', id, `Interview outcome recorded as "${outcome}"`);
      return updated;
    },
  },

  onboarding: {
    listAll: async () => {
      const { data, error } = await supabase
        .from('onboarding_items')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data as OnboardingRow[]).map(mapOnboarding);
    },

    listByCandidate: async (candidateId) => {
      const { data, error } = await supabase
        .from('onboarding_items')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data as OnboardingRow[]).map(mapOnboarding);
    },

    toggleTask: async (id, done) => {
      const status = done ? 'Done' : 'Pending';
      const { data, error } = await supabase
        .from('onboarding_items')
        .update({ done, status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = mapOnboarding(data as OnboardingRow);
      await recordActivity(
        'onboarding',
        updated.candidateId,
        `Task "${updated.title}" marked as ${status}`
      );
      return updated;
    },

    createTask: async (taskData) => {
      const row = {
        candidate_id: taskData.candidateId,
        title: taskData.title,
        owner: taskData.owner,
        phase: taskData.phase,
        due_date: taskData.dueDate,
        done: taskData.done ?? false,
        status: taskData.status || 'Pending',
        notes: taskData.notes || null,
      };

      const { data, error } = await supabase.from('onboarding_items').insert(row).select().single();
      if (error) throw error;
      const created = mapOnboarding(data as OnboardingRow);
      await recordActivity('onboarding', created.candidateId, `Created onboarding task "${created.title}"`);
      return created;
    },
  },

  notifications: {
    list: async (role) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', role)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data as NotificationRow[]).map(mapNotification);
    },

    markAsRead: async (id) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapNotification(data as NotificationRow);
    },

    markAllAsRead: async (role) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_role', role);
      if (error) throw error;
    },
  },

  auth: {
    getCurrentUser: async () => {
      if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem('hro:demo-role') as UserRole | null;
        if (savedRole === 'hr') return PRIMARY_HR;
        if (savedRole === 'manager') return PRIMARY_MANAGER;
      }
      return currentActiveUser;
    },

    switchRole: async (role) => {
      currentActiveUser = role === 'hr' ? PRIMARY_HR : PRIMARY_MANAGER;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hro:demo-role', role);
      }
      return currentActiveUser;
    },

    listUsers: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error || !data || data.length === 0) {
        return INITIAL_USERS;
      }
      return data.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        department: u.department,
        avatarInitials: u.avatar_initials,
      }));
    },

    resetDemoData: async () => {
      await resetSupabaseDemoData();
    },
  },

  upload: {
    uploadResume: async (file) => {
      // Return resume meta path
      return {
        fileName: file.name,
        url: `https://example.com/resumes/${encodeURIComponent(file.name)}`,
      };
    },
  },

  activity: {
    listRecent: async (limit = 20) => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as ActivityRow[]).map(mapActivity);
    },

    listByEntity: async (entityType, entityId) => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data as ActivityRow[]).map(mapActivity);
    },
  },
};

