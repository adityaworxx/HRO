'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useResetDemoData } from '@/features/auth/hooks';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { RotateCcw, Palette, User, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { data: activeUser } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const resetMutation = useResetDemoData();

  const handleResetData = async () => {
    try {
      await resetMutation.mutateAsync();
      toast.success('Demo data successfully reset to initial seed state.');
      window.location.reload();
    } catch {
      toast.error('Failed to reset demo data.');
    }
  };

  return (
    <div className="max-w-[720px] space-y-6">

      {/* User Persona Profile */}
      <section className="border-border bg-surface-1 space-y-4 rounded-[var(--radius-md)] border p-5">
        <div className="border-border flex items-center gap-2 border-b pb-3">
          <User className="text-accent h-4 w-4" />
          <h2 className="text-text text-[15px] font-semibold">Active Profile Persona</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <span className="text-text-subtle">Name</span>
            <p className="text-text mt-0.5 font-medium">{activeUser?.name ?? 'Arjun Kapoor'}</p>
          </div>
          <div>
            <span className="text-text-subtle">Department</span>
            <p className="text-text mt-0.5 font-medium">
              {activeUser?.department ?? 'Engineering'}
            </p>
          </div>
          <div>
            <span className="text-text-subtle">Assigned Role</span>
            <p className="text-accent mt-0.5 font-mono font-medium uppercase">
              {activeUser?.role ?? 'manager'}
            </p>
          </div>
        </div>
      </section>

      {/* Theme Preferences */}
      <section className="border-border bg-surface-1 space-y-4 rounded-[var(--radius-md)] border p-5">
        <div className="border-border flex items-center gap-2 border-b pb-3">
          <Palette className="text-accent h-4 w-4" />
          <h2 className="text-text text-[15px] font-semibold">Appearance & Theme</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTheme(t)}
              className="capitalize"
            >
              {t} Theme
            </Button>
          ))}
        </div>
      </section>

      {/* Data Management & Reset */}
      <section className="border-danger/30 bg-surface-1 space-y-4 rounded-[var(--radius-md)] border p-5">
        <div className="border-border flex items-center gap-2 border-b pb-3">
          <Shield className="text-danger h-4 w-4" />
          <h2 className="text-text text-[15px] font-semibold">Demo Data Management</h2>
        </div>
        <p className="text-text-muted text-[13px]">
          All modifications, newly added candidates, and stage movements are saved to your
          browser&apos;s localStorage under <code className="text-accent font-mono">hro:v1</code>.
          You can reset everything back to the clean initial seed at any time.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleResetData}
          loading={resetMutation.isPending}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Demo Data</span>
        </Button>
      </section>
    </div>
  );
}
