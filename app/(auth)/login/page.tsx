'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { useUsers } from '@/features/auth/hooks';
import { Briefcase, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useUiStore();
  const { data: users = [] } = useUsers();

  const managerUser = users.find((u) => u.role === 'manager');
  const hrUser = users.find((u) => u.role === 'hr');

  const handleChooseRole = (role: 'manager' | 'hr') => {
    setRole(role);
    router.push('/');
  };

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center p-4">
      <div className="border-border bg-surface-1 w-full max-w-md space-y-6 rounded-[var(--radius-lg)] border p-8 text-center shadow-lg">
        <div className="flex justify-center">
          <div className="bg-accent flex h-12 w-12 items-center justify-center rounded-full text-[20px] font-bold text-white">
            H
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-text text-[20px] font-semibold">Welcome to HRO</h1>
          <p className="text-text-muted text-[13px]">
            Choose your persona to review the role-tailored hiring and onboarding experience.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleChooseRole('manager')}
            className="border-border bg-surface-2 hover:border-accent hover:bg-surface-3 flex w-full cursor-pointer items-center justify-between rounded-[var(--radius-md)] border p-4 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-surface-1 text-accent flex h-9 w-9 items-center justify-center rounded-full">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-text text-[14px] font-semibold">
                  {managerUser?.name ?? 'Arjun Kapoor'}
                </p>
                <p className="text-text-subtle text-[12px]">
                  Hiring Manager ({managerUser?.department ?? 'Engineering'})
                </p>
              </div>
            </div>
            <span className="text-accent text-[12px] font-medium">Select &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => handleChooseRole('hr')}
            className="border-border bg-surface-2 hover:border-accent hover:bg-surface-3 flex w-full cursor-pointer items-center justify-between rounded-[var(--radius-md)] border p-4 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-surface-1 text-accent flex h-9 w-9 items-center justify-center rounded-full">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-text text-[14px] font-semibold">
                  {hrUser?.name ?? 'Priya Sharma'}
                </p>
                <p className="text-text-subtle text-[12px]">
                  HR Specialist ({hrUser?.department ?? 'People Operations'})
                </p>
              </div>
            </div>
            <span className="text-accent text-[12px] font-medium">Select &rarr;</span>
          </button>
        </div>

        <p className="text-text-subtle text-[11px]">
          Client-side demo authentication. Role switching is also accessible anytime from the
          sidebar footer.
        </p>
      </div>
    </div>
  );
}
