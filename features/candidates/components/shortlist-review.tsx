'use client';

import * as React from 'react';
import { useCandidates, useRecordManagerDecision } from '../hooks';
import { useOpenings } from '@/features/openings/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateCard } from '@/components/hro/candidate-card';
import { SourceBadge } from '@/components/hro/source-badge';
import { CompanyLogo } from '@/components/hro/company-logo';
import { EmptyState } from '@/components/hro/empty-state';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { formatCtc } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
  Building2,
  Search,
  Sparkles,
  Check,
  Clock,
  ArrowRight,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { matchCandidateToOpening } from '@/lib/ai-matcher';
import { toast } from 'sonner';
import type { Candidate, Opening } from '@/types/entities';

// Department Icon Map matching Openings & Candidates view
const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,
  Design: Palette,
  'Data & Analytics': BarChart3,
  Product: Layers,
  'Human Resources': Users,
  Operations: Building2,
};

const CANDIDATES_PER_PAGE = 4;

export function ShortlistReview() {
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();
  const recordDecision = useRecordManagerDecision();

  // Candidates awaiting hiring manager decision
  const pendingCandidates = React.useMemo(() => {
    return candidates.filter(
      (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
    );
  }, [candidates]);

  // Openings map for quick lookup
  const openingsMap = React.useMemo(() => {
    const map = new Map<string, Opening>();
    for (const o of openings) {
      map.set(o.id, o);
    }
    return map;
  }, [openings]);

  // Search, filter, pagination, and sheet states
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');
  const [selectedOpeningId, setSelectedOpeningId] = React.useState<string>('all');
  const [pageByDept, setPageByDept] = React.useState<Record<string, number>>({});
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [isReviewSheetOpen, setIsReviewSheetOpen] = React.useState<boolean>(false);
  const [managerComment, setManagerComment] = React.useState<string>('');
  const [pendingDecision, setPendingDecision] = React.useState<'Shortlisted' | 'Rejected' | null>(null);

  // Reset pagination when filters change
  React.useEffect(() => {
    setPageByDept({});
  }, [searchQuery, selectedDepartment, selectedOpeningId]);

  // Unique departments for filter
  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    for (const c of pendingCandidates) {
      const opening = openingsMap.get(c.openingId);
      if (opening?.department) deptSet.add(opening.department);
    }
    return Array.from(deptSet).sort();
  }, [pendingCandidates, openingsMap]);

  // Requisitions with pending candidate profiles
  const relevantOpenings = React.useMemo(() => {
    const openingIds = new Set(pendingCandidates.map((c) => c.openingId));
    return openings.filter((o) => openingIds.has(o.id));
  }, [pendingCandidates, openings]);

  // Filter candidates by search query, department, and requisition
  const filteredCandidates = React.useMemo(() => {
    let list = pendingCandidates;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => {
        const opening = openingsMap.get(c.openingId);
        return (
          c.name.toLowerCase().includes(q) ||
          c.currentRole.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          (opening && (
            opening.title.toLowerCase().includes(q) ||
            opening.department.toLowerCase().includes(q) ||
            opening.mustHaveSkills.some((s) => s.toLowerCase().includes(q))
          ))
        );
      });
    }

    if (selectedDepartment !== 'all') {
      list = list.filter((c) => {
        const opening = openingsMap.get(c.openingId);
        return (opening?.department || 'General') === selectedDepartment;
      });
    }

    if (selectedOpeningId !== 'all') {
      list = list.filter((c) => c.openingId === selectedOpeningId);
    }

    return list;
  }, [pendingCandidates, searchQuery, selectedDepartment, selectedOpeningId, openingsMap]);

  // Department counts for filter telemetry
  const departmentCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of pendingCandidates) {
      const opening = openingsMap.get(c.openingId);
      const dept = opening?.department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    }
    return counts;
  }, [pendingCandidates, openingsMap]);

  // Group filtered candidates into department columns
  const departmentGroups = React.useMemo(() => {
    // If a specific department is chosen, show only that column; otherwise, show all departments present in pendingCandidates
    const deptSet = new Set<string>();
    if (selectedDepartment !== 'all') {
      deptSet.add(selectedDepartment);
    } else {
      for (const c of pendingCandidates) {
        const opening = openingsMap.get(c.openingId);
        deptSet.add(opening?.department || 'General');
      }
    }

    const preferredOrder = [
      'Engineering',
      'Product',
      'Design',
      'Data & Analytics',
      'Operations',
      'Human Resources',
      'General',
    ];

    const sortedDepts = Array.from(deptSet).sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedDepts.map((dept) => {
      const Icon = DEPARTMENT_ICONS[dept] || Building2;
      return {
        id: dept,
        title: dept,
        icon: Icon,
        candidates: filteredCandidates.filter((c) => {
          const opening = openingsMap.get(c.openingId);
          return (opening?.department || 'General') === dept;
        }),
      };
    });
  }, [filteredCandidates, pendingCandidates, selectedDepartment, openingsMap]);

  // Selected candidate's opening and AI match calculation
  const selectedOpening = React.useMemo(() => {
    if (!selectedCandidate) return null;
    return openingsMap.get(selectedCandidate.openingId) ?? null;
  }, [selectedCandidate, openingsMap]);

  const selectedAiMatch = React.useMemo(() => {
    if (!selectedCandidate || !selectedOpening) return null;
    return matchCandidateToOpening(selectedCandidate, selectedOpening);
  }, [selectedCandidate, selectedOpening]);

  // Handler to open the review sheet for a clicked candidate
  const handleOpenReview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setManagerComment(candidate.managerComment || '');
    setIsReviewSheetOpen(true);
  };

  // Handler for Shortlist / Reject decision
  const handleDecision = (decision: 'Shortlisted' | 'Rejected') => {
    if (!selectedCandidate) return;
    setPendingDecision(decision);

    recordDecision.mutate(
      {
        id: selectedCandidate.id,
        decision,
        comment: managerComment.trim() ? managerComment.trim() : undefined,
      },
      {
        onSuccess: () => {
          if (decision === 'Shortlisted') {
            toast.success(`🎯 ${selectedCandidate.name} shortlisted! Sent to HR for interview scheduling.`);
          } else {
            toast.info(`${selectedCandidate.name} rejected from evaluation queue.`);
          }
          setIsReviewSheetOpen(false);
          setSelectedCandidate(null);
          setManagerComment('');
          setPendingDecision(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to record evaluation decision');
          setPendingDecision(null);
        },
      }
    );
  };

  if (loadingCandidates || loadingOpenings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-muted text-[13px]">Loading review queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter and Search Bar (matching Pipeline & Candidates views) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-text-subtle absolute top-2.5 left-3 h-4 w-4 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, role, skill..."
              className="h-9 pl-9 pr-8 text-[13px] bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 rounded-[8px] transition-all shadow-2xs w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-text-subtle hover:text-text absolute top-2.5 right-3 cursor-pointer"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Filter */}
            {departments.length > 0 && (
              <Select
                value={selectedDepartment}
                onValueChange={(val) => setSelectedDepartment(val)}
              >
                <SelectTrigger className="h-9 w-full sm:w-auto min-w-0 sm:min-w-[160px] gap-2 border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text px-3 text-[13px] font-medium rounded-[8px] shadow-2xs">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-[190px]">
                  <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                    All Departments ({pendingCandidates.length})
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      {dept} ({departmentCounts[dept] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Requisition Filter */}
            {relevantOpenings.length > 0 && (
              <Select
                value={selectedOpeningId}
                onValueChange={(val) => setSelectedOpeningId(val)}
              >
                <SelectTrigger className="h-9 w-full sm:w-auto min-w-0 sm:min-w-[200px] gap-2 border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text px-3 text-[13px] font-medium rounded-[8px] shadow-2xs">
                  <SelectValue placeholder={`All Requisitions (${relevantOpenings.length})`} />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-[240px]">
                  <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                    All Requisitions ({relevantOpenings.length})
                  </SelectItem>
                  {relevantOpenings.map((opening) => (
                    <SelectItem key={opening.id} value={opening.id} className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      {opening.title} ({opening.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="text-text-muted text-[12px] font-medium">
          Showing <span className="text-text font-semibold">{filteredCandidates.length}</span> pending {filteredCandidates.length === 1 ? 'profile' : 'profiles'}
        </div>
      </div>

      {/* 2. Main Content: Department Columns of Candidate Cards */}
      {pendingCandidates.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Review Queue Clear"
          description="All candidate profiles forwarded by talent acquisition have been reviewed. New submissions will appear here automatically."
        />
      ) : filteredCandidates.length === 0 ? (
        <div className="border border-dashed border-border/70 rounded-[10px] p-12 text-center select-none">
          <Filter className="text-text-subtle mx-auto h-8 w-8" />
          <p className="text-text font-semibold text-[14px] mt-3">No candidates match your filters</p>
          <p className="text-text-muted text-[12.5px] mt-1">
            Try adjusting your search query or selecting &quot;All Departments&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('all');
              setSelectedOpeningId('all');
            }}
            className="text-accent hover:underline text-[12px] font-medium mt-2 inline-block cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        /* Horizontal Multi-Column Board */
        <div className="flex gap-4 overflow-x-auto pb-6 items-start pt-1 scrollbar-thin">
          {departmentGroups.map((group) => {
            const ColIcon = group.icon;
            const totalCandidates = group.candidates.length;
            const totalPages = Math.ceil(totalCandidates / CANDIDATES_PER_PAGE);
            const currentPage = pageByDept[group.id] || 1;
            const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
            const startIndex = (validPage - 1) * CANDIDATES_PER_PAGE;
            const visibleCandidates = group.candidates.slice(
              startIndex,
              startIndex + CANDIDATES_PER_PAGE
            );

            return (
              <div
                key={group.id}
                className="w-[340px] xs:w-[360px] sm:w-[380px] max-w-[calc(100vw-2.5rem)] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3.5 space-y-2.5"
              >
                <div className="space-y-2.5">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent/15 text-accent shrink-0">
                        <ColIcon className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-[13.5px] font-semibold text-text truncate">
                        {group.title}
                      </h3>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                      {totalCandidates}
                    </span>
                  </div>

                  {/* Column Cards Container: Exact card format preserved */}
                  <div className="space-y-2.5 min-h-[100px]">
                    {group.candidates.length === 0 ? (
                      <div className="rounded-[8px] border border-dashed border-border/60 p-5 text-center select-none">
                        <p className="text-[11.5px] text-text-subtle">No pending profiles</p>
                      </div>
                    ) : (
                      visibleCandidates.map((candidate) => {
                        const opening = openingsMap.get(candidate.openingId);
                        return (
                          <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            openingTitle={opening?.title}
                            onClick={() => handleOpenReview(candidate)}
                            showReorderIcon={false}
                            actionText="Review Dossier & Decide"
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Per-Column Pagination Footer when more than 4 candidates */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11.5px] select-none">
                    <button
                      type="button"
                      disabled={validPage <= 1}
                      onClick={() =>
                        setPageByDept((prev) => ({
                          ...prev,
                          [group.id]: Math.max(1, validPage - 1),
                        }))
                      }
                      className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Previous page"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <span className="font-mono text-text-subtle text-[11px]">
                      {startIndex + 1}–{Math.min(startIndex + CANDIDATES_PER_PAGE, totalCandidates)} of {totalCandidates}
                    </span>

                    <button
                      type="button"
                      disabled={validPage >= totalPages}
                      onClick={() =>
                        setPageByDept((prev) => ({
                          ...prev,
                          [group.id]: Math.min(totalPages, validPage + 1),
                        }))
                      }
                      className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Next page"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Candidate Review Sheet (Opens on Card Click: Shortlist & Cancel Options) */}
      <Sheet open={isReviewSheetOpen} onOpenChange={setIsReviewSheetOpen}>
        <SheetContent
          side="right"
          className="border-border bg-surface-1 flex w-full flex-col overflow-y-auto p-0 shadow-2xl sm:max-w-xl md:max-w-2xl select-none"
        >
          {selectedCandidate && (
            <div className="flex flex-col h-full justify-between">
              {/* Top Dossier Header */}
              <div className="border-border/70 bg-surface-1 relative shrink-0 border-b px-6 pt-5 pb-5">
                {/* Accent hairline */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />

                <div className="flex items-start justify-between gap-3 mr-8">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 shrink-0 border border-border/70 bg-surface-2 shadow-2xs">
                      <AvatarFallback className="text-[14px] font-bold text-text bg-surface-2 tracking-wide">
                        {selectedCandidate.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[17px] font-bold text-text tracking-tight truncate">
                          {selectedCandidate.name}
                        </h2>
                        <SourceBadge source={selectedCandidate.source} variant="badge" />
                      </div>
                      <p className="text-[12.5px] text-text-muted mt-0.5 truncate">
                        <span className="font-semibold text-text">{selectedCandidate.currentRole}</span>
                        <span className="text-text-subtle/80 mx-1">at</span>
                        <span className="inline-flex items-center gap-1 font-medium text-text"><CompanyLogo company={selectedCandidate.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" /><span>{selectedCandidate.currentCompany}</span></span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Requisition Pill */}
                {selectedOpening && (
                  <div className="mt-3.5 flex items-center gap-2 flex-wrap text-[11.5px] text-text-muted">
                    <span className="inline-flex items-center gap-1 bg-surface-2 border border-border/70 px-2.5 py-1 rounded-[5px] text-text font-medium">
                      <Briefcase className="h-3 w-3 text-text-subtle shrink-0" />
                      <span>Requisition: <strong>{selectedOpening.title}</strong></span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-surface-2 border border-border/70 px-2.5 py-1 rounded-[5px] text-text font-medium">
                      <Building2 className="h-3 w-3 text-text-subtle shrink-0" />
                      <span>{selectedOpening.department}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Scrollable Body Content */}
              <div className="flex-1 space-y-4.5 p-6 overflow-y-auto">
                {/* 4 Quick Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="border border-border/70 bg-surface-2/40 rounded-[8px] p-2.5 transition-colors">
                    <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                      Experience
                    </span>
                    <p className="text-text font-bold font-mono text-[13px] mt-0.5">
                      {selectedCandidate.experienceYears} Years
                    </p>
                  </div>

                  <div className="border border-border/70 bg-surface-2/40 rounded-[8px] p-2.5 transition-colors">
                    <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                      Expected CTC
                    </span>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[13px] mt-0.5">
                      {formatCtc(selectedCandidate.expectedCtc)}
                    </p>
                  </div>

                  <div className="border border-border/70 bg-surface-2/40 rounded-[8px] p-2.5 transition-colors">
                    <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                      Notice Period
                    </span>
                    <p className="text-text font-bold text-[13px] mt-0.5">
                      {selectedCandidate.noticePeriod}
                    </p>
                  </div>

                  <div className="border border-border/70 bg-surface-2/40 rounded-[8px] p-2.5 transition-colors">
                    <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                      Contact Phone
                    </span>
                    <p className="text-text font-mono text-[12.5px] font-semibold mt-0.5 truncate">
                      {selectedCandidate.phone}
                    </p>
                  </div>
                </div>

                {/* AI Candidate Assessment Box */}
                {selectedAiMatch && (
                  <div className="border border-accent/25 bg-accent/5 rounded-[8px] p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-semibold text-text text-[12.5px]">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        <span>AI Candidate Assessment</span>
                        {selectedOpening && (
                          <span className="text-text-subtle text-[11.5px] font-normal">
                            for {selectedOpening.title}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full border',
                          selectedAiMatch.tier === 'Strong Fit'
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : selectedAiMatch.tier === 'Good Match'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-2 border-border text-text-muted'
                        )}
                      >
                        {selectedAiMatch.score}% Match • {selectedAiMatch.tier}
                      </span>
                    </div>

                    <p className="text-text-muted text-[12px] leading-relaxed">
                      {selectedAiMatch.summary}
                    </p>

                    {selectedAiMatch.matchedMustSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-text-subtle text-[11px] font-medium">Screened Skills:</span>
                        {selectedAiMatch.matchedMustSkills.map((skill: string) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-[5px] border border-border/70 bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text"
                          >
                            <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[3]" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* HR Screening Notes */}
                <div className="space-y-1.5">
                  <h3 className="text-text flex items-center gap-1.5 text-[12.5px] font-semibold">
                    <FileText className="text-accent h-3.5 w-3.5 shrink-0" />
                    <span>HR Screening Notes & Initial Impression</span>
                  </h3>
                  <div className="border border-border/70 bg-surface-2/30 text-text rounded-[8px] p-3.5 text-[12.5px] leading-relaxed">
                    {selectedCandidate.hrNotes ??
                      'Candidate exhibits deep technical comprehension, strong credentials, and verified compensation expectations.'}
                  </div>
                </div>

                {/* Manager Feedback Input */}
                <div className="space-y-1.5">
                  <label className="text-text text-[12.5px] font-semibold">
                    Manager Review Feedback (Optional)
                  </label>
                  <Textarea
                    rows={3}
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    placeholder="Add specific topics, interview panel recommendations, or evaluation criteria for the technical round..."
                    className="rounded-[8px] text-[12.5px] bg-surface-2/40 border-border/70 focus:bg-surface-1"
                  />
                </div>
              </div>

              {/* 4. Sticky Bottom Action Footer (Shortlist and Reject/Cancel) */}
              <div className="sticky bottom-0 border-t border-border/70 bg-surface-1/95 p-4 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3">
                {/* Shortlist Button */}
                <Button
                  variant="primary"
                  onClick={() => handleDecision('Shortlisted')}
                  loading={pendingDecision === 'Shortlisted'}
                  disabled={recordDecision.isPending}
                  className="h-10 w-full cursor-pointer gap-2 rounded-[8px] text-[13px] font-semibold shadow-xs sm:flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    {pendingDecision === 'Shortlisted'
                      ? 'Shortlisting...'
                      : 'Shortlist for Technical Interview'}
                  </span>
                </Button>

                {/* Reject / Cancel Button */}
                <Button
                  variant="outline"
                  onClick={() => handleDecision('Rejected')}
                  loading={pendingDecision === 'Rejected'}
                  disabled={recordDecision.isPending}
                  className="h-10 w-full cursor-pointer gap-2 rounded-[8px] text-[13px] font-semibold border-border/80 hover:border-danger/40 hover:text-danger hover:bg-danger/10 sm:flex-1"
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>{pendingDecision === 'Rejected' ? 'Rejecting...' : 'Reject Candidate'}</span>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
