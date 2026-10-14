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
  'Razorpay',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'CRED',
  'Zerodha',
  'PhonePe',
  'Atlassian',
  'Microsoft',
  'Google',
];

interface RoleTemplate {
  title: string;
  department: string;
  managerIdx: number;
  expMin: number;
  expMax: number;
  budgetMin: number;
  budgetMax: number;
  mustSkills: string[];
  niceSkills: string[];
  description: string;
  candidateRole: string;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    managerIdx: 0, // Arjun Kapoor
    expMin: 3,
    expMax: 7,
    budgetMin: 28,
    budgetMax: 42,
    mustSkills: ['Go', 'PostgreSQL', 'Kafka', 'Redis', 'Distributed Systems'],
    niceSkills: ['Docker', 'Kubernetes', 'gRPC'],
    description: 'Scale our core platform infrastructure, architect high-concurrency transactional pipelines, and maintain fault-tolerant microservices.',
    candidateRole: 'Senior Backend Developer',
  },
  {
    title: 'Frontend Tech Lead',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 5,
    expMax: 9,
    budgetMin: 32,
    budgetMax: 48,
    mustSkills: ['React', 'TypeScript', 'Next.js', 'Architecture', 'Web Performance'],
    niceSkills: ['Tailwind CSS', 'Radix UI', 'Playwright'],
    description: 'Establish enterprise web architecture, lead frontend engineering standards, and build accessible, responsive user interfaces.',
    candidateRole: 'Staff Frontend Engineer',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    managerIdx: 3, // Ananya Deshmukh
    expMin: 3,
    expMax: 6,
    budgetMin: 18,
    budgetMax: 28,
    mustSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    niceSkills: ['Micro-interactions', 'Accessibility', 'Framer'],
    description: 'Design intuitive, enterprise-grade workflows and establish unified design tokens across our entire application suite.',
    candidateRole: 'Senior Product Designer',
  },
  {
    title: 'DevOps Platform Engineer',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 4,
    expMax: 8,
    budgetMin: 24,
    budgetMax: 36,
    mustSkills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
    niceSkills: ['ArgoCD', 'Helm', 'Golang'],
    description: 'Manage cloud platform infrastructure, automate deployment topologies, and maintain 99.99% service level objectives.',
    candidateRole: 'Senior Site Reliability Engineer',
  },
  {
    title: 'Data Analyst',
    department: 'Data & Analytics',
    managerIdx: 4, // Vikram Malhotra
    expMin: 2,
    expMax: 5,
    budgetMin: 14,
    budgetMax: 22,
    mustSkills: ['SQL', 'Python', 'PowerBI', 'Data Modeling', 'Cohort Analysis'],
    niceSkills: ['dbt', 'Snowflake', 'Airflow'],
    description: 'Drive actionable business analytics, synthesize behavioral cohort funnels, and build executive reporting suites.',
    candidateRole: 'Senior Business Intelligence Analyst',
  },
  {
    title: 'Product Manager - Core',
    department: 'Product',
    managerIdx: 2, // Rohit Verma
    expMin: 4,
    expMax: 8,
    budgetMin: 26,
    budgetMax: 40,
    mustSkills: ['Product Strategy', 'Roadmapping', 'Agile', 'User Discovery', 'Metrics'],
    niceSkills: ['SQL', 'Mixpanel', 'B2B SaaS'],
    description: 'Own end-to-end roadmap for core products, define high-impact feature specifications, and partner with design and engineering.',
    candidateRole: 'Lead Product Manager',
  },
  {
    title: 'QA Automation Lead',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 4,
    expMax: 7,
    budgetMin: 18,
    budgetMax: 28,
    mustSkills: ['Playwright', 'TypeScript', 'Jest', 'API Testing', 'CI Integration'],
    niceSkills: ['Cypress', 'Docker', 'K6'],
    description: 'Lead automated quality assurance, establish robust regression testing pipelines, and accelerate release confidence.',
    candidateRole: 'Lead QA Engineer',
  },
  {
    title: 'Staff AI Infrastructure Engineer',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 6,
    expMax: 12,
    budgetMin: 45,
    budgetMax: 70,
    mustSkills: ['Python', 'Kubernetes', 'PyTorch', 'Distributed Systems'],
    niceSkills: ['vLLM', 'Triton', 'CUDA'],
    description: 'Design distributed inference clusters, optimize LLM serving latency, and scale high-throughput AI infrastructure.',
    candidateRole: 'Principal AI Infrastructure Engineer',
  },
];

export function generateSeedData(): {
  users: User[];
  openings: Opening[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  activities: ActivityEvent[];
} {
  const users = [...INITIAL_USERS];

  const openings: Opening[] = OPENING_STATUSES.map((status, index) => {
    const tmpl = ROLE_TEMPLATES[index % ROLE_TEMPLATES.length]!;
    const manager = users[tmpl.managerIdx] || users[0]!;

    return {
      id: `10000000-0000-0000-0000-00000000000${index + 1}`,
      title: tmpl.title,
      department: tmpl.department,
      location: index % 2 === 0 ? 'Bengaluru, India (Hybrid)' : 'Gurugram, India',
      employmentType: 'Full-time',
      headcount: index === 0 || index === 4 || index === 7 ? 2 : 1,
      experienceRange: { min: tmpl.expMin, max: tmpl.expMax },
      budgetRange: { min: tmpl.budgetMin, max: tmpl.budgetMax },
      mustHaveSkills: tmpl.mustSkills,
      niceToHaveSkills: tmpl.niceSkills,
      description: tmpl.description,
      urgency: URGENCY_LEVELS[index % URGENCY_LEVELS.length] || 'Normal',
      targetStartDate: new Date(Date.now() + (index + 20) * 86400000).toISOString(),
      status,
      managerId: manager.id,
      createdAt: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
    };
  });

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

  const candidates: Candidate[] = [];

  for (let i = 0; i < 30; i++) {
    const opening = openings[i % openings.length]!;
    const tmpl = ROLE_TEMPLATES[i % ROLE_TEMPLATES.length]!;
    const stage = CANDIDATE_STAGES[i % CANDIDATE_STAGES.length]!;
    const source = CANDIDATE_SOURCES[i % CANDIDATE_SOURCES.length]!;
    const name = candidateNames[i] || `Candidate ${i + 1}`;

    candidates.push({
      id: `20000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      openingId: opening.id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+91 98${faker.string.numeric(8)}`,
      currentCompany: INDIAN_COMPANIES[i % INDIAN_COMPANIES.length] || 'Razorpay',
      currentRole: tmpl.candidateRole,
      experienceYears: Math.min(tmpl.expMax, Math.max(tmpl.expMin, 3 + (i % 6))),
      noticePeriod: i % 4 === 0 ? 'Immediate' : i % 4 === 1 ? '15 Days' : i % 4 === 2 ? '30 Days' : '60 Days',
      expectedCtc: tmpl.budgetMin + (i % (tmpl.budgetMax - tmpl.budgetMin + 1)),
      source,
      profileUrl: 'https://linkedin.com/in/example',
      resumeFileName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      hrNotes: `Strong candidate with background in ${opening.mustHaveSkills.slice(0, 2).join(', ')}.`,
      stage,
      managerDecision:
        stage === 'Selected' || stage === 'Offer Sent' || stage === 'Joined'
          ? 'Shortlisted'
          : stage === 'Rejected'
            ? 'Rejected'
            : 'Pending',
      managerComment:
        stage === 'Rejected'
          ? 'Experience did not meet current technical requirements.'
          : stage === 'Selected'
            ? 'Strong technical evaluation and cultural alignment.'
            : undefined,
      interviewDate:
        stage === 'Interview' ? new Date(Date.now() + (1 + (i % 3)) * 86400000).toISOString() : undefined,
      interviewMode: stage === 'Interview' ? 'Video' : undefined,
      interviewOutcome: stage === 'Selected' ? 'Selected' : 'Pending',
    });
  }

  // Joiners onboarding tasks
  const joinerCandidates = candidates.filter(
    (c) => c.stage === 'Joined' || c.stage === 'Selected' || c.stage === 'Offer Sent'
  ).slice(0, 4);

  const onboarding: OnboardingItem[] = [];

  const defaultTasks = [
    { title: 'Collect documents (PAN, Aadhaar, Degree)', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -5 },
    { title: 'Create email and system accounts', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -3 },
    { title: 'Arrange laptop and desk setup', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -2 },
    { title: 'Prepare first-week plan', owner: 'Manager' as const, phase: 'Before joining' as const, daysOffset: -1 },
    { title: 'Welcome and orientation', owner: 'HR' as const, phase: 'Day 1' as const, daysOffset: 0 },
    { title: 'Introduce team and assign a buddy', owner: 'Manager' as const, phase: 'Day 1' as const, daysOffset: 0 },
    { title: '30-day check-in', owner: 'Manager' as const, phase: 'First 30 days' as const, daysOffset: 30 },
  ];

  joinerCandidates.forEach((candidate, cIdx) => {
    defaultTasks.forEach((task, tIdx) => {
      const isDone = cIdx === 0 ? tIdx < 5 : cIdx === 1 ? tIdx < 3 : tIdx < 1;
      onboarding.push({
        id: `30000000-0000-0000-0000-${String(cIdx * 10 + tIdx + 1).padStart(12, '0')}`,
        candidateId: candidate.id,
        title: task.title,
        owner: task.owner,
        phase: task.phase,
        dueDate: new Date(Date.now() + task.daysOffset * 86400000).toISOString(),
        done: isDone,
        status: isDone ? 'Done' : 'Pending',
      });
    });
  });

  const activities: ActivityEvent[] = [];
  for (let i = 0; i < 40; i++) {
    const candidate = candidates[i % candidates.length]!;
    activities.push({
      id: `40000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      entityType: 'candidate',
      entityId: candidate.id,
      actor: i % 2 === 0 ? 'Priya Sharma (HR)' : 'Arjun Kapoor (Manager)',
      message: `Updated candidate ${candidate.name} stage to ${candidate.stage}.`,
      timestamp: new Date(Date.now() - (i + 1) * 3600000 * 3).toISOString(),
    });
  }

  return { users, openings, candidates, onboarding, activities };
}
