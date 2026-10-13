'use client';

import * as React from 'react';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/hro/status-badge';
import { StatCard } from '@/components/hro/stat-card';
import { StageStepper } from '@/components/hro/stage-stepper';
import { ActivityTimeline } from '@/components/hro/activity-timeline';
import { CandidateCard } from '@/components/hro/candidate-card';
import { KanbanColumn } from '@/components/hro/kanban-column';
import { DataTable } from '@/components/hro/data-table';
import { EmptyState } from '@/components/hro/empty-state';
import { ErrorState } from '@/components/hro/error-state';
import { OPENING_STATUSES, CANDIDATE_STAGES } from '@/lib/constants';
import type { Candidate, ActivityEvent } from '@/types/entities';
import type { ColumnDef } from '@tanstack/react-table';

const COLOR_TOKENS = [
  { name: '--bg', label: 'Background', var: 'var(--bg)', border: true },
  { name: '--surface-1', label: 'Surface 1 (Cards/Sidebar)', var: 'var(--surface-1)' },
  { name: '--surface-2', label: 'Surface 2 (Inputs/Raised)', var: 'var(--surface-2)' },
  { name: '--surface-3', label: 'Surface 3 (Popovers/Hover)', var: 'var(--surface-3)' },
  { name: '--border', label: 'Border Default', var: 'var(--border)' },
  { name: '--border-strong', label: 'Border Strong', var: 'var(--border-strong)' },
  { name: '--text', label: 'Text Primary', var: 'var(--text)' },
  { name: '--text-muted', label: 'Text Muted', var: 'var(--text-muted)' },
  { name: '--text-subtle', label: 'Text Subtle', var: 'var(--text-subtle)' },
  { name: '--accent', label: 'Accent Primary', var: 'var(--accent)' },
  { name: '--accent-subtle', label: 'Accent Subtle', var: 'var(--accent-subtle)' },
  { name: '--success', label: 'Success', var: 'var(--success)' },
  { name: '--warning', label: 'Warning', var: 'var(--warning)' },
  { name: '--danger', label: 'Danger', var: 'var(--danger)' },
  { name: '--info', label: 'Info', var: 'var(--info)' },
];

const SAMPLE_CANDIDATE: Candidate = {
  id: 'c1',
  openingId: 'o1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 9876543210',
  currentCompany: 'Razorpay',
  currentRole: 'Senior Backend Engineer',
  experienceYears: 6,
  noticePeriod: '30 Days',
  expectedCtc: 24,
  source: 'LinkedIn',
  stage: 'Shared with Manager',
  managerDecision: 'Pending',
  interviewOutcome: 'Pending',
};

const SAMPLE_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'a1',
    entityType: 'candidate',
    entityId: 'c1',
    actor: 'Priya Sharma (HR)',
    message: 'Shared candidate Aarav Sharma with Hiring Manager for review.',
    timestamp: '2026-10-13T09:30:00.000Z',
  },
  {
    id: 'a2',
    entityType: 'opening',
    entityId: 'o1',
    actor: 'Arjun Kapoor (Manager)',
    message: 'Raised requisition for Senior Backend Engineer (2 openings).',
    timestamp: '2026-10-12T14:15:00.000Z',
  },
];

interface SampleRow {
  id: string;
  title: string;
  department: string;
  headcount: number;
  status: string;
}

const SAMPLE_ROWS: SampleRow[] = [
  {
    id: '1',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    headcount: 2,
    status: 'Open',
  },
  {
    id: '2',
    title: 'Frontend Tech Lead',
    department: 'Engineering',
    headcount: 1,
    status: 'Interviewing',
  },
  { id: '3', title: 'Product Designer', department: 'Design', headcount: 1, status: 'Filled' },
];

const SAMPLE_COLUMNS: ColumnDef<SampleRow, unknown>[] = [
  { accessorKey: 'title', header: 'Job Title' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'headcount', header: 'Headcount' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { original: SampleRow } }) => (
      <StatusBadge status={row.original.status} type="opening" />
    ),
  },
];

export default function DesignSystemPage() {
  return (
    <div className="bg-bg text-text mx-auto min-h-screen max-w-6xl space-y-16 p-6 sm:p-12">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-text text-[28px] font-semibold">
            HRO Design System & Component Catalog
          </h1>
          <p className="text-text-muted mt-1 text-[14px]">
            Production tokens, typography scales, contrast verification, and primitive states.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text-subtle text-[13px]">Theme Toggle:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* 1. Tokens Color Palette */}
      <section className="space-y-4">
        <h2 className="text-text text-[18px] font-semibold">1. Semantic Color Tokens</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {COLOR_TOKENS.map((token) => (
            <div
              key={token.name}
              className="border-border bg-surface-1 flex flex-col rounded-[var(--radius-md)] border p-3 shadow-none"
            >
              <div
                className="border-border/40 mb-2 h-10 w-full rounded-[var(--radius-sm)] border"
                style={{ backgroundColor: token.var }}
              />
              <span className="text-text font-mono text-[11px] font-semibold">{token.name}</span>
              <span className="text-text-subtle truncate text-[11px]">{token.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Scale */}
      <section className="space-y-4">
        <h2 className="text-text text-[18px] font-semibold">2. Typography Scale</h2>
        <div className="border-border bg-surface-1 space-y-3 rounded-[var(--radius-md)] border p-6">
          <div className="text-[28px] font-semibold">Page Title (28px semibold)</div>
          <div className="text-[24px] font-semibold">Heading 1 (24px semibold)</div>
          <div className="text-[20px] font-semibold">Section Heading (20px semibold)</div>
          <div className="text-[16px] font-semibold">Sub-heading (16px semibold)</div>
          <div className="text-[14px]">Base Body text (14px regular) - Standard reading size</div>
          <div className="text-text-muted text-[13px]">Table and Navigation text (13px muted)</div>
          <div className="text-text-subtle text-[12px]">Captions and timestamps (12px subtle)</div>
          <div className="text-accent font-mono text-[14px]">
            Monospace ID: 8f4c2b9a-11e2 (JetBrains Mono)
          </div>
        </div>
      </section>

      {/* 3. Status Badges */}
      <section className="space-y-4">
        <h2 className="text-text text-[18px] font-semibold">
          3. Status Badges (Opening & Candidate)
        </h2>
        <div className="border-border bg-surface-1 space-y-4 rounded-[var(--radius-md)] border p-6">
          <div>
            <h3 className="text-text-subtle mb-2 text-[13px] font-medium">Opening Statuses</h3>
            <div className="flex flex-wrap gap-2">
              {OPENING_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} type="opening" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-text-subtle mb-2 text-[13px] font-medium">Candidate Stages</h3>
            <div className="flex flex-wrap gap-2">
              {CANDIDATE_STAGES.map((stage) => (
                <StatusBadge key={stage} status={stage} type="candidate" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Buttons & Form Controls */}
      <section className="space-y-4">
        <h2 className="text-text text-[18px] font-semibold">4. Buttons & Form Controls</h2>
        <div className="border-border bg-surface-1 space-y-6 rounded-[var(--radius-md)] border p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" loading>
              Loading...
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <Input placeholder="Standard Input text..." />
            <Input error placeholder="Input with Error state..." />
            <Textarea placeholder="Textarea field..." />
          </div>
        </div>
      </section>

      {/* 5. Domain Composites */}
      <section className="space-y-6">
        <h2 className="text-text text-[18px] font-semibold">5. HRO Composite Components</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Active Requisitions" value={8} delta="+2 this week" />
          <StatCard label="Candidates in Pipeline" value={30} delta="12 for interview" />
          <StatCard label="Pending Onboarding" value={2} delta="Joining in 14d" />
        </div>

        {/* Stage Stepper */}
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-6">
          <h3 className="text-text mb-2 text-[14px] font-semibold">Stage Stepper</h3>
          <StageStepper currentStatus="Interviewing" />
        </div>

        {/* Kanban Column & Candidate Card */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            id="col-sample"
            title="Shared with Manager"
            count={1}
            availableStages={['Interview', 'Rejected']}
          >
            <CandidateCard candidate={SAMPLE_CANDIDATE} />
          </KanbanColumn>
        </div>

        {/* Activity Timeline */}
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-6">
          <h3 className="text-text mb-4 text-[14px] font-semibold">Activity Timeline</h3>
          <ActivityTimeline events={SAMPLE_ACTIVITIES} />
        </div>

        {/* Data Table */}
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-6">
          <h3 className="text-text mb-4 text-[14px] font-semibold">DataTable Component</h3>
          <DataTable columns={SAMPLE_COLUMNS} data={SAMPLE_ROWS} />
        </div>

        {/* Empty & Error States */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EmptyState
            title="Sample Empty State"
            description="When zero records match the criteria."
          />
          <ErrorState
            title="Sample Error State"
            message="When simulated failure triggers."
            onRetry={() => {}}
          />
        </div>
      </section>
    </div>
  );
}
