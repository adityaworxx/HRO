'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { useUsers } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Users,
  Lock,
  Mail,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AuthViewProps {
  initialMode?: 'login' | 'register';
}

export function AuthView({ initialMode = 'login' }: AuthViewProps) {
  const router = useRouter();
  const { setRole } = useUiStore();
  const { data: users = [] } = useUsers();

  const [mode, setMode] = React.useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [department, setDepartment] = React.useState('Engineering');
  const [selectedRole, setSelectedRole] = React.useState<'manager' | 'hr'>('manager');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [agreeTerms, setAgreeTerms] = React.useState(true);

  const managerUser = users.find((u) => u.role === 'manager');
  const hrUser = users.find((u) => u.role === 'hr');

  // Quick 1-click persona switch
  const handleQuickLogin = (role: 'manager' | 'hr', personaName: string) => {
    setRole(role);
    toast.success(
      `Logged in as ${personaName} (${role === 'manager' ? 'Hiring Manager' : 'HR Specialist'})`
    );
    router.push('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setRole(selectedRole);

      if (mode === 'login') {
        const displayName = email.split('@')[0] || 'User';
        toast.success(`Welcome back, ${displayName}!`);
      } else {
        toast.success(`Account created! Welcome to HRO, ${fullName || 'Team Member'}!`);
      }

      router.push('/');
    }, 500);
  };

  return (
    <div className="bg-bg text-text flex min-h-screen flex-col overflow-x-hidden lg:grid lg:grid-cols-12">
      {/* LEFT COLUMN: Visual Brand Showcase (lg:col-span-5) */}
      <div className="border-border bg-surface-2/30 relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:col-span-5 lg:flex">
        {/* Subtle decorative radial glow and grid texture */}
        <div className="bg-accent-subtle pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-60 blur-3xl" />
        <div className="bg-accent-subtle pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full opacity-40 blur-3xl" />

        {/* Top Header Logo & Platform Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent flex h-9 w-9 items-center justify-center rounded-[8px] font-bold text-white shadow-xs select-none">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-text text-[17px] font-bold tracking-tight">HRO</span>
                <span className="bg-accent-subtle text-accent rounded-[4px] px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wider uppercase">
                  Enterprise
                </span>
              </div>
              <p className="text-text-subtle text-[11.5px] font-medium">
                Recruitment Operations Platform
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section: Value Props + Real-Time Pipeline Metric Showcase */}
        <div className="relative z-10 my-auto space-y-6 py-6">
          {/* Main Title & Vision */}
          <div className="space-y-2">
            <h2 className="text-text text-[26px] leading-[1.25] font-bold tracking-tight">
              The modern operating system for high-growth hiring.
            </h2>
            <p className="text-text-muted text-[13.5px] leading-relaxed">
              Orchestrate talent sourcing, streamline manager review queues, and coordinate
              technical interviews in one unified workspace.
            </p>
          </div>

          {/* Interactive Live Pipeline Health & Metric Widget (No personal names) */}
          <div className="border-border/80 bg-surface-1 space-y-3.5 rounded-[10px] border p-4 shadow-sm select-none">
            {/* Widget Status Header */}
            <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-text text-[12px] font-semibold tracking-tight">
                  Active Pipeline Velocity
                </span>
              </div>
              <span className="text-accent font-mono text-[11px] font-semibold tracking-wider uppercase">
                Live Overview
              </span>
            </div>

            {/* Stage Progress Columns */}
            <div className="grid grid-cols-4 gap-2">
              <div className="border-border/70 bg-surface-2/40 rounded-[6px] border p-2 text-center">
                <p className="text-text font-mono text-[15px] font-bold tabular-nums">14</p>
                <p className="text-text-subtle mt-0.5 truncate text-[10.5px] font-medium">
                  Sourced
                </p>
              </div>

              <div className="border-accent/40 bg-accent-subtle/25 rounded-[6px] border p-2 text-center">
                <p className="text-accent font-mono text-[15px] font-bold tabular-nums">3</p>
                <p className="text-accent mt-0.5 truncate text-[10.5px] font-semibold">Review</p>
              </div>

              <div className="border-border/70 bg-surface-2/40 rounded-[6px] border p-2 text-center">
                <p className="text-text font-mono text-[15px] font-bold tabular-nums">5</p>
                <p className="text-text-subtle mt-0.5 truncate text-[10.5px] font-medium">
                  Interview
                </p>
              </div>

              <div className="border-border/70 bg-surface-2/40 rounded-[6px] border p-2 text-center">
                <p className="text-text font-mono text-[15px] font-bold tabular-nums">2</p>
                <p className="text-text-subtle mt-0.5 truncate text-[10.5px] font-medium">
                  Offered
                </p>
              </div>
            </div>

            {/* Quick Efficiency KPI Metrics */}
            <div className="border-border/60 grid grid-cols-2 gap-3 border-t pt-2.5 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-text-subtle font-medium">Avg. Time-to-Hire</span>
                <span className="text-text font-mono font-bold">18 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-subtle font-medium">Offer Acceptance</span>
                <span className="text-text font-mono font-bold">94.2%</span>
              </div>
            </div>
          </div>

          {/* Platform Capabilities List */}
          <div className="space-y-2.5 pt-1">
            <div className="text-text flex items-center gap-2.5 text-[12.5px]">
              <div className="bg-accent-subtle text-accent flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <GitPullRequest className="h-3 w-3 stroke-[2.2]" />
              </div>
              <span className="font-medium">7-Stage Real-time Drag & Drop Kanban</span>
            </div>

            <div className="text-text flex items-center gap-2.5 text-[12.5px]">
              <div className="bg-accent-subtle text-accent flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="h-3 w-3 stroke-[2.2]" />
              </div>
              <span className="font-medium">Instant Manager Shortlist Approvals</span>
            </div>

            <div className="text-text flex items-center gap-2.5 text-[12.5px]">
              <div className="bg-accent-subtle text-accent flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <ShieldCheck className="h-3 w-3 stroke-[2.2]" />
              </div>
              <span className="font-medium">Role-Based Access Control (RBAC) & Audit Logs</span>
            </div>
          </div>
        </div>

        {/* Footer Security Compliance */}
        <div className="text-text-subtle relative z-10 flex items-center gap-2 text-[11.5px]">
          <ShieldCheck className="text-accent h-4 w-4 shrink-0" />
          <span>SOC2 Type II Certified · Role-Based Security · 99.99% Uptime</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form (lg:col-span-7) */}
      <div className="flex min-h-screen flex-1 flex-col justify-between p-6 sm:p-8 lg:col-span-7 lg:p-10">
        {/* Top Bar with Mode/Theme Controls */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-[8px] font-bold text-white shadow-xs">
              H
            </div>
            <span className="text-text text-[16px] font-bold tracking-tight">HRO</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Central Auth Container - Balanced Width */}
        <div className="mx-auto my-auto w-full max-w-[440px] py-4">
          {/* Form Header */}
          <div className="mb-5 space-y-1.5 text-center">
            <h1 className="text-text text-[22px] font-bold tracking-tight">
              {mode === 'login' ? 'Welcome back to HRO' : 'Create your HRO account'}
            </h1>
            <p className="text-text-muted text-[13px]">
              {mode === 'login'
                ? 'Sign in to access your recruitment pipeline and review queues.'
                : 'Join your team to streamline hiring, reviews, and onboarding.'}
            </p>
          </div>

          {/* Tab Switcher (Sign In / Register) */}
          <div className="border-border bg-surface-2 mb-5 grid grid-cols-2 rounded-[8px] border p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'cursor-pointer rounded-[6px] py-1.5 text-[13px] font-semibold transition-all duration-150',
                mode === 'login'
                  ? 'bg-surface-1 text-text shadow-xs'
                  : 'text-text-muted hover:text-text'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'cursor-pointer rounded-[6px] py-1.5 text-[13px] font-semibold transition-all duration-150',
                mode === 'register'
                  ? 'bg-surface-1 text-text shadow-xs'
                  : 'text-text-muted hover:text-text'
              )}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' ? (
              <>
                {/* 2-Column Row 1: Full Name & Work Email */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">Full Name</label>
                    <div className="relative">
                      <User className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-9.5 rounded-[8px] pl-8.5 text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">Work Email</label>
                    <div className="relative">
                      <Mail className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                      <Input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9.5 rounded-[8px] pl-8.5 text-[13px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Column Row 2: Role Selector & Department */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Compact Role Selector */}
                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">Your Role</label>
                    <div className="border-border bg-surface-2 grid h-9.5 grid-cols-2 rounded-[8px] border p-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('manager')}
                        className={cn(
                          'flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150 select-none',
                          selectedRole === 'manager'
                            ? 'bg-surface-1 text-text font-semibold shadow-xs'
                            : 'text-text-muted hover:text-text'
                        )}
                      >
                        <Briefcase className="text-accent h-3.5 w-3.5 shrink-0" />
                        <span>Manager</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('hr')}
                        className={cn(
                          'flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150 select-none',
                          selectedRole === 'hr'
                            ? 'bg-surface-1 text-text font-semibold shadow-xs'
                            : 'text-text-muted hover:text-text'
                        )}
                      >
                        <Users className="text-accent h-3.5 w-3.5 shrink-0" />
                        <span>HR Talent</span>
                      </button>
                    </div>
                  </div>

                  {/* Department Select Dropdown */}
                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">Department</label>
                    <div className="relative">
                      <Building2 className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="bg-surface-2 text-text border-border focus:border-border-strong h-9.5 w-full cursor-pointer appearance-none rounded-[8px] border pr-8 pl-8.5 text-[12.5px] font-medium transition-colors focus:outline-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Data & Analytics">Data & Analytics</option>
                        <option value="Operations">Operations</option>
                        <option value="People Ops">People Operations / HR</option>
                      </select>
                      <div className="text-text-subtle pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-text text-[12px] font-medium">Create Password</label>
                  <div className="relative">
                    <Lock className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-9.5 rounded-[8px] pr-10 pl-8.5 text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-subtle hover:text-text absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Checkbox
                    id="agree-terms"
                    checked={agreeTerms}
                    onCheckedChange={(val) => setAgreeTerms(Boolean(val))}
                  />
                  <label
                    htmlFor="agree-terms"
                    className="text-text-muted cursor-pointer text-[12px] leading-tight font-medium select-none"
                  >
                    I agree to the HRO Platform Terms and Privacy Policy
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Sign In Email Field */}
                <div className="space-y-1">
                  <label className="text-text text-[12px] font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-[8px] pl-9 text-[13.5px]"
                    />
                  </div>
                </div>

                {/* Sign In Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-text text-[12px] font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info('For this demo, any password or 1-click persona works!')
                      }
                      className="text-accent cursor-pointer text-[11.5px] font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="text-text-subtle pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 rounded-[8px] pr-10 pl-9 text-[13.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-subtle hover:text-text absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(val) => setRememberMe(Boolean(val))}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-text-muted cursor-pointer text-[12.5px] font-medium select-none"
                  >
                    Keep me signed in for 30 days
                  </label>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="mt-2 h-10 w-full cursor-pointer gap-2 rounded-[8px] text-[13.5px] font-semibold shadow-2xs"
            >
              <span>
                {mode === 'login' ? 'Sign In to Workspace' : 'Create Account & Enter HRO'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Access Demo Personas (Available in both, styled cleanly) */}
          <div className="border-border/80 mt-6 space-y-2.5 border-t pt-5">
            <div className="flex items-center justify-between">
              <span className="text-text-subtle text-[11px] font-semibold tracking-wider uppercase">
                1-Click Demo Persona Access
              </span>
              <span className="text-accent text-[10.5px] font-medium">Instant Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Persona 1: Manager */}
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', managerUser?.name ?? 'Arjun Kapoor')}
                className="group border-border bg-surface-1 hover:border-accent hover:bg-accent-subtle/15 flex cursor-pointer items-center justify-between rounded-[8px] border p-2 text-left transition-all duration-150 select-none hover:shadow-2xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-accent-subtle text-accent text-[10.5px] font-bold">
                      AK
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-text truncate text-[12px] font-semibold transition-colors">
                      {managerUser?.name ?? 'Arjun Kapoor'}
                    </p>
                    <p className="text-text-subtle truncate text-[10.5px]">Hiring Manager</p>
                  </div>
                </div>
                <ArrowRight className="text-text-subtle group-hover:text-text ml-1 h-3 w-3 shrink-0 transition-all group-hover:translate-x-0.5" />
              </button>

              {/* Persona 2: HR */}
              <button
                type="button"
                onClick={() => handleQuickLogin('hr', hrUser?.name ?? 'Priya Sharma')}
                className="group border-border bg-surface-1 hover:border-accent hover:bg-accent-subtle/15 flex cursor-pointer items-center justify-between rounded-[8px] border p-2 text-left transition-all duration-150 select-none hover:shadow-2xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-surface-2 text-text text-[10.5px] font-bold">
                      PS
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-text truncate text-[12px] font-semibold transition-colors">
                      {hrUser?.name ?? 'Priya Sharma'}
                    </p>
                    <p className="text-text-subtle truncate text-[10.5px]">HR Specialist</p>
                  </div>
                </div>
                <ArrowRight className="text-text-subtle group-hover:text-text ml-1 h-3 w-3 shrink-0 transition-all group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-text-subtle pt-3 text-center text-[11px]">
          <span>
            Protected by enterprise security. By signing in, you agree to our Terms and Privacy
            Policy.
          </span>
        </div>
      </div>
    </div>
  );
}
