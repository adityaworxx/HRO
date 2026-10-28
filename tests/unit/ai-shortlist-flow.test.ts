import { describe, it, expect } from 'vitest';
import { mockApi } from '@/services/mock/mockApi';
import { matchCandidateToOpening } from '@/lib/ai-matcher';
import type { Opening, Candidate } from '@/types/entities';

describe('AI Shortlist Manager Routing Flow', () => {
  const sampleOpening: Opening = {
    id: 'op-ai-test',
    title: 'Staff Fullstack Engineer',
    department: 'Engineering',
    location: 'Bangalore (Hybrid)',
    employmentType: 'Full-time',
    headcount: 1,
    urgency: 'Normal',
    targetStartDate: new Date().toISOString(),
    experienceRange: { min: 4, max: 8 },
    budgetRange: { min: 2500000, max: 4500000 },
    mustHaveSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    niceToHaveSkills: ['GraphQL', 'Docker'],
    status: 'Open',
    managerId: 'u1',
    description: 'Looking for a senior fullstack engineer.',
    createdAt: new Date().toISOString(),
  };

  const sampleCandidate: Candidate = {
    id: 'cand-ai-test',
    openingId: 'op-ai-test',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@example.com',
    currentRole: 'Senior Software Engineer',
    currentCompany: 'Swiggy',
    experienceYears: 6,
    expectedCtc: 3200000,
    noticePeriod: '30 Days',
    phone: '+91 98765 43210',
    hrNotes: 'Skills: React, TypeScript, Node.js, PostgreSQL, Docker.',
    source: 'LinkedIn',
    stage: 'Sourced',
    managerDecision: 'Pending',
    interviewOutcome: 'Pending',
  };

  it('correctly scores candidate and prepares AI screening notes', () => {
    const match = matchCandidateToOpening(sampleCandidate, sampleOpening);
    expect(match.score).toBeGreaterThanOrEqual(80);
    expect(match.tier).toBe('Strong Fit');
    expect(match.matchedMustSkills).toContain('React');
    expect(match.matchedMustSkills).toContain('TypeScript');
  });

  it('keeps candidate in Shared with Manager with managerDecision Pending so manager can review', async () => {
    const match = matchCandidateToOpening(sampleCandidate, sampleOpening);
    const notes = `[AI Match: ${match.score}% • ${match.tier}] ${match.summary}`;

    // Add candidate to mock store
    const created = await mockApi.candidates.create(sampleCandidate);

    // AI shortlists candidate for opening
    const assigned = await mockApi.candidates.assignToOpening(
      created.id,
      sampleOpening.id,
      'Shared with Manager',
      notes
    );

    // Verify candidate state
    expect(assigned.openingId).toBe(sampleOpening.id);
    expect(assigned.stage).toBe('Shared with Manager');
    expect(assigned.managerDecision).toBe('Pending');
    expect(assigned.hrNotes).toContain('[AI Match:');

    // Verify manager review queue filter
    const allCandidates = await mockApi.candidates.list();
    const managerQueue = allCandidates.filter(
      (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
    );

    const foundInQueue = managerQueue.find((c) => c.id === created.id);
    expect(foundInQueue).toBeDefined();
    expect(foundInQueue?.name).toBe('Vikram Malhotra');

    // Now Hiring Manager reviews and makes decision
    const reviewed = await mockApi.candidates.recordDecision(
      created.id,
      'Shortlisted',
      'Strong technical match from Swiggy.'
    );
    expect(reviewed.managerDecision).toBe('Shortlisted');

    // Once manager decides, candidate leaves the pending review queue
    const queueAfterDecision = (await mockApi.candidates.list()).filter(
      (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
    );
    expect(queueAfterDecision.find((c) => c.id === created.id)).toBeUndefined();
  });
});
