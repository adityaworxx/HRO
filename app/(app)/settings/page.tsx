'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCurrentUser, useResetDemoData, useSwitchRole } from '@/features/auth/hooks';
import { useUiStore } from '@/lib/store';
import { PRIMARY_HR, PRIMARY_MANAGER } from '@/fixtures/users';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/navigation';

interface HrPreferences {
  reviewSlaHours: number;
  noticePeriodDays: number;
  slaBreachAlerts: boolean;
  applicantNotifications: boolean;
  requireScorecard: boolean;
  autoArchiveRejected: boolean;
}

const DEFAULT_HR_PREFS: HrPreferences = {
  reviewSlaHours: 72,
  noticePeriodDays: 60,
  slaBreachAlerts: true,
  applicantNotifications: true,
  requireScorecard: true,
  autoArchiveRejected: false,
};

interface ManagerPreferences {
  scorecardSlaHours: number;
  interviewReminders: boolean;
  weeklyDigest: boolean;
  stageProgressionAlerts: boolean;
}

const DEFAULT_MGR_PREFS: ManagerPreferences = {
  scorecardSlaHours: 24,
  interviewReminders: true,
  weeklyDigest: true,
  stageProgressionAlerts: true,
};

interface SegmentedControlProps<T extends string | number> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface-2/60 p-0.5 shadow-2xs',
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-[var(--radius-xs)] px-2.5 py-1 text-[12px] font-medium transition-all select-none cursor-pointer',
              isSelected
                ? 'bg-accent text-white shadow-xs font-semibold border border-accent'
                : 'text-text-muted hover:text-text hover:bg-surface-3 active:bg-accent/15 border border-transparent'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { data: activeUser } = useCurrentUser();
  const { role, setRole } = useUiStore();
  const switchRole = useSwitchRole();
  const { theme, setTheme } = useTheme();
  const resetMutation = useResetDemoData();

  const [mounted, setMounted] = React.useState(false);
  const [hrPrefs, setHrPrefs] = React.useState<HrPreferences>(DEFAULT_HR_PREFS);
  const [mgrPrefs, setMgrPrefs] = React.useState<ManagerPreferences>(DEFAULT_MGR_PREFS);

  // Avoid hydration mismatch on theme selection & initialize preferences from storage
  React.useEffect(() => {
    setMounted(true);

    try {
      const storedHr = localStorage.getItem('hro:hr-settings');
      if (storedHr) {
        setHrPrefs((prev) => ({ ...prev, ...JSON.parse(storedHr) }));
      }
      const storedMgr = localStorage.getItem('hro:manager-settings');
      if (storedMgr) {
        setMgrPrefs((prev) => ({ ...prev, ...JSON.parse(storedMgr) }));
      }
    } catch {
      // Ignore parsing errors and keep defaults
    }
  }, []);

  const activeRole: UserRole = mounted ? role : 'manager';
  const isHr = activeRole === 'hr';
  const currentPersona = isHr ? PRIMARY_HR : (activeUser ?? PRIMARY_MANAGER);

  const handleRoleToggle = () => {
    const nextRole: UserRole = isHr ? 'manager' : 'hr';
    setRole(nextRole);
    switchRole.mutate(nextRole);
    toast.success(
      `Switched persona to ${nextRole === 'hr' ? 'HR Specialist (Priya Sharma)' : 'Hiring Manager (Arjun Kapoor)'}`
    );
  };

  const updateHrPref = <K extends keyof HrPreferences>(key: K, value: HrPreferences[K]) => {
    setHrPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('hro:hr-settings', JSON.stringify(next));
      }
      return next;
    });
    toast.success('Preference updated.');
  };

  const updateMgrPref = <K extends keyof ManagerPreferences>(key: K, value: ManagerPreferences[K]) => {
    setMgrPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('hro:manager-settings', JSON.stringify(next));
      }
      return next;
    });
    toast.success('Preference updated.');
  };

  const handleResetData = async () => {
    try {
      await resetMutation.mutateAsync();
      toast.success('Demo data reset to initial seed state.');
      window.location.reload();
    } catch {
      toast.error('Failed to reset demo data.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] w-full items-start lg:items-center justify-center py-2 sm:py-4 lg:py-0">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-stretch">
        {/* Left Card: Role-Specific Operational Policies */}
        <section className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-border flex items-center justify-between border-b pb-3 mb-4 gap-2">
              <h2 className="text-text text-[14px] font-semibold">
                {isHr ? 'HR Operations & SLA Policies' : 'Hiring Manager Preferences'}
              </h2>
              <span className="text-text text-[11px] font-mono font-bold uppercase tracking-wider shrink-0">
                {isHr ? 'Recruitment Policies' : 'Interview Policies'}
              </span>
            </div>

            {isHr ? (
              <div className="divide-y divide-border/50">
                {/* Review SLA Threshold */}
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-text text-[13px] font-medium">Review SLA Limit</span>
                  <SegmentedControl
                    options={[
                      { label: '24h', value: 24 },
                      { label: '48h', value: 48 },
                      { label: '72h', value: 72 },
                      { label: '5d', value: 120 },
                    ]}
                    value={hrPrefs.reviewSlaHours}
                    onChange={(val) => updateHrPref('reviewSlaHours', val)}
                  />
                </div>

                {/* Notice Period Tolerance */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">Notice Period Tolerance</span>
                  <SegmentedControl
                    options={[
                      { label: '30d', value: 30 },
                      { label: '60d', value: 60 },
                      { label: '90d', value: 90 },
                    ]}
                    value={hrPrefs.noticePeriodDays}
                    onChange={(val) => updateHrPref('noticePeriodDays', val)}
                  />
                </div>

                {/* SLA Breach Alerts */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">Automated SLA Breach Alerts</span>
                  <Switch
                    checked={hrPrefs.slaBreachAlerts}
                    onCheckedChange={(checked) => updateHrPref('slaBreachAlerts', checked)}
                  />
                </div>

                {/* Candidate Notifications */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">New Candidate Notifications</span>
                  <Switch
                    checked={hrPrefs.applicantNotifications}
                    onCheckedChange={(checked) => updateHrPref('applicantNotifications', checked)}
                  />
                </div>

                {/* Mandatory Scorecard */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">Require Scorecard Before Offer</span>
                  <Switch
                    checked={hrPrefs.requireScorecard}
                    onCheckedChange={(checked) => updateHrPref('requireScorecard', checked)}
                  />
                </div>

                {/* Auto-archive */}
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <span className="text-text text-[13px] font-medium">Auto-Archive Rejected Profiles</span>
                  <Switch
                    checked={hrPrefs.autoArchiveRejected}
                    onCheckedChange={(checked) => updateHrPref('autoArchiveRejected', checked)}
                  />
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {/* Scorecard SLA */}
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-text text-[13px] font-medium">Scorecard Turnaround SLA</span>
                  <SegmentedControl
                    options={[
                      { label: '24h', value: 24 },
                      { label: '48h', value: 48 },
                      { label: '72h', value: 72 },
                    ]}
                    value={mgrPrefs.scorecardSlaHours}
                    onChange={(val) => updateMgrPref('scorecardSlaHours', val)}
                  />
                </div>

                {/* Reminders */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">Interview Reminders</span>
                  <Switch
                    checked={mgrPrefs.interviewReminders}
                    onCheckedChange={(checked) => updateMgrPref('interviewReminders', checked)}
                  />
                </div>

                {/* Weekly Digest */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-text text-[13px] font-medium">Weekly Requisition Digest</span>
                  <Switch
                    checked={mgrPrefs.weeklyDigest}
                    onCheckedChange={(checked) => updateMgrPref('weeklyDigest', checked)}
                  />
                </div>

                {/* Stage Progression Alerts */}
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <span className="text-text text-[13px] font-medium">Stage Movement Alerts</span>
                  <Switch
                    checked={mgrPrefs.stageProgressionAlerts}
                    onCheckedChange={(checked) => updateMgrPref('stageProgressionAlerts', checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Card: Profile & System Preferences */}
        <section className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-border flex items-center justify-between border-b pb-3 mb-4 gap-2">
              <h2 className="text-text text-[14px] font-semibold">Profile & Workspace Preferences</h2>
              <span className="text-text text-[11px] font-mono font-bold uppercase tracking-wider shrink-0">
                Active Account
              </span>
            </div>

            {/* Persona Details Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/50">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-border/80 shadow-2xs shrink-0">
                  <AvatarFallback className="bg-surface-3 text-text text-[13px] font-bold" suppressHydrationWarning>
                    {currentPersona.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-text text-[14px] font-medium truncate leading-none">
                      {currentPersona.name}
                    </span>
                    <Badge variant="default" className="text-[10px] font-mono uppercase tracking-wider shrink-0">
                      {isHr ? 'HR Lead' : 'Manager'}
                    </Badge>
                  </div>
                  <p className="text-text-muted text-[12px] truncate">
                    {currentPersona.name.toLowerCase().replace(/\s+/g, '.')}@company.com
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRoleToggle}
                className="h-7 text-[11px] bg-surface-2 hover:bg-surface-3 hover:text-accent hover:border-accent/40 active:bg-accent active:text-white border border-border px-2.5 shrink-0 w-full sm:w-auto transition-colors"
              >
                <span>Switch to {isHr ? 'Manager' : 'HR'}</span>
              </Button>
            </div>

            {/* Account Attributes */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-border/50 text-[12px]">
              <div>
                <span className="text-text text-[11px] uppercase tracking-wider font-mono font-bold">Department</span>
                <p className="text-text mt-0.5 font-medium">{currentPersona.department}</p>
              </div>
              <div>
                <span className="text-text text-[11px] uppercase tracking-wider font-mono font-bold">Assigned Role</span>
                <p className="text-text mt-0.5 font-mono font-medium uppercase">{currentPersona.role}</p>
              </div>
              <div className="col-span-2 pt-1 border-t border-border/40">
                <span className="text-text text-[11px] uppercase tracking-wider font-mono font-bold">Access Scope</span>
                <p className="text-text mt-0.5 font-medium text-[12px]">
                  {isHr ? 'Full Talent Pipeline & Onboarding Operations' : 'Requisitions & Interview Scorecards'}
                </p>
              </div>
            </div>

            {/* Interface Theme */}
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-text text-[13px] font-medium">Interface Theme</span>
              <SegmentedControl
                options={[
                  { label: 'Dark', value: 'dark' },
                  { label: 'Light', value: 'light' },
                  { label: 'System', value: 'system' },
                ]}
                value={mounted ? (theme ?? 'dark') : 'dark'}
                onChange={(t) => setTheme(t)}
              />
            </div>

            {/* Demo Data Management */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-text text-[13px] font-medium">Demo Data Store</span>
                <p className="text-text-muted text-[11px] mt-0.5">Reset candidate records to initial seed</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetData}
                loading={resetMutation.isPending}
                className="h-7 text-[12px] px-3"
              >
                <span>Reset Data</span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
);
}
