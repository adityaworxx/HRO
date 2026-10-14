'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateOpening } from '../hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import type { Opening } from '@/types/entities';
import { FormField } from '@/components/hro/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCtcRange } from '@/lib/format';

interface OpeningFormProps {
  initialData?: Opening;
  isEditing?: boolean;
}

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Data & AI',
  'Marketing',
  'Sales',
  'Operations',
  'Human Resources',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

export function OpeningForm({ initialData, isEditing = false }: OpeningFormProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const createOpening = useCreateOpening();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [title, setTitle] = React.useState(initialData?.title ?? '');
  const [department, setDepartment] = React.useState(initialData?.department ?? 'Engineering');
  const [location, setLocation] = React.useState(initialData?.location ?? 'Bangalore (Hybrid)');
  const [employmentType, setEmploymentType] = React.useState<
    'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  >(initialData?.employmentType ?? 'Full-time');
  const [headcount, setHeadcount] = React.useState(
    initialData?.headcount ? String(initialData.headcount) : '1'
  );
  const [urgency, setUrgency] = React.useState<'Low' | 'Normal' | 'High'>(
    initialData?.urgency ?? 'Normal'
  );
  const [expMin, setExpMin] = React.useState(
    initialData?.experienceRange?.min ? String(initialData.experienceRange.min) : '3'
  );
  const [expMax, setExpMax] = React.useState(
    initialData?.experienceRange?.max ? String(initialData.experienceRange.max) : '6'
  );
  const [budgetMin, setBudgetMin] = React.useState(
    initialData?.budgetRange?.min ? String(initialData.budgetRange.min) : '20'
  );
  const [budgetMax, setBudgetMax] = React.useState(
    initialData?.budgetRange?.max ? String(initialData.budgetRange.max) : '35'
  );
  const [targetDate, setTargetDate] = React.useState(
    initialData?.targetStartDate ? initialData.targetStartDate.split('T')[0] : '2026-11-01'
  );
  const [mustHaveSkills, setMustHaveSkills] = React.useState(
    initialData?.mustHaveSkills?.join(', ') ?? 'React, TypeScript, Next.js, Tailwind CSS'
  );
  const [niceToHaveSkills, setNiceToHaveSkills] = React.useState(
    initialData?.niceToHaveSkills?.join(', ') ?? 'GraphQL, TanStack Query, Docker'
  );
  const [description, setDescription] = React.useState(
    initialData?.description ??
      'We are looking for an experienced engineer to lead frontend architecture, implement scalable design systems, and accelerate customer-facing product development.'
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Computed skill pill lists
  const mustSkillsList = React.useMemo(
    () =>
      mustHaveSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [mustHaveSkills]
  );

  const niceSkillsList = React.useMemo(
    () =>
      niceToHaveSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [niceToHaveSkills]
  );

  // Readiness Checklist Calculation
  const checklist = React.useMemo(() => {
    return [
      { id: 'title', label: 'Job Title specified', done: title.trim().length > 3 },
      { id: 'dept', label: 'Department allocated', done: !!department },
      { id: 'headcount', label: 'Valid headcount set (≥ 1)', done: parseInt(headcount, 10) >= 1 },
      {
        id: 'budget',
        label: 'Budget & Experience defined',
        done: parseFloat(budgetMin) > 0 && parseFloat(budgetMax) >= parseFloat(budgetMin),
      },
      {
        id: 'skills',
        label: 'Must-have skills added',
        done: mustSkillsList.length >= 1,
      },
      {
        id: 'desc',
        label: 'Job description drafted',
        done: description.trim().length >= 20,
      },
    ];
  }, [title, department, headcount, budgetMin, budgetMax, mustSkillsList, description]);

  const completedCount = checklist.filter((item) => item.done).length;
  const readinessPercent = Math.round((completedCount / checklist.length) * 100);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!headcount || parseInt(headcount, 10) <= 0)
      newErrors.headcount = 'Valid headcount is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the form errors before submitting.');
      return;
    }

    setErrors({});

    const payload = {
      title,
      department,
      location,
      employmentType,
      headcount: parseInt(headcount, 10),
      urgency,
      experienceRange: {
        min: parseFloat(expMin) || 0,
        max: parseFloat(expMax) || 0,
      },
      budgetRange: {
        min: parseFloat(budgetMin) || 0,
        max: parseFloat(budgetMax) || 0,
      },
      mustHaveSkills: mustSkillsList,
      niceToHaveSkills: niceSkillsList,
      description,
      targetStartDate: new Date(targetDate || '2026-11-01').toISOString(),
      status: (initialData?.status ?? 'Open') as Opening['status'],
      managerId: user?.id ?? '00000000-0000-0000-0000-000000000001',
    };

    if (isEditing) {
      toast.success(`Requisition "${title}" updated successfully!`);
      router.push(`/openings/${initialData?.id}`);
    } else {
      createOpening.mutate(payload, {
        onSuccess: (created) => {
          toast.success(`Job requisition "${title}" created successfully!`);
          router.push(`/openings/${created.id}`);
        },
        onError: () => {
          toast.error('Failed to create requisition. Please check all fields.');
        },
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6"
    >
      {/* LEFT COLUMN: Form cards with natural document flow */}
      <div className="lg:col-span-8 space-y-6">
        {/* Card 1: Core Role & Position Details */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-b border-border/80 pb-3">
            <CardTitle className="text-[16px] font-semibold text-text">
              Core Position Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Job Position Title" required error={errors.title}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField label="Department" required>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-[13px] text-text outline-none transition-colors hover:border-border-strong focus:border-accent"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Work Location" required>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore (Hybrid)"
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField label="Employment Type" required>
                <select
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(
                      e.target.value as 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
                    )
                  }
                  className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-[13px] text-text outline-none transition-colors hover:border-border-strong focus:border-accent"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Target Headcount" required error={errors.headcount}>
                <Input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="h-9 font-mono text-[13px]"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Hiring Urgency">
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Normal', 'High'] as const).map((urg) => {
                    const isSelected = urgency === urg;
                    return (
                      <button
                        key={urg}
                        type="button"
                        onClick={() => setUrgency(urg)}
                        className={cn(
                          'flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border text-[12px] font-medium transition-all',
                          isSelected
                            ? 'border-accent bg-accent/15 text-accent shadow-xs'
                            : 'border-border bg-surface-2 text-text-muted hover:border-border-strong hover:text-text'
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            urg === 'High'
                              ? 'bg-danger'
                              : urg === 'Normal'
                                ? 'bg-warning'
                                : 'bg-text-subtle'
                          )}
                        />
                        <span>{urg}</span>
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Target Start Date">
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Compensation & Experience Range */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-b border-border/80 pb-3">
            <CardTitle className="text-[16px] font-semibold text-text">
              Experience & Budget Range
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Experience Block */}
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-2/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text">
                    Experience Expectation
                  </span>
                  <Badge variant="default" className="text-[11px] font-mono">
                    {expMin}-{expMax} yrs
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Min Experience">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={expMin}
                        onChange={(e) => setExpMin(e.target.value)}
                        className="h-9 pr-8 font-mono text-[13px]"
                      />
                      <span className="text-text-subtle pointer-events-none absolute top-2 right-2.5 text-[11px]">
                        yrs
                      </span>
                    </div>
                  </FormField>
                  <FormField label="Max Experience">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={expMax}
                        onChange={(e) => setExpMax(e.target.value)}
                        className="h-9 pr-8 font-mono text-[13px]"
                      />
                      <span className="text-text-subtle pointer-events-none absolute top-2 right-2.5 text-[11px]">
                        yrs
                      </span>
                    </div>
                  </FormField>
                </div>
              </div>

              {/* Budget Block */}
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-2/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text">
                    Annual CTC Budget
                  </span>
                  <Badge
                    variant="default"
                    className="border-success/30 bg-success/15 font-mono text-[11px] font-semibold text-success"
                  >
                    {formatCtcRange(parseFloat(budgetMin) || 0, parseFloat(budgetMax) || 0)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Min Budget">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="h-9 pr-10 font-mono text-[13px]"
                      />
                      <span className="text-text-subtle pointer-events-none absolute top-2 right-2 text-[11px]">
                        LPA
                      </span>
                    </div>
                  </FormField>
                  <FormField label="Max Budget">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="h-9 pr-10 font-mono text-[13px]"
                      />
                      <span className="text-text-subtle pointer-events-none absolute top-2 right-2 text-[11px]">
                        LPA
                      </span>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Skills & Job Description */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-b border-border/80 pb-3">
            <CardTitle className="text-[16px] font-semibold text-text">
              Candidate Profile & Screening Criteria
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <FormField label="Must-Have Skills" hint="Separated by comma">
              <Input
                value={mustHaveSkills}
                onChange={(e) => setMustHaveSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, Next.js, Node.js"
                className="h-9 text-[13px]"
              />
              {mustSkillsList.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {mustSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent"
                    >
                      <Check className="h-3 w-3" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              )}
            </FormField>

            <FormField label="Nice-to-Have Skills" hint="Separated by comma">
              <Input
                value={niceToHaveSkills}
                onChange={(e) => setNiceToHaveSkills(e.target.value)}
                placeholder="e.g. GraphQL, TanStack Query, Docker, AWS"
                className="h-9 text-[13px]"
              />
              {niceSkillsList.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {niceSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </FormField>

            <FormField
              label="Job Description & Responsibilities"
              required
              error={errors.description}
            >
              <Textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline key deliverables, team expectations, and core mission..."
                className="text-[13px] leading-relaxed"
              />
              <div className="mt-1 flex justify-end text-[11px] text-text-subtle">
                <span>{description.length} characters</span>
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* Bottom Action Footer (For convenience after scrolling to bottom) */}
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-1 p-4 shadow-sm">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/openings">
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel & Back</span>
            </Link>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={createOpening.isPending}
            className="gap-2 px-5 font-medium"
          >
            {isEditing ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Update Requisition</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publish Requisition</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT COLUMN: 4 Columns (Sticky Sidebar, stays pinned at top while form scrolls) */}
      <div className="lg:col-span-4">
        <div className="sticky top-0 space-y-4">
        {/* Live Directory Preview Card */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-b border-border/80 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-semibold text-text">
                Directory Live Preview
              </CardTitle>
              <Badge variant="default" className="text-[10px] font-mono uppercase">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-[var(--radius-md)] border border-border bg-surface-2/80 p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-text-muted">
                  <span>{department}</span>
                </span>
                <Badge
                  variant="default"
                  className={cn(
                    'text-[10px] font-medium',
                    urgency === 'High'
                      ? 'border-danger/20 bg-danger/10 text-danger'
                      : urgency === 'Normal'
                        ? 'border-warning/20 bg-warning/10 text-warning'
                        : 'border-border bg-surface-3 text-text-muted'
                  )}
                >
                  {urgency} Urgency
                </Badge>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-text line-clamp-1">
                  {title.trim() ? title : 'Job Position Title'}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-text-muted">
                  <span>{location || 'Location'}</span>
                  <span>•</span>
                  <span className="font-mono">{headcount} role{parseInt(headcount, 10) > 1 ? 's' : ''}</span>
                </p>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-border bg-surface-3/80 p-2.5 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Budget Band</span>
                <span className="font-mono text-[12px] font-bold text-success">
                  {formatCtcRange(parseFloat(budgetMin) || 0, parseFloat(budgetMax) || 0)}
                </span>
              </div>

              {mustSkillsList.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {mustSkillsList.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-[4px] border border-border bg-surface-1 px-1.5 py-0.5 text-[10px] text-text-muted"
                    >
                      {s}
                    </span>
                  ))}
                  {mustSkillsList.length > 4 && (
                    <span className="text-[10px] text-text-subtle self-center">
                      +{mustSkillsList.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requisition Readiness Checklist */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-b border-border/80 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-semibold text-text">
                Readiness Score
              </CardTitle>
              <span className="font-mono text-[12px] font-bold text-accent">
                {readinessPercent}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="pt-3.5 space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-[12px]"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors',
                    item.done
                      ? 'bg-success text-bg font-bold'
                      : 'border border-border bg-surface-2 text-text-subtle'
                  )}
                >
                  {item.done ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                </span>
                <span
                  className={cn(
                    item.done ? 'text-text font-medium' : 'text-text-muted'
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Publishing Metadata Card */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                suppressHydrationWarning
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 font-bold text-[12px] text-accent"
              >
                {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <p suppressHydrationWarning className="truncate text-[13px] font-semibold text-text">
                  {mounted && user?.name ? user.name : 'Manager'}
                </p>
                <p className="text-[11px] text-text-muted">Requisition Owner</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border pt-3 text-[11px] text-text-muted">
              <div className="flex justify-between">
                <span>Target Start:</span>
                <span className="font-medium text-text">{targetDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Default Pipeline:</span>
                <span className="font-medium text-text">Standard 4-Stage</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Routing:</span>
                <span className="font-medium text-success">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </form>
  );
}
