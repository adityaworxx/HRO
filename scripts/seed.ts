import { faker } from '@faker-js/faker';
import type { Opening, Candidate, OnboardingItem, ActivityEvent, User } from '@/types/entities';
import type { OpeningStatus, CandidateStage } from '@/lib/domain/status-transitions';
import { CANDIDATE_SOURCES, URGENCY_LEVELS } from '@/lib/constants';
import { INITIAL_USERS } from '@/fixtures/users';

// Deterministic seed for reproducible data
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
  'Amazon',
  'Uber',
  'Meesho',
  'InMobi',
  'Paytm',
  'MakeMyTrip',
  'Groww',
  'Urban Company',
  'Nykaa',
  'BrowserStack',
];

interface RoleTemplate {
  title: string;
  department: string;
  managerIdx: number; // index into INITIAL_USERS: 0=Arjun (Eng), 2=Rohit (Prod), 3=Ananya (Design), 4=Vikram (Data)
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
  // --- Engineering (Arjun Kapoor, idx 0) ---
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 3,
    expMax: 7,
    budgetMin: 28,
    budgetMax: 42,
    mustSkills: ['Go', 'PostgreSQL', 'Kafka', 'Redis', 'Distributed Systems'],
    niceSkills: ['Docker', 'Kubernetes', 'gRPC'],
    description:
      'Scale our core platform infrastructure, architect high-concurrency transactional pipelines, and maintain fault-tolerant microservices.',
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
    description:
      'Establish enterprise web architecture, lead frontend engineering standards, and build accessible, responsive user interfaces.',
    candidateRole: 'Staff Frontend Engineer',
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
    description:
      'Manage cloud platform infrastructure, automate deployment topologies, and maintain 99.99% service level objectives.',
    candidateRole: 'Senior Site Reliability Engineer',
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
    description:
      'Lead automated quality assurance, establish robust regression testing pipelines, and accelerate release confidence.',
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
    description:
      'Design distributed inference clusters, optimize LLM serving latency, and scale high-throughput AI infrastructure.',
    candidateRole: 'Principal AI Infrastructure Engineer',
  },
  {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 3,
    expMax: 6,
    budgetMin: 22,
    budgetMax: 35,
    mustSkills: ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
    niceSkills: ['GraphQL', 'Redis', 'Docker'],
    description:
      'Deliver end-to-end features spanning server actions, relational data persistence, and performant web interfaces.',
    candidateRole: 'Full Stack Developer',
  },
  {
    title: 'Mobile Lead Engineer (Android & iOS)',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 5,
    expMax: 8,
    budgetMin: 30,
    budgetMax: 45,
    mustSkills: ['React Native', 'Swift', 'Kotlin', 'Mobile Architecture', 'Offline Sync'],
    niceSkills: ['Fastlane', 'Firebase', 'App Store CI'],
    description:
      'Own enterprise mobile experiences, build native bridge modules, and ensure 60fps fluid UI execution.',
    candidateRole: 'Lead Mobile Developer',
  },
  {
    title: 'Cloud Security Architect',
    department: 'Engineering',
    managerIdx: 0,
    expMin: 6,
    expMax: 10,
    budgetMin: 38,
    budgetMax: 55,
    mustSkills: ['AWS Security', 'SOC2', 'Vault', 'IAM', 'Threat Modeling'],
    niceSkills: ['Zero Trust', 'Kubernetes Hardening', 'Audit Logs'],
    description:
      'Architect security guardrails, automate continuous vulnerability mitigation, and enforce rigorous RBAC standards.',
    candidateRole: 'Security Operations Architect',
  },

  // --- Product (Rohit Verma, idx 2) ---
  {
    title: 'Product Manager - Core Platform',
    department: 'Product',
    managerIdx: 2,
    expMin: 4,
    expMax: 8,
    budgetMin: 26,
    budgetMax: 40,
    mustSkills: ['Product Strategy', 'Roadmapping', 'Agile', 'User Discovery', 'Metrics'],
    niceSkills: ['SQL', 'Mixpanel', 'B2B SaaS'],
    description:
      'Own end-to-end roadmap for core products, define high-impact feature specifications, and partner with design and engineering.',
    candidateRole: 'Lead Product Manager',
  },
  {
    title: 'Senior Growth Product Manager',
    department: 'Product',
    managerIdx: 2,
    expMin: 5,
    expMax: 8,
    budgetMin: 28,
    budgetMax: 44,
    mustSkills: ['Growth Loops', 'A/B Testing', 'Funnel Analytics', 'Onboarding Optimization'],
    niceSkills: ['Amplitude', 'SQL', 'Conversion Rate Optimization'],
    description:
      'Accelerate acquisition and self-serve adoption velocity through data-backed behavioral experiments and activation journeys.',
    candidateRole: 'Senior Growth Manager',
  },
  {
    title: 'Technical Product Manager - Developer Platform',
    department: 'Product',
    managerIdx: 2,
    expMin: 4,
    expMax: 7,
    budgetMin: 25,
    budgetMax: 38,
    mustSkills: ['API Product Management', 'Developer Experience', 'Swagger', 'Microservices'],
    niceSkills: ['Webhooks', 'Partner Integrations', 'Technical Docs'],
    description:
      'Shape the developer platform, design robust external API interfaces, and champion seamless partner ecosystem integrations.',
    candidateRole: 'Technical PM',
  },
  {
    title: 'Associate Product Manager',
    department: 'Product',
    managerIdx: 2,
    expMin: 1,
    expMax: 3,
    budgetMin: 14,
    budgetMax: 20,
    mustSkills: ['Feature Specs', 'User Research', 'Sprint Planning', 'PRD Authoring'],
    niceSkills: ['JIRA', 'Figma', 'Basic SQL'],
    description:
      'Collaborate with engineering squads to execute tactical product milestones, synthesize user feedback, and measure feature adoption.',
    candidateRole: 'Product Associate',
  },

  // --- Design (Ananya Deshmukh, idx 3) ---
  {
    title: 'Product Designer',
    department: 'Design',
    managerIdx: 3,
    expMin: 3,
    expMax: 6,
    budgetMin: 18,
    budgetMax: 28,
    mustSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    niceSkills: ['Micro-interactions', 'Accessibility', 'Framer'],
    description:
      'Design intuitive, enterprise-grade workflows and establish unified design tokens across our entire application suite.',
    candidateRole: 'Senior Product Designer',
  },
  {
    title: 'Design System Architect',
    department: 'Design',
    managerIdx: 3,
    expMin: 5,
    expMax: 9,
    budgetMin: 26,
    budgetMax: 38,
    mustSkills: [
      'Design Tokens',
      'Figma Variants',
      'Accessibility (WCAG 2.1 AA)',
      'Component Specs',
    ],
    niceSkills: ['Storybook', 'CSS Variables', 'Motion Design'],
    description:
      'Architect foundational design systems, standardize token semantics across web and mobile platforms, and drive cross-org consistency.',
    candidateRole: 'Lead Design Systems Specialist',
  },
  {
    title: 'Senior UX Researcher',
    department: 'Design',
    managerIdx: 3,
    expMin: 4,
    expMax: 7,
    budgetMin: 20,
    budgetMax: 32,
    mustSkills: [
      'Usability Testing',
      'Contextual Inquiries',
      'Survey Design',
      'User Journey Mapping',
    ],
    niceSkills: ['Mixed Methods', 'Persona Development', 'Dovetail'],
    description:
      'Uncover qualitative insights, conduct customer interviews, and guide product direction through validated user behaviors.',
    candidateRole: 'Staff UX Researcher',
  },
  {
    title: 'Visual & Motion Designer',
    department: 'Design',
    managerIdx: 3,
    expMin: 3,
    expMax: 6,
    budgetMin: 16,
    budgetMax: 26,
    mustSkills: ['After Effects', 'Lottie', 'Brand Guidelines', 'Micro-animations'],
    niceSkills: ['3D Illustration', 'Spline', 'Figma Animation'],
    description:
      'Craft tactile animations, interactive transitions, and polished brand collateral that give products a refined, fluid tactile feel.',
    candidateRole: 'Motion Designer',
  },

  // --- Data & Analytics (Vikram Malhotra, idx 4) ---
  {
    title: 'Data Analyst',
    department: 'Data & Analytics',
    managerIdx: 4,
    expMin: 2,
    expMax: 5,
    budgetMin: 14,
    budgetMax: 22,
    mustSkills: ['SQL', 'Python', 'PowerBI', 'Data Modeling', 'Cohort Analysis'],
    niceSkills: ['dbt', 'Snowflake', 'Airflow'],
    description:
      'Drive actionable business analytics, synthesize behavioral cohort funnels, and build executive reporting suites.',
    candidateRole: 'Senior Business Intelligence Analyst',
  },
  {
    title: 'Senior Analytics Engineer',
    department: 'Data & Analytics',
    managerIdx: 4,
    expMin: 4,
    expMax: 8,
    budgetMin: 24,
    budgetMax: 38,
    mustSkills: ['dbt', 'Snowflake', 'BigQuery', 'SQL Optimization', 'Data Warehousing'],
    niceSkills: ['Airflow', 'Fivetran', 'Data Quality Testing'],
    description:
      'Build robust dimensional data marts, manage automated transform jobs, and curate single sources of analytical truth.',
    candidateRole: 'Lead Analytics Engineer',
  },
  {
    title: 'Machine Learning Scientist',
    department: 'Data & Analytics',
    managerIdx: 4,
    expMin: 4,
    expMax: 9,
    budgetMin: 32,
    budgetMax: 50,
    mustSkills: ['Python', 'Scikit-Learn', 'Feature Engineering', 'Predictive Modeling', 'MLOps'],
    niceSkills: ['XGBoost', 'MLflow', 'Spark ML'],
    description:
      'Develop recommendation and classification models, deploy inference endpoints, and measure predictive uplift against production metrics.',
    candidateRole: 'Data Scientist II',
  },
  {
    title: 'Business Operations Analyst',
    department: 'Data & Analytics',
    managerIdx: 4,
    expMin: 2,
    expMax: 5,
    budgetMin: 15,
    budgetMax: 24,
    mustSkills: ['Advanced Excel', 'SQL', 'Financial Modeling', 'Process Analytics'],
    niceSkills: ['Tableau', 'Alteryx', 'Executive Presentations'],
    description:
      'Evaluate unit economics, dissect operational bottleneck telemetry, and partner with leadership on capacity allocation models.',
    candidateRole: 'BizOps Analyst',
  },

  // --- Human Resources (Priya Sharma, idx 1) ---
  {
    title: 'Technical Talent Acquisition Specialist',
    department: 'Human Resources',
    managerIdx: 1, // Priya Sharma (HR)
    expMin: 3,
    expMax: 6,
    budgetMin: 14,
    budgetMax: 22,
    mustSkills: [
      'Tech Sourcing',
      'Candidate Coordination',
      'LinkedIn Recruiter',
      'Offer Negotiation',
    ],
    niceSkills: ['ATS Administration', 'Campus Hiring', 'Employer Branding'],
    description:
      'Manage full-cycle tech hiring, coordinate candidate schedules, and deliver memorable candidate interview experiences.',
    candidateRole: 'Senior Technical Recruiter',
  },
  {
    title: 'People Operations & Culture Lead',
    department: 'Human Resources',
    managerIdx: 1,
    expMin: 4,
    expMax: 8,
    budgetMin: 18,
    budgetMax: 28,
    mustSkills: [
      'HRIS Management',
      'Onboarding Automation',
      'Employee Engagement',
      'Payroll & Compliance',
    ],
    niceSkills: ['Performance Cycles', 'Labor Law', 'Culture Programs'],
    description:
      'Streamline joiner onboarding workflows, manage employee operations, and foster an inclusive, high-performance team culture.',
    candidateRole: 'People Operations Manager',
  },

  // --- Operations (Vikram Malhotra / Arjun Kapoor) ---
  {
    title: 'Operations Program Manager',
    department: 'Operations',
    managerIdx: 0,
    expMin: 4,
    expMax: 7,
    budgetMin: 18,
    budgetMax: 30,
    mustSkills: [
      'SLA Optimization',
      'Cross-functional Execution',
      'Risk Mitigation',
      'Vendor Management',
    ],
    niceSkills: ['Six Sigma', 'Logistics Analytics', 'Process Automation'],
    description:
      'Oversee high-volume service delivery pipelines, eliminate procedural friction, and ensure strict SLA adherence.',
    candidateRole: 'Senior Operations Lead',
  },
  {
    title: 'Customer Experience Lead',
    department: 'Operations',
    managerIdx: 2,
    expMin: 3,
    expMax: 6,
    budgetMin: 14,
    budgetMax: 22,
    mustSkills: ['CSAT / NPS Frameworks', 'Escalation Workflows', 'Team Mentorship', 'Zendesk'],
    niceSkills: ['Customer Journey Mapping', 'Intercom', 'Voice of Customer'],
    description:
      'Champion client delight, resolve tier-3 operational escalations, and establish proactive issue-prevention mechanisms.',
    candidateRole: 'Customer Support Manager',
  },
];

const FIRST_NAMES = [
  'Aarav',
  'Aditi',
  'Rohan',
  'Neha',
  'Karan',
  'Sneha',
  'Vikram',
  'Pooja',
  'Devendra',
  'Ritu',
  'Gaurav',
  'Kavita',
  'Amit',
  'Meera',
  'Anish',
  'Tanvi',
  'Siddharth',
  'Deepika',
  'Manoj',
  'Shreya',
  'Harsh',
  'Divya',
  'Kunal',
  'Preeti',
  'Rajesh',
  'Swati',
  'Nikhil',
  'Rashmi',
  'Abhishek',
  'Pallavi',
  'Varun',
  'Ananya',
  'Rahul',
  'Ishita',
  'Tarun',
  'Radhika',
  'Aditya',
  'Payal',
  'Vishal',
  'Simran',
  'Akash',
  'Kriti',
  'Mayank',
  'Riya',
  'Pranav',
  'Sonam',
  'Chirag',
  'Shalini',
  'Saurabh',
  'Priyanka',
  'Sandeep',
  'Shruti',
  'Alok',
  'Barkha',
  'Mohit',
  'Aarti',
  'Deepak',
  'Chetna',
  'Naveen',
  'Garima',
  'Arjun',
  'Vandana',
  'Vivek',
  'Jyoti',
  'Sachin',
  'Sonia',
  'Prashant',
  'Nidhi',
  'Ashish',
  'Akanksha',
  'Sameer',
  'Shilpa',
  'Sanjay',
  'Monica',
  'Abhinav',
  'Komal',
  'Manish',
  'Ankita',
  'Chetan',
  'Richa',
  'Sumit',
  'Bhavna',
  'Tushar',
  'Parul',
  'Ayush',
  'Surbhi',
  'Yash',
  'Tanuja',
  'Rohit',
  'Sakshi',
  'Sunny',
  'Suman',
  'Aman',
  'Neetu',
  'Bhupesh',
  'Anamika',
  'Himanshu',
  'Anupriya',
  'Rishabh',
  'Natasha',
];

const LAST_NAMES = [
  'Sharma',
  'Verma',
  'Mehta',
  'Iyer',
  'Patel',
  'Kulkarni',
  'Rao',
  'Nair',
  'Singh',
  'Saxena',
  'Joshi',
  'Reddy',
  'Choudhury',
  'Bhatt',
  'Kapoor',
  'Deshmukh',
  'Jain',
  'Pillai',
  'Tiwari',
  'Sengupta',
  'Vardhan',
  'Menon',
  'Ghosh',
  'Agarwal',
  'Nambiar',
  'Dubey',
  'Anand',
  'Hegde',
  'Sinha',
  'Sen',
  'Mishra',
  'Bansal',
  'Gupta',
  'Malhotra',
  'Bhatia',
  'Trivedi',
  'Mukhopadhyay',
  'Das',
  'Banerjee',
  'Chakraborty',
  'Bose',
  'Dutta',
  'Roy',
  'Ganguly',
  'Somani',
  'Mittal',
  'Singhania',
  'Goenka',
  'Maheshwari',
  'Shrivastav',
];

export function generateSeedData(): {
  users: User[];
  openings: Opening[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  activities: ActivityEvent[];
} {
  const users = [...INITIAL_USERS];

  // 1. Generate 48 realistic Openings distributed across all departments and statuses
  const openingStatusesDistribution: OpeningStatus[] = [
    // 18 Open
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    'Open',
    // 10 Sourcing
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    'Sourcing',
    // 8 Interviewing
    'Interviewing',
    'Interviewing',
    'Interviewing',
    'Interviewing',
    'Interviewing',
    'Interviewing',
    'Interviewing',
    'Interviewing',
    // 4 Shortlist Shared
    'Shortlist Shared',
    'Shortlist Shared',
    'Shortlist Shared',
    'Shortlist Shared',
    // 3 Offer Stage
    'Offer Stage',
    'Offer Stage',
    'Offer Stage',
    // 3 Filled
    'Filled',
    'Filled',
    'Filled',
    // 2 On Hold
    'On Hold',
    'On Hold',
  ];

  const openings: Opening[] = openingStatusesDistribution.map((status, index) => {
    const tmpl = ROLE_TEMPLATES[index % ROLE_TEMPLATES.length]!;
    const manager = users[tmpl.managerIdx] || users[0]!;
    const loc =
      index % 3 === 0
        ? 'Bengaluru, India (Hybrid)'
        : index % 3 === 1
          ? 'Gurugram, India (Onsite)'
          : 'Mumbai, India (Remote)';

    return {
      id: `10000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      title: tmpl.title,
      department: tmpl.department,
      location: loc,
      employmentType: 'Full-time',
      headcount: index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
      experienceRange: { min: tmpl.expMin, max: tmpl.expMax },
      budgetRange: { min: tmpl.budgetMin, max: tmpl.budgetMax },
      mustHaveSkills: tmpl.mustSkills,
      niceToHaveSkills: tmpl.niceSkills,
      description: tmpl.description,
      urgency: URGENCY_LEVELS[index % URGENCY_LEVELS.length] || 'Normal',
      targetStartDate: new Date(Date.now() + (index + 15) * 86400000).toISOString(),
      status,
      managerId: manager.id,
      createdAt: new Date(Date.now() - (index + 3) * 86400000).toISOString(),
    };
  });

  // 2. Generate 300+ Candidates: 40-50 entries in EVERY single section!
  // Sourced: 45
  // Shared with Manager: 45
  // Interview: 48
  // Selected: 42
  // Offer Sent: 40
  // Joined: 42
  // Rejected: 40
  const stageTargets: Array<{ stage: CandidateStage; count: number }> = [
    { stage: 'Sourced', count: 45 },
    { stage: 'Shared with Manager', count: 45 },
    { stage: 'Interview', count: 48 },
    { stage: 'Selected', count: 42 },
    { stage: 'Offer Sent', count: 40 },
    { stage: 'Joined', count: 42 },
    { stage: 'Rejected', count: 40 },
  ];

  const candidates: Candidate[] = [];
  let candidateCounter = 1;

  stageTargets.forEach(({ stage, count }) => {
    for (let i = 0; i < count; i++) {
      const globalIdx = candidateCounter - 1;
      const opening = openings[globalIdx % openings.length]!;
      const tmpl = ROLE_TEMPLATES[globalIdx % ROLE_TEMPLATES.length]!;
      const source = CANDIDATE_SOURCES[globalIdx % CANDIDATE_SOURCES.length]!;

      const firstName = FIRST_NAMES[globalIdx % FIRST_NAMES.length]!;
      const lastName =
        LAST_NAMES[Math.floor(globalIdx / FIRST_NAMES.length + i) % LAST_NAMES.length]!;
      const name = `${firstName} ${lastName}`;

      // Notice period distribution
      const noticePeriod =
        i % 6 === 0
          ? 'Immediate'
          : i % 6 === 1
            ? '15 Days'
            : i % 6 === 2
              ? '30 Days'
              : i % 6 === 3
                ? '45 Days'
                : i % 6 === 4
                  ? '60 Days'
                  : '90 Days';

      // Manager decision logic based on stage
      let managerDecision: 'Pending' | 'Shortlisted' | 'Rejected' = 'Pending';
      let managerComment: string | undefined = undefined;

      if (stage === 'Shared with Manager') {
        managerDecision = 'Pending'; // Sits in Shortlist Review queue
      } else if (
        stage === 'Interview' ||
        stage === 'Selected' ||
        stage === 'Offer Sent' ||
        stage === 'Joined'
      ) {
        managerDecision = 'Shortlisted';
        managerComment =
          i % 3 === 0
            ? 'Strong technical foundation and domain experience.'
            : i % 3 === 1
              ? 'Impressive system design answers and hands-on coding agility.'
              : 'Great cultural fit, strong communication skills.';
      } else if (stage === 'Rejected') {
        managerDecision = 'Rejected';
        managerComment =
          i % 2 === 0
            ? 'Experience gap in required core framework requirements.'
            : 'Salary expectation misaligned with department budget ceiling.';
      }

      // Interview scheduling logic for 'Interview' stage (48 total: 26 scheduled, 22 awaiting HR scheduling)
      let interviewDate: string | undefined = undefined;
      let interviewMode: 'Video' | 'Phone' | 'Onsite' | undefined = undefined;
      let interviewOutcome: 'Pending' | 'Selected' | 'Rejected' | 'On Hold' = 'Pending';
      let interviewNote: string | undefined = undefined;

      if (stage === 'Interview') {
        const isScheduled = i < 26; // First 26 are confirmed slots, next 22 awaiting HR call
        if (isScheduled) {
          // Distributed over the next 1 to 7 days
          const daysAhead = 1 + (i % 7);
          const hour = 10 + (i % 8); // 10 AM to 5 PM
          const date = new Date(Date.now() + daysAhead * 86400000);
          date.setHours(hour, (i % 2) * 30, 0, 0);
          interviewDate = date.toISOString();

          interviewMode = i % 3 === 0 ? 'Video' : i % 3 === 1 ? 'Phone' : 'Onsite';
          interviewNote =
            i % 4 === 0
              ? 'Technical System Architecture round with hiring manager.'
              : i % 4 === 1
                ? 'Live pair-programming problem solving & concurrency challenge.'
                : i % 4 === 2
                  ? 'In-person technical deep dive at office campus.'
                  : 'Candidate confirmed via phone for morning slot.';

          // Some scheduled interviews have recorded outcomes
          if (i >= 18) {
            interviewOutcome = i % 3 === 0 ? 'Selected' : i % 3 === 1 ? 'Rejected' : 'On Hold';
          }
        } else {
          // Unscheduled candidates: ready for HR to call!
          interviewDate = undefined;
          interviewMode = undefined;
          interviewOutcome = 'Pending';
          interviewNote = undefined;
        }
      } else if (stage === 'Selected' || stage === 'Offer Sent' || stage === 'Joined') {
        interviewOutcome = 'Selected';
        interviewMode = 'Video';
        interviewDate = new Date(Date.now() - (i + 2) * 86400000).toISOString();
      } else if (stage === 'Rejected') {
        interviewOutcome = 'Rejected';
      }

      const candidate: Candidate = {
        id: `20000000-0000-0000-0000-${String(candidateCounter).padStart(12, '0')}`,
        openingId: opening.id,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${candidateCounter}@example.com`,
        phone: `+91 98${faker.string.numeric(8)}`,
        currentCompany: INDIAN_COMPANIES[globalIdx % INDIAN_COMPANIES.length] || 'Razorpay',
        currentRole: tmpl.candidateRole,
        experienceYears: Math.min(
          tmpl.expMax,
          Math.max(tmpl.expMin, tmpl.expMin + (i % (tmpl.expMax - tmpl.expMin + 1)))
        ),
        noticePeriod,
        expectedCtc: tmpl.budgetMin + (i % (tmpl.budgetMax - tmpl.budgetMin + 1)),
        source,
        profileUrl: 'https://linkedin.com/in/example',
        resumeFileName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
        hrNotes:
          i % 3 === 0
            ? `[AI Match: 95%] Outstanding fit for ${opening.title}. Strong expertise in ${opening.mustHaveSkills.slice(0, 3).join(', ')}.`
            : i % 3 === 1
              ? `Screened by talent acquisition team. Verified credentials in ${opening.mustHaveSkills.slice(0, 2).join(', ')}.`
              : `Fast-track candidate from ${INDIAN_COMPANIES[globalIdx % INDIAN_COMPANIES.length]}. Notice period is ${noticePeriod}.`,
        stage,
        managerDecision,
        managerComment,
        interviewDate,
        interviewMode,
        interviewOutcome,
        interviewNote,
      };

      candidates.push(candidate);
      candidateCounter++;
    }
  });

  // 3. Onboarding tasks for all Joined / Offer Sent candidates
  const onboardingCandidates = candidates
    .filter((c) => c.stage === 'Joined' || c.stage === 'Offer Sent' || c.stage === 'Selected')
    .slice(0, 15);

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
      title: 'Arrange laptop and workstation setup',
      owner: 'HR' as const,
      phase: 'Before joining' as const,
      daysOffset: -2,
    },
    {
      title: 'Prepare first-week onboarding plan',
      owner: 'Manager' as const,
      phase: 'Before joining' as const,
      daysOffset: -1,
    },
    {
      title: 'Welcome and culture orientation',
      owner: 'HR' as const,
      phase: 'Day 1' as const,
      daysOffset: 0,
    },
    {
      title: 'Introduce team and assign peer mentor',
      owner: 'Manager' as const,
      phase: 'Day 1' as const,
      daysOffset: 0,
    },
    {
      title: '30-day technical performance check-in',
      owner: 'Manager' as const,
      phase: 'First 30 days' as const,
      daysOffset: 30,
    },
  ];

  let taskCounter = 1;
  onboardingCandidates.forEach((candidate, cIdx) => {
    defaultTasks.forEach((task, tIdx) => {
      const isDone = cIdx < 5 ? tIdx < 5 : cIdx < 10 ? tIdx < 3 : tIdx < 1;
      onboarding.push({
        id: `30000000-0000-0000-0000-${String(taskCounter).padStart(12, '0')}`,
        candidateId: candidate.id,
        title: task.title,
        owner: task.owner,
        phase: task.phase,
        dueDate: new Date(Date.now() + task.daysOffset * 86400000).toISOString(),
        done: isDone,
        status: isDone ? 'Done' : 'Pending',
      });
      taskCounter++;
    });
  });

  // 4. Activity feed events
  const activities: ActivityEvent[] = [];
  for (let i = 0; i < 50; i++) {
    const candidate = candidates[i % candidates.length]!;
    activities.push({
      id: `40000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      entityType: 'candidate',
      entityId: candidate.id,
      actor: i % 2 === 0 ? 'Priya Sharma (HR)' : 'Arjun Kapoor (Manager)',
      message: `Updated candidate ${candidate.name} stage to ${candidate.stage}.`,
      timestamp: new Date(Date.now() - (i + 1) * 3600000 * 2).toISOString(),
    });
  }

  return { users, openings, candidates, onboarding, activities };
}
