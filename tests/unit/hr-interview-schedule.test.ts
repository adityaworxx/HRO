import { describe, it, expect } from 'vitest';
import { mockApi } from '@/services/mock/mockApi';
import type { Opening, Candidate } from '@/types/entities';

describe('HR Interview Scheduling & Manager Interview Flow', () => {
  const sampleOpening: Opening = {
    id: 'op-hr-sched-test',
    title: 'Lead Frontend Engineer',
    department: 'Engineering',
    location: 'Bangalore (Hybrid)',
    employmentType: 'Full-time',
    headcount: 1,
    urgency: 'Normal',
    targetStartDate: new Date().toISOString(),
    experienceRange: { min: 5, max: 9 },
    budgetRange: { min: 3000000, max: 5000000 },
    mustHaveSkills: ['React', 'Next.js', 'TypeScript'],
    niceToHaveSkills: ['Tailwind CSS'],
    status: 'Open',
    managerId: 'u1',
    description: 'Looking for a lead frontend engineer.',
    createdAt: new Date().toISOString(),
  };

  const sampleCandidate: Candidate = {
    id: 'cand-hr-sched-test',
    openingId: 'op-hr-sched-test',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@example.com',
    currentRole: 'Senior React Developer',
    currentCompany: 'Flipkart',
    experienceYears: 6,
    expectedCtc: 3500000,
    noticePeriod: '15 Days',
    phone: '+91 99887 76655',
    hrNotes: 'Strong frontend credentials.',
    source: 'LinkedIn',
    stage: 'Shared with Manager',
    managerDecision: 'Pending',
    interviewOutcome: 'Pending',
  };

  it('handles Manager Shortlist -> HR Schedule Slot -> Manager Conduct & Record Outcome', async () => {
    // 1. Create candidate in mock store
    const candidate = await mockApi.candidates.create(sampleCandidate);
    expect(candidate.stage).toBe('Shared with Manager');
    expect(candidate.managerDecision).toBe('Pending');

    // 2. Manager reviews candidate in /shortlist and approves (Shortlist)
    const shortlisted = await mockApi.candidates.recordDecision(
      candidate.id,
      'Shortlisted',
      'Strong Flipkart experience, approve for technical round.'
    );

    // Candidate should now be in Interview stage, awaiting HR scheduling
    expect(shortlisted.managerDecision).toBe('Shortlisted');
    expect(shortlisted.stage).toBe('Interview');
    expect(shortlisted.interviewDate).toBeUndefined();

    // Verify HR received notification to schedule interview
    const hrNotifs = await mockApi.notifications.list('hr');
    const schedNotif = hrNotifs.find((n) => n.title.includes('Candidate Shortlisted'));
    expect(schedNotif).toBeDefined();
    expect(schedNotif?.message).toContain('Ananya Deshmukh');

    // 3. HR contacts candidate via phone/email and schedules interview
    const interviewSlot = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days later
    const scheduled = await mockApi.candidates.scheduleInterview(
      candidate.id,
      interviewSlot,
      'Video',
      'Candidate confirmed 2:00 PM slot. Google Meet: meet.google.com/xyz-123'
    );

    // Verify interview is properly scheduled
    expect(scheduled.stage).toBe('Interview');
    expect(scheduled.interviewDate).toBe(interviewSlot);
    expect(scheduled.interviewMode).toBe('Video');
    expect(scheduled.interviewNote).toContain('Google Meet');

    // Verify Manager received notification about the scheduled interview
    const mgrNotifs = await mockApi.notifications.list('manager');
    const mgrNotif = mgrNotifs.find((n) => n.title.includes('Interview Scheduled by HR'));
    expect(mgrNotif).toBeDefined();
    expect(mgrNotif?.message).toContain('Ananya Deshmukh');

    // 4. Manager conducts the interview and records the outcome
    const finalOutcome = await mockApi.candidates.recordInterviewOutcome(
      candidate.id,
      'Selected',
      'Excellent architecture discussion, recommended for offer.'
    );

    expect(finalOutcome.interviewOutcome).toBe('Selected');
    expect(finalOutcome.stage).toBe('Selected');
  });
});
