import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitPullRequest,
  Calendar,
  UserCheck,
  BarChart3,
  Settings,
  ListFilter,
  type LucideIcon,
} from 'lucide-react';

export type UserRole = 'manager' | 'hr';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAVIGATION_ITEMS: Record<UserRole, NavItem[]> = {
  manager: [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'My Openings', href: '/openings', icon: Briefcase },
    { title: 'Shortlist Review', href: '/shortlist', icon: ListFilter },
    { title: 'Interviews', href: '/interviews', icon: Calendar },
    { title: 'Settings', href: '/settings', icon: Settings },
  ],
  hr: [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'All Openings', href: '/openings', icon: Briefcase },
    { title: 'Candidates', href: '/candidates', icon: Users },
    { title: 'Pipeline', href: '/pipeline', icon: GitPullRequest },
    { title: 'Onboarding', href: '/onboarding', icon: UserCheck },
    { title: 'Reports', href: '/reports', icon: BarChart3 },
    { title: 'Settings', href: '/settings', icon: Settings },
  ],
};

// Route permission rules mapping from PRD Part A4
export const ROUTE_RULES: Array<{
  pattern: RegExp;
  allowedRoles: UserRole[];
}> = [
  { pattern: /^\/$/, allowedRoles: ['manager', 'hr'] },
  { pattern: /^\/openings\/new$/, allowedRoles: ['manager'] },
  { pattern: /^\/openings\/[^/]+\/edit$/, allowedRoles: ['manager'] },
  { pattern: /^\/openings(?:\/[^/]+)?$/, allowedRoles: ['manager', 'hr'] },
  { pattern: /^\/shortlist$/, allowedRoles: ['manager'] },
  { pattern: /^\/interviews$/, allowedRoles: ['manager'] },
  { pattern: /^\/candidates$/, allowedRoles: ['hr'] },
  { pattern: /^\/pipeline$/, allowedRoles: ['hr'] },
  { pattern: /^\/onboarding$/, allowedRoles: ['hr'] },
  { pattern: /^\/reports$/, allowedRoles: ['hr'] },
  { pattern: /^\/settings$/, allowedRoles: ['manager', 'hr'] },
];

export function isRouteAllowed(pathname: string, role: UserRole): boolean {
  // Allow design-system and auth login universally in dev/demo
  if (pathname.startsWith('/design-system') || pathname.startsWith('/login')) {
    return true;
  }

  const matchingRule = ROUTE_RULES.find((rule) => rule.pattern.test(pathname));
  if (!matchingRule) {
    return true; // 404 handler manages unrecognized routes
  }

  return matchingRule.allowedRoles.includes(role);
}
