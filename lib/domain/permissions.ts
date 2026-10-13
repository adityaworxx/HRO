import type { UserRole } from '@/lib/navigation';

export interface UserLike {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

export interface OpeningResourceLike {
  id: string;
  managerId: string;
}

export type PermissionAction =
  | 'create_opening'
  | 'edit_opening'
  | 'view_opening'
  | 'update_opening_status'
  | 'add_candidate'
  | 'share_candidate'
  | 'shortlist_candidate'
  | 'reject_candidate'
  | 'schedule_interview'
  | 'record_interview_outcome'
  | 'manage_onboarding'
  | 'view_reports'
  | 'view_compensation';

export function can(
  user: UserLike | null | undefined,
  action: PermissionAction,
  resource?: OpeningResourceLike | null
): boolean {
  if (!user) return false;

  const isManager = user.role === 'manager';
  const isHr = user.role === 'hr';

  switch (action) {
    case 'create_opening':
      return isManager;

    case 'edit_opening':
      if (isHr) return false;
      return resource ? resource.managerId === user.id : isManager;

    case 'view_opening':
      if (isHr) return true;
      return resource ? resource.managerId === user.id : isManager;

    case 'update_opening_status':
      return isHr;

    case 'add_candidate':
    case 'share_candidate':
    case 'manage_onboarding':
    case 'view_reports':
      return isHr;

    case 'shortlist_candidate':
    case 'reject_candidate':
    case 'schedule_interview':
    case 'record_interview_outcome':
      return isManager;

    case 'view_compensation':
      if (isHr) return true;
      return resource ? resource.managerId === user.id : isManager;

    default:
      return false;
  }
}
