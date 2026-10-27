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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Check, Send, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { formatCtcRange } from '@/lib/format';
import { DEPARTMENTS, getDepartmentProfile } from '../constants';

interface OpeningFormProps {
  initialData?: Opening;
  isEditing?: boolean;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

export function OpeningForm({ initialData, isEditing = false }: OpeningFormProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const createOpening = useCreateOpening();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [department, setDepartment] = React.useState<string>(
    initialData?.department ?? 'Engineering'
  );

  const currentProfile = React.useMemo(
    () => getDepartmentProfile(department),
    [department]
  );

  const initialProfile = React.useMemo(
    () => getDepartmentProfile(initialData?.department ?? 'Engineering'),
    [initialData?.department]
  );

  const [isCustomPosition, setIsCustomPosition] = React.useState<boolean>(() => {
    if (!initialData?.title) return false;
    return !initialProfile.positions.includes(initialData.title);
  });

  const [customPositionText, setCustomPositionText] = React.useState<string>(() => {
    if (!initialData?.title) return '';
    return initialProfile.positions.includes(initialData.title) ? '' : initialData.title;
  });

  const [title, setTitle] = React.useState<string>(
    initialData?.title ?? getDepartmentProfile('Engineering').defaultRole
  );

  const [location, setLocation] = React.useState(
    initialData?.location ?? 'Bangalore (Hybrid)'
  );
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

  const [mustSkills, setMustSkills] = React.useState<string[]>(() => {
    if (initialData?.mustHaveSkills && initialData.mustHaveSkills.length > 0) {
      return initialData.mustHaveSkills;
    }
    return ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'];
  });

  const [niceSkills, setNiceSkills] = React.useState<string[]>(() => {
    if (initialData?.niceToHaveSkills && initialData.niceToHaveSkills.length > 0) {
      return initialData.niceToHaveSkills;
    }
    return ['GraphQL', 'Docker', 'PostgreSQL'];
  });

  const [customMustInput, setCustomMustInput] = React.useState('');
  const [customNiceInput, setCustomNiceInput] = React.useState('');

  const [description, setDescription] = React.useState(
    initialData?.description ?? getDepartmentProfile('Engineering').defaultDescription
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // When manager changes department, update profile, positions, and tech stack
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const profile = getDepartmentProfile(newDept);

    if (!isEditing) {
      setTitle(profile.defaultRole);
      setIsCustomPosition(false);
      setCustomPositionText('');
      setDescription(profile.defaultDescription);

      // Pre-select recommended initial skills for this department
      setMustSkills(profile.techStack.slice(0, 4));
      setNiceSkills(profile.techStack.slice(4, 7));
    } else {
      if (!profile.positions.includes(title)) {
        setIsCustomPosition(true);
        setCustomPositionText(title);
      }
    }
  };

  const handlePositionChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomPosition(true);
      setTitle(customPositionText);
    } else {
      setIsCustomPosition(false);
      setTitle(val);
    }
  };

  // Must-Have skills handlers
  const toggleMustSkill = (skill: string) => {
    if (mustSkills.includes(skill)) {
      setMustSkills(mustSkills.filter((s) => s !== skill));
    } else {
      setMustSkills([...mustSkills, skill]);
      setNiceSkills(niceSkills.filter((s) => s !== skill));
    }
  };

  const removeMustSkill = (skill: string) => {
    setMustSkills(mustSkills.filter((s) => s !== skill));
  };

  const handleAddCustomMustSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customMustInput.trim();
    if (!trimmed) return;
    if (!mustSkills.includes(trimmed)) {
      setMustSkills([...mustSkills, trimmed]);
      setNiceSkills(niceSkills.filter((s) => s !== trimmed));
    }
    setCustomMustInput('');
  };

  // Nice-to-Have skills handlers
  const toggleNiceSkill = (skill: string) => {
    if (niceSkills.includes(skill)) {
      setNiceSkills(niceSkills.filter((s) => s !== skill));
    } else {
      setNiceSkills([...niceSkills, skill]);
      setMustSkills(mustSkills.filter((s) => s !== skill));
    }
  };

  const removeNiceSkill = (skill: string) => {
    setNiceSkills(niceSkills.filter((s) => s !== skill));
  };

  const handleAddCustomNiceSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customNiceInput.trim();
    if (!trimmed) return;
    if (!niceSkills.includes(trimmed)) {
      setNiceSkills([...niceSkills, trimmed]);
      setMustSkills(mustSkills.filter((s) => s !== trimmed));
    }
    setCustomNiceInput('');
  };

  const handleResetToDepartmentStack = () => {
    const profile = getDepartmentProfile(department);
    setMustSkills(profile.techStack.slice(0, 4));
    setNiceSkills(profile.techStack.slice(4, 7));
    toast.success(`Loaded recommended ${department} skills`);
  };

  // Readiness Checklist Calculation
  const checklist = React.useMemo(() => {
    return [
      { id: 'dept', label: 'Department allocated', done: !!department },
      { id: 'title', label: 'Job Title specified', done: title.trim().length > 3 },
      { id: 'headcount', label: 'Valid headcount set (≥ 1)', done: parseInt(headcount, 10) >= 1 },
      {
        id: 'budget',
        label: 'Budget & Experience defined',
        done: parseFloat(budgetMin) > 0 && parseFloat(budgetMax) >= parseFloat(budgetMin),
      },
      {
        id: 'skills',
        label: 'Must-have skills added',
        done: mustSkills.length >= 1,
      },
      {
        id: 'desc',
        label: 'Job description drafted',
        done: description.trim().length >= 20,
      },
    ];
  }, [department, title, headcount, budgetMin, budgetMax, mustSkills, description]);

  const completedCount = checklist.filter((item) => item.done).length;
  const readinessPercent = Math.round((completedCount / checklist.length) * 100);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!headcount || parseInt(headcount, 10) <= 0)
      newErrors.headcount = 'Valid headcount is required';
    if (mustSkills.length === 0)
      newErrors.skills = 'At least 1 must-have skill is required';

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
      mustHaveSkills: mustSkills,
      niceToHaveSkills: niceSkills,
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
    <form onSubmit={handleSubmit} className="grid w-full grid-cols-1 gap-6 pb-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Form cards with natural document flow */}
      <div className="space-y-6 lg:col-span-8">
        {/* Card 1: Core Role & Position Details */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-border/80 border-b pb-3">
            <CardTitle className="text-text text-[16px] font-semibold">
              Core Position Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Department Dropdown - Select first to drive positions & tech stack */}
              <FormField label="Department" required>
                <Select value={department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="border-border bg-surface-2 text-text hover:bg-surface-3 h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] transition-colors">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Dynamic Job Profile / Position Dropdown */}
              <FormField label="Job Position Title" required error={errors.title}>
                <Select
                  value={isCustomPosition ? '__custom__' : title}
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger className="border-border bg-surface-2 text-text hover:bg-surface-3 h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] transition-colors">
                    <SelectValue placeholder="Select position title" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      {department} Roles ({currentProfile.positions.length})
                    </div>
                    {currentProfile.positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-accent font-medium">
                      + Custom / Other Position...
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Custom Position Title Input if custom option is selected */}
            {isCustomPosition && (
              <FormField label="Custom Position Title" required error={errors.title}>
                <Input
                  value={customPositionText}
                  onChange={(e) => {
                    setCustomPositionText(e.target.value);
                    setTitle(e.target.value);
                  }}
                  placeholder="e.g. Lead Distributed Systems Engineer"
                  className="h-9 text-[13px]"
                  autoFocus
                />
              </FormField>
            )}

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
                <Select
                  value={employmentType}
                  onValueChange={(val) =>
                    setEmploymentType(val as 'Full-time' | 'Part-time' | 'Contract' | 'Internship')
                  }
                >
                  <SelectTrigger className="border-border bg-surface-2 text-text hover:bg-surface-3 h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] transition-colors">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <DatePicker
                  value={targetDate}
                  onChange={(val) => setTargetDate(val)}
                  placeholder="Select target start date"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Compensation & Experience Range */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-border/80 border-b pb-3">
            <CardTitle className="text-text text-[16px] font-semibold">
              Experience & Budget Range
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Experience Block */}
              <div className="border-border bg-surface-2/50 rounded-[var(--radius-md)] border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-text text-[13px] font-semibold">
                    Experience Expectation
                  </span>
                  <Badge variant="default" className="font-mono text-[11px]">
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
              <div className="border-border bg-surface-2/50 rounded-[var(--radius-md)] border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-text text-[13px] font-semibold">Annual CTC Budget</span>
                  <Badge
                    variant="default"
                    className="border-success/30 bg-success/15 text-success font-mono text-[11px] font-semibold"
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

        {/* Card 3: Screening Criteria & Competencies */}
        <Card className="border-border bg-surface-1 shadow-sm">
          <CardHeader className="border-border/80 border-b pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-text text-[15px] font-semibold">
                  Candidate Profile & Screening Criteria
                </CardTitle>
                <p className="text-text-muted mt-0.5 text-[12px]">
                  Specify required competencies and optional skills for resume screening.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToDepartmentStack}
                className="h-7 px-2.5 text-[11.5px] font-normal text-text-muted hover:text-text hover:bg-surface-2 rounded-[6px] border border-border/80 self-start sm:self-auto cursor-pointer"
                title={`Pre-fill recommended skills for ${department}`}
              >
                Reset to {department} stack
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {/* Must-Have Skills Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-text flex items-center gap-1.5 text-[13px] font-semibold">
                    <span>Must-Have Skills</span>
                    <span className="text-danger">*</span>
                    {mustSkills.length > 0 && (
                      <span className="font-mono text-[11px] text-text-subtle font-normal">
                        ({mustSkills.length})
                      </span>
                    )}
                  </label>
                  <p className="text-text-subtle text-[11.5px]">
                    Required core competencies for candidate shortlisting
                  </p>
                </div>
              </div>

              {/* Sleek Tag Input Box */}
              <div
                className={cn(
                  'min-h-[44px] w-full rounded-[8px] border bg-surface-1 p-2 flex flex-wrap items-center gap-1.5 transition-all',
                  errors.skills
                    ? 'border-danger/70 focus-within:border-danger focus-within:ring-1 focus-within:ring-danger/20'
                    : 'border-border focus-within:border-border-strong focus-within:ring-1 focus-within:ring-border/80'
                )}
              >
                {mustSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-[5px] bg-surface-2 border border-border/70 px-2.5 py-1 text-[12px] font-medium text-text select-none"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeMustSkill(skill)}
                      className="text-text-subtle hover:text-text -mr-0.5 p-0.5 rounded-[3px] hover:bg-surface-3 transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex-1 min-w-[170px] flex items-center gap-1">
                  <input
                    value={customMustInput}
                    onChange={(e) => setCustomMustInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddCustomMustSkill();
                      }
                    }}
                    placeholder={
                      mustSkills.length === 0
                        ? 'Type a skill and press Enter, or pick below...'
                        : 'Add skill...'
                    }
                    className="w-full bg-transparent text-[12.5px] text-text placeholder:text-text-subtle/70 focus:outline-none px-1 h-6"
                  />
                  {customMustInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddCustomMustSkill()}
                      className="h-6 px-2 text-[11px] font-medium text-text bg-surface-2 hover:bg-surface-3 rounded-[4px] border border-border/70 cursor-pointer shrink-0 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {errors.skills && (
                <p className="text-danger text-[11px] font-medium">{errors.skills}</p>
              )}

              {/* Clean, Non-intrusive Suggestions */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[11.5px] text-text-subtle font-medium select-none">
                  Suggested for {department}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.techStack.map((tech) => {
                    const isSelected = mustSkills.includes(tech);
                    const isNice = niceSkills.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleMustSkill(tech)}
                        disabled={isNice}
                        className={cn(
                          'cursor-pointer rounded-[6px] border px-2.5 py-1 text-[11.5px] transition-all select-none',
                          isSelected
                            ? 'border-border-strong bg-surface-3 text-text font-medium shadow-2xs'
                            : isNice
                              ? 'border-border/30 bg-surface-2/20 text-text-subtle/40 cursor-not-allowed opacity-50'
                              : 'border-border/60 bg-surface-1 text-text-muted hover:border-border hover:bg-surface-2 hover:text-text'
                        )}
                        title={
                          isSelected
                            ? `${tech} selected in Must-Have (click to remove)`
                            : isNice
                              ? `${tech} already in Nice-to-Have`
                              : `Add ${tech} to Must-Have`
                        }
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Nice-to-Have Skills Section */}
            <div className="border-border/60 space-y-2.5 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-text flex items-center gap-1.5 text-[13px] font-semibold">
                    <span>Nice-to-Have Skills</span>
                    <span className="text-text-subtle font-normal text-[11.5px]">(Optional)</span>
                    {niceSkills.length > 0 && (
                      <span className="font-mono text-[11px] text-text-subtle font-normal">
                        ({niceSkills.length})
                      </span>
                    )}
                  </label>
                  <p className="text-text-subtle text-[11.5px]">
                    Preferred secondary skills or bonus experience
                  </p>
                </div>
              </div>

              {/* Sleek Tag Input Box */}
              <div className="min-h-[44px] w-full rounded-[8px] border border-border bg-surface-1 p-2 flex flex-wrap items-center gap-1.5 focus-within:border-border-strong focus-within:ring-1 focus-within:ring-border/80 transition-all">
                {niceSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-[5px] bg-surface-2 border border-border/70 px-2.5 py-1 text-[12px] font-medium text-text select-none"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeNiceSkill(skill)}
                      className="text-text-subtle hover:text-text -mr-0.5 p-0.5 rounded-[3px] hover:bg-surface-3 transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex-1 min-w-[170px] flex items-center gap-1">
                  <input
                    value={customNiceInput}
                    onChange={(e) => setCustomNiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddCustomNiceSkill();
                      }
                    }}
                    placeholder={
                      niceSkills.length === 0
                        ? 'Type a skill and press Enter, or pick below...'
                        : 'Add skill...'
                    }
                    className="w-full bg-transparent text-[12.5px] text-text placeholder:text-text-subtle/70 focus:outline-none px-1 h-6"
                  />
                  {customNiceInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddCustomNiceSkill()}
                      className="h-6 px-2 text-[11px] font-medium text-text bg-surface-2 hover:bg-surface-3 rounded-[4px] border border-border/70 cursor-pointer shrink-0 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Clean, Non-intrusive Suggestions */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[11.5px] text-text-subtle font-medium select-none">
                  Suggested for {department}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.techStack.map((tech) => {
                    const isMust = mustSkills.includes(tech);
                    const isSelected = niceSkills.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleNiceSkill(tech)}
                        disabled={isMust}
                        className={cn(
                          'cursor-pointer rounded-[6px] border px-2.5 py-1 text-[11.5px] transition-all select-none',
                          isSelected
                            ? 'border-border-strong bg-surface-3 text-text font-medium shadow-2xs'
                            : isMust
                              ? 'border-border/30 bg-surface-2/20 text-text-subtle/40 cursor-not-allowed opacity-50'
                              : 'border-border/60 bg-surface-1 text-text-muted hover:border-border hover:bg-surface-2 hover:text-text'
                        )}
                        title={
                          isSelected
                            ? `${tech} selected in Nice-to-Have (click to remove)`
                            : isMust
                              ? `${tech} already in Must-Have`
                              : `Add ${tech} to Nice-to-Have`
                        }
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Job Description & Deliverables */}
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
              <div className="text-text-subtle mt-1 flex justify-end text-[11px]">
                <span>{description.length} characters</span>
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* Bottom Action Footer */}
        <div className="border-border bg-surface-1 flex items-center justify-between rounded-[var(--radius-md)] border p-4 shadow-sm">
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
            <CardHeader className="border-border/80 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-text text-[14px] font-semibold">
                  Directory Live Preview
                </CardTitle>
                <Badge variant="default" className="font-mono text-[10px] uppercase">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border-border bg-surface-2/80 space-y-3.5 rounded-[var(--radius-md)] border p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-surface-3 text-text-muted inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium">
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
                  <h3 className="text-text line-clamp-1 text-[15px] font-bold">
                    {title.trim() ? title : 'Job Position Title'}
                  </h3>
                  <p className="text-text-muted mt-1 flex items-center gap-1.5 text-[12px]">
                    <span>{location || 'Location'}</span>
                    <span>•</span>
                    <span className="font-mono">
                      {headcount} role{parseInt(headcount, 10) > 1 ? 's' : ''}
                    </span>
                  </p>
                </div>

                <div className="border-border bg-surface-3/80 flex items-center justify-between rounded-[var(--radius-sm)] border p-2.5">
                  <span className="text-text-muted text-[11px]">Budget Band</span>
                  <span className="text-success font-mono text-[12px] font-bold">
                    {formatCtcRange(parseFloat(budgetMin) || 0, parseFloat(budgetMax) || 0)}
                  </span>
                </div>

                {mustSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {mustSkills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="border-border bg-surface-1 text-text-muted rounded-[4px] border px-1.5 py-0.5 text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                    {mustSkills.length > 4 && (
                      <span className="text-text-subtle self-center text-[10px]">
                        +{mustSkills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requisition Readiness Checklist */}
          <Card className="border-border bg-surface-1 shadow-sm">
            <CardHeader className="border-border/80 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-text text-[14px] font-semibold">
                  Readiness Score
                </CardTitle>
                <span className="text-accent font-mono text-[12px] font-bold">
                  {readinessPercent}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="bg-surface-3 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-3.5">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-[12px]">
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors',
                      item.done
                        ? 'bg-success font-bold text-white'
                        : 'border-border bg-surface-2 text-text-subtle border'
                    )}
                  >
                    {item.done ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                  </span>
                  <span className={cn(item.done ? 'text-text font-medium' : 'text-text-muted')}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Publishing Metadata Card */}
          <Card className="border-border bg-surface-1 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div
                  suppressHydrationWarning
                  className="bg-accent/20 text-accent flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold"
                >
                  {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    suppressHydrationWarning
                    className="text-text truncate text-[13px] font-semibold"
                  >
                    {mounted && user?.name ? user.name : 'Manager'}
                  </p>
                  <p className="text-text-muted text-[11px]">Requisition Owner</p>
                </div>
              </div>

              <div className="border-border text-text-muted space-y-1.5 border-t pt-3 text-[11px]">
                <div className="flex justify-between">
                  <span>Target Start:</span>
                  <span className="text-text font-medium">{targetDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Default Pipeline:</span>
                  <span className="text-text font-medium">Standard 4-Stage</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Routing:</span>
                  <span className="text-success font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
