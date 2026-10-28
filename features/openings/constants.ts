export interface DepartmentProfile {
  positions: string[];
  techStack: string[];
  defaultRole: string;
  defaultDescription: string;
}

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Data & Analytics',
  'Operations',
  'Human Resources',
  'Marketing',
  'Sales',
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

const ENGINEERING_PROFILE: DepartmentProfile = {
  defaultRole: 'Senior Frontend Engineer',
  defaultDescription:
    'We are looking for an experienced engineer to lead frontend architecture, implement scalable design systems, and accelerate customer-facing product development.',
  positions: [
    'Senior Frontend Engineer',
    'Senior Backend Engineer',
    'Full Stack Engineer',
    'Staff Frontend Engineer',
    'Staff Backend Engineer',
    'Software Engineer (Frontend)',
    'Software Engineer (Backend)',
    'DevOps / Cloud Architect',
    'Site Reliability Engineer (SRE)',
    'Mobile Engineer (iOS / Android)',
    'Engineering Manager',
    'QA & Automation Test Lead',
    'Security Engineer',
  ],
  techStack: [
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'JavaScript',
    'Python',
    'Go',
    'Java / Spring Boot',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'GCP',
    'GraphQL',
    'REST APIs',
    'Kafka',
    'Tailwind CSS',
    'Microservices',
    'CI/CD Pipelines',
    'Git',
    'Jest / Vitest',
  ],
};

const PRODUCT_PROFILE: DepartmentProfile = {
  defaultRole: 'Product Manager',
  defaultDescription:
    'We are seeking a proactive Product Manager to define roadmap strategy, collaborate cross-functionally with engineering and design, and deliver impactful customer solutions.',
  positions: [
    'Product Manager',
    'Senior Product Manager',
    'Lead Product Manager',
    'Associate Product Manager',
    'Principal Product Manager',
    'Technical Product Manager (TPM)',
    'Growth Product Manager',
    'Group Product Manager',
    'Product Operations Manager',
  ],
  techStack: [
    'Product Strategy',
    'Roadmap Planning',
    'Agile / Scrum',
    'Jira / Confluence',
    'PRD Documentation',
    'User Research',
    'A/B Testing',
    'Mixpanel',
    'Google Analytics',
    'Feature Prioritization',
    'KPI & OKR Tracking',
    'Stakeholder Management',
    'Competitive Analysis',
    'Figma (Wireframing)',
    'Customer Journey Mapping',
    'Data-driven Decision Making',
  ],
};

const DESIGN_PROFILE: DepartmentProfile = {
  defaultRole: 'Senior Product Designer',
  defaultDescription:
    'Seeking a creative and detail-oriented Senior Product Designer to drive end-to-end design from UX flows to high-fidelity UI and design system components.',
  positions: [
    'Senior Product Designer',
    'UX Designer II',
    'Lead UI Designer',
    'Staff Product Designer',
    'UI/UX Designer',
    'Design Systems Lead',
    'UX Researcher',
    'Visual & Brand Designer',
    'Motion Designer',
  ],
  techStack: [
    'Figma',
    'UI Design',
    'UX Research',
    'Design Systems',
    'Interactive Prototyping',
    'Wireframing',
    'User Testing & Usability',
    'Information Architecture',
    'Adobe Creative Cloud',
    'Design Tokens',
    'Mobile UX (iOS/Android)',
    'Web UX & Responsive Design',
    'Micro-interactions',
    'Accessibility (WCAG)',
  ],
};

const DATA_PROFILE: DepartmentProfile = {
  defaultRole: 'Senior Product Analyst',
  defaultDescription:
    'Looking for a sharp Senior Data & Analytics specialist to build robust models, craft actionable executive dashboards, and drive business decision-making with data.',
  positions: [
    'Data Analyst',
    'Senior Data Analyst',
    'Senior Product Analyst',
    'Data Scientist',
    'Senior Data Scientist',
    'Machine Learning Engineer',
    'AI Research Engineer',
    'Data Engineer',
    'Analytics Consultant',
    'Business Intelligence Analyst',
  ],
  techStack: [
    'Python',
    'SQL',
    'Tableau',
    'Power BI',
    'Pandas & NumPy',
    'Machine Learning',
    'Deep Learning',
    'Snowflake',
    'BigQuery',
    'Apache Spark',
    'Data Modeling',
    'ETL / ELT Pipelines',
    'Statistics & Probability',
    'Generative AI / LLMs',
    'R',
    'dbt',
    'Airflow',
  ],
};

const OPERATIONS_PROFILE: DepartmentProfile = {
  defaultRole: 'Operations Manager',
  defaultDescription:
    'We are looking for an Operations Manager to streamline organizational workflows, manage vendor relationships, optimize supply chains, and scale operational excellence.',
  positions: [
    'Operations Manager',
    'Business Operations Associate',
    'Supply Chain Lead',
    'Procurement & Vendor Specialist',
    'Strategy & Operations Lead',
    'Process Improvement Manager',
    'Logistics & Fulfilment Manager',
  ],
  techStack: [
    'Process Optimization',
    'Supply Chain Management',
    'Vendor & Contract Management',
    'ERP Systems (SAP / Oracle)',
    'Advanced Excel & Google Sheets',
    'Logistics & Inventory Planning',
    'KPI Dashboards',
    'Six Sigma / Lean',
    'Cost Reduction Strategy',
    'SLA Governance',
    'Cross-functional Project Management',
  ],
};

const HR_PROFILE: DepartmentProfile = {
  defaultRole: 'Senior Talent Acquisition Specialist',
  defaultDescription:
    'Seeking an experienced Talent Acquisition / People specialist to manage end-to-end recruitment pipelines, employer branding, and candidate onboarding experiences.',
  positions: [
    'Technical Recruiter',
    'Senior Talent Acquisition Specialist',
    'HR Business Partner (HRBP)',
    'People & Culture Manager',
    'HR Operations Lead',
    'Compensation & Benefits Specialist',
    'Employee Experience Lead',
    'Talent Sourcing Specialist',
  ],
  techStack: [
    'Technical Recruiting',
    'Talent Sourcing (LinkedIn Recruiter)',
    'Applicant Tracking Systems (ATS)',
    'HRIS (Workday / BambooHR)',
    'Employee Relations',
    'Payroll & Statutory Compliance',
    'Performance Management',
    'Labor Laws & Regulatory Policies',
    'Onboarding Programs',
    'Compensation Benchmarking',
    'HR Analytics & Reporting',
  ],
};

const MARKETING_PROFILE: DepartmentProfile = {
  defaultRole: 'Growth Marketing Manager',
  defaultDescription:
    'Looking for a data-driven Growth Marketing Manager to oversee multi-channel customer acquisition campaigns, brand storytelling, and conversion rate optimization.',
  positions: [
    'Growth Marketing Manager',
    'Performance Marketer',
    'Content Marketing Lead',
    'Product Marketing Manager (PMM)',
    'SEO / SEM Specialist',
    'Brand & Communications Manager',
    'Social Media & Community Lead',
  ],
  techStack: [
    'Performance Marketing',
    'Google Ads & Analytics',
    'Meta Ads Manager',
    'SEO & Content Strategy',
    'HubSpot Marketing Hub',
    'Email Marketing Automation',
    'Growth Hacking',
    'Brand Storytelling',
    'Copywriting',
    'Influencer Marketing',
    'A/B Testing & Funnel Optimization',
    'Customer Acquisition Cost (CAC) Analysis',
  ],
};

const SALES_PROFILE: DepartmentProfile = {
  defaultRole: 'Senior Account Executive',
  defaultDescription:
    'Seeking a high-performing Enterprise Account Executive to drive revenue growth, manage complex B2B sales cycles, and build strong enterprise customer partnerships.',
  positions: [
    'Account Executive (AE)',
    'Senior Account Executive',
    'Enterprise Sales Manager',
    'Business Development Representative (BDR)',
    'Sales Development Lead',
    'Customer Success Manager (CSM)',
    'Key Account Manager',
  ],
  techStack: [
    'B2B Enterprise Sales',
    'Salesforce CRM',
    'HubSpot Sales',
    'Lead Generation & Prospecting',
    'Pipeline Forecasting',
    'Cold Outreach & Email Sequences',
    'Contract Negotiation & Closing',
    'Client Relationship Management',
    'SaaS Sales Metrics (ARR / NRR)',
    'Solution Selling',
    'Customer Success & Retention',
  ],
};

export const DEPARTMENT_PROFILES: Record<string, DepartmentProfile> = {
  Engineering: ENGINEERING_PROFILE,
  Product: PRODUCT_PROFILE,
  Design: DESIGN_PROFILE,
  'Data & Analytics': DATA_PROFILE,
  'Data & AI': DATA_PROFILE,
  Operations: OPERATIONS_PROFILE,
  'Human Resources': HR_PROFILE,
  Marketing: MARKETING_PROFILE,
  Sales: SALES_PROFILE,
};

export function getDepartmentProfile(department: string): DepartmentProfile {
  return DEPARTMENT_PROFILES[department] || ENGINEERING_PROFILE;
}
