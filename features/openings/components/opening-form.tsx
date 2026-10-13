'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOpening } from '../hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import type { Opening } from '@/types/entities';
import { FormField } from '@/components/hro/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Briefcase, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface OpeningFormProps {
  initialData?: Opening;
  isEditing?: boolean;
}

export function OpeningForm({ initialData, isEditing = false }: OpeningFormProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const createOpening = useCreateOpening();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    const mustSkillsList = mustHaveSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const niceSkillsList = niceToHaveSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[18px]">
            <Briefcase className="text-accent h-5 w-5" />
            <span>{isEditing ? 'Edit Job Requisition' : 'Core Role Details'}</span>
          </CardTitle>
          <CardDescription>
            Basic position details, department allocation, and operational requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Job Position Title" required error={errors.title}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </FormField>

            <FormField label="Department" required>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border-border bg-surface-2 text-text focus:ring-accent h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] outline-none focus:ring-1"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField label="Work Location" required>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore (Hybrid)"
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
                className="border-border bg-surface-2 text-text focus:ring-accent h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] outline-none focus:ring-1"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </FormField>

            <FormField label="Target Headcount" required error={errors.headcount}>
              <Input
                type="number"
                min="1"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField label="Hiring Urgency">
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'Low' | 'Normal' | 'High')}
                className="border-border bg-surface-2 text-text focus:ring-accent h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] outline-none focus:ring-1"
              >
                <option value="Normal">Normal</option>
                <option value="High">High (Immediate)</option>
                <option value="Low">Low</option>
              </select>
            </FormField>

            <FormField label="Target Start Date">
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Compensation & Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[17px]">Experience & Budget Range</CardTitle>
          <CardDescription>
            Specify compensation limits and required industry experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Experience (Yrs)">
                <Input
                  type="number"
                  min="0"
                  value={expMin}
                  onChange={(e) => setExpMin(e.target.value)}
                />
              </FormField>
              <FormField label="Max Experience (Yrs)">
                <Input
                  type="number"
                  min="0"
                  value={expMax}
                  onChange={(e) => setExpMax(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Budget (₹ LPA)">
                <Input
                  type="number"
                  min="0"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </FormField>
              <FormField label="Max Budget (₹ LPA)">
                <Input
                  type="number"
                  min="0"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[17px]">Candidate Profile & Skills</CardTitle>
          <CardDescription>Key proficiencies required for candidate screening.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField label="Must-Have Skills" hint="Comma-separated">
            <Input
              value={mustHaveSkills}
              onChange={(e) => setMustHaveSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, Next.js"
            />
          </FormField>

          <FormField label="Nice-to-Have Skills" hint="Comma-separated">
            <Input
              value={niceToHaveSkills}
              onChange={(e) => setNiceToHaveSkills(e.target.value)}
              placeholder="e.g. TanStack Query, Docker, GraphQL"
            />
          </FormField>

          <FormField label="Job Description & Responsibilities" required error={errors.description}>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key responsibilities and expectations..."
            />
          </FormField>
        </CardContent>
        <CardFooter className="border-border flex justify-between border-t pt-4">
          <Button asChild variant="outline">
            <Link href="/openings" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel</span>
            </Link>
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={createOpening.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isEditing ? 'Save Requisition Changes' : 'Submit & Publish Requisition'}</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
