import { faker } from '@faker-js/faker';
import type { Opening, Candidate, OnboardingItem, ActivityEvent, User } from '@/types/entities';
import {
  OPENING_STATUSES,
  CANDIDATE_STAGES,
  CANDIDATE_SOURCES,
  URGENCY_LEVELS,
} from '@/lib/constants';
import { INITIAL_USERS } from '@/fixtures/users';

// Set deterministic seed
faker.seed(42);

const INDIAN_COMPANIES = [
  'Infosys',
  'Tata Consultancy Services',
  'Wipro',
  'Razorpay',
  'Swiggy',
  'Zomato',
  'Flipkart',
  'CRED',
  'Zerodha',
  'PhonePe',
];

const JOB_ROLES = [
  'Senior Backend Engineer',
  'Frontend Tech Lead',
  'Fullstack Developer',
  'Product Designer',
  'DevOps Platform Engineer',
  'QA Automation Lead',
  'Mobile App Engineer (iOS/Android)',
  'Data Analyst',
];

export function generateSeedData(): {
  users: User[];
  openings: Opening[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  activities: ActivityEvent[];
} {
  const users = [...INITIAL_USERS];

  // 8 Openings, exactly 1 for each status
  const openings: Opening[] = OPENING_STATUSES.map((status, index) => {
    const roleTitle = JOB_ROLES[index] || 'Software Engineer';
    const manager = users[index % users.length] || users[0]!;

    return {
      id: faker.string.uuid(),
      title: roleTitle,
      department: manager.department,
      location: index % 2 === 0 ? 'Bengaluru, India' : 'Gurugram, India',
      employmentType: 'Full-time',
      headcount: faker.number.int({ min: 1, max: 3 }),
      experienceRange: { min: 3, max: 7 },
      budgetRange: { min: 15, max: 25 },
      mustHaveSkills: ['React', 'TypeScript', 'Node.js'],
      niceToHaveSkills: ['Docker', 'Next.js', 'PostgreSQL'],
      description: `Seeking an experienced ${roleTitle} to scale our core platform infrastructure.`,
      urgency: URGENCY_LEVELS[index % URGENCY_LEVELS.length] || 'Normal',
      targetStartDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status,
      managerId: manager.id,
      createdAt: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
    };
  });

  // 30 Candidates
  const candidates: Candidate[] = [];
  const candidateNames = [
    'Aarav Sharma',
    'Aditi Verma',
    'Rohan Mehta',
    'Neha Iyer',
    'Karan Patel',
    'Sneha Kulkarni',
    'Vikram Rao',
    'Pooja Nair',
    'Devendra Singh',
    'Ritu Saxena',
    'Gaurav Joshi',
    'Kavita Reddy',
    'Amit Choudhury',
    'Meera Bhatt',
    'Anish Kapoor',
    'Tanvi Deshmukh',
    'Siddharth Jain',
    'Deepika Pillai',
    'Manoj Tiwari',
    'Shreya Sengupta',
    'Harsh Vardhan',
    'Divya Menon',
    'Kunal Ghosh',
    'Preeti Agarwal',
    'Rajesh Nambiar',
    'Swati Dubey',
    'Nikhil Anand',
    'Rashmi Hegde',
    'Abhishek Sinha',
    'Pallavi Sen',
  ];

  for (let i = 0; i < 30; i++) {
    const opening = openings[i % openings.length]!;
    const stage = CANDIDATE_STAGES[i % CANDIDATE_STAGES.length]!;
    const source = CANDIDATE_SOURCES[i % CANDIDATE_SOURCES.length]!;
    const name = candidateNames[i] || `Candidate ${i + 1}`;

    candidates.push({
      id: faker.string.uuid(),
      openingId: opening.id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+91 98${faker.string.numeric(8)}`,
      currentCompany: INDIAN_COMPANIES[i % INDIAN_COMPANIES.length] || 'Tech Corp',
      currentRole: 'Senior Software Engineer',
      experienceYears: faker.number.int({ min: 3, max: 10 }),
      noticePeriod: '30 Days',
      expectedCtc: faker.number.int({ min: 18, max: 28 }),
      source,
      profileUrl: 'https://linkedin.com/in/example',
      resumeFileName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      hrNotes: 'Strong communication skills and deep domain proficiency.',
      stage,
      managerDecision:
        stage === 'Selected' ? 'Shortlisted' : stage === 'Rejected' ? 'Rejected' : 'Pending',
      managerComment:
        stage === 'Rejected' ? 'Experience in distributed systems did not meet bar.' : undefined,
      interviewDate:
        stage === 'Interview' ? new Date(Date.now() + 2 * 86400000).toISOString() : undefined,
      interviewMode: stage === 'Interview' ? 'Video' : undefined,
      interviewOutcome: stage === 'Selected' ? 'Selected' : 'Pending',
    });
  }

  // Onboarding items for 2 joiners (Joined or Selected candidates)
  const joinerCandidates = candidates
    .filter((c) => c.stage === 'Joined' || c.stage === 'Selected')
    .slice(0, 2);
  const onboarding: OnboardingItem[] = [];

  const defaultTasks = [
    {
      title: 'Collect documents (PAN, Aadhaar, Degree)',
      owner: 'HR' as const,
      phase: 'Before joining' as const,
      daysOffset: -5,
    },
    {
      title: 'Create email and system accounts',
      owner: 'HR' as const,
      phase: 'Before joining' as const,
      daysOffset: -3,
    },
    {
      title: 'Arrange laptop and desk setup',
      owner: 'HR' as const,
      phase: 'Before joining' as const,
      daysOffset: -2,
    },
    {
      title: 'Prepare first-week plan',
      owner: 'Manager' as const,
      phase: 'Before joining' as const,
      daysOffset: -1,
    },
    {
      title: 'Welcome and orientation',
      owner: 'HR' as const,
      phase: 'Day 1' as const,
      daysOffset: 0,
    },
    {
      title: 'Introduce team and assign a buddy',
      owner: 'Manager' as const,
      phase: 'Day 1' as const,
      daysOffset: 0,
    },
    {
      title: '30-day check-in',
      owner: 'Manager' as const,
      phase: 'First 30 days' as const,
      daysOffset: 30,
    },
  ];

  joinerCandidates.forEach((candidate) => {
    defaultTasks.forEach((task, index) => {
      onboarding.push({
        id: faker.string.uuid(),
        candidateId: candidate.id,
        title: task.title,
        owner: task.owner,
        phase: task.phase,
        dueDate: new Date(Date.now() + task.daysOffset * 86400000).toISOString(),
        done: index < 3,
        status: index < 3 ? 'Done' : 'Pending',
      });
    });
  });

  // 40 Activity Events
  const activities: ActivityEvent[] = [];
  for (let i = 0; i < 40; i++) {
    const candidate = candidates[i % candidates.length]!;
    activities.push({
      id: faker.string.uuid(),
      entityType: 'candidate',
      entityId: candidate.id,
      actor: i % 2 === 0 ? 'Priya Sharma (HR)' : 'Arjun Kapoor (Manager)',
      message: `Updated candidate ${candidate.name} status to ${candidate.stage}.`,
      timestamp: new Date(Date.now() - (i + 1) * 3600000 * 4).toISOString(),
    });
  }

  return { users, openings, candidates, onboarding, activities };
}
