import crypto from 'node:crypto';

const SUPABASE_URL = 'https://ijcesduxnbgxjcteejbk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ezpArMfQi-1GiA5upxOPsA_-d8hzIAN';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation',
};

async function post(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to insert into ${table} (${res.status}): ${text}`);
  }
  return res.json();
}

async function patch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to patch ${table} ${id} (${res.status}): ${text}`);
  }
  return res.json();
}

async function run() {
  console.log('🚀 Seeding comprehensive demo data into Supabase...');

  // 1. Update Openings to make sure all descriptions, competencies and statuses are rich
  console.log('1. Enriching Openings...');
  const openingsData = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Bengaluru, India (Hybrid)',
      employment_type: 'Full-time',
      headcount: 2,
      experience_min: 3,
      experience_max: 7,
      budget_min: 28,
      budget_max: 42,
      must_have_skills: ['Go', 'PostgreSQL', 'Kafka', 'Redis', 'Distributed Systems'],
      nice_to_have_skills: ['Docker', 'Kubernetes', 'gRPC', 'GraphQL'],
      description: 'We are seeking an experienced Backend Engineer to scale our transactional core, optimize high-throughput distributed messaging, and lead microservices architecture.',
      urgency: 'High',
      status: 'Open',
      manager_id: '11111111-1111-4111-8111-111111111111', // Arjun Kapoor
      target_start_date: '2026-11-15T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Frontend Tech Lead',
      department: 'Engineering',
      location: 'Bengaluru, India',
      employment_type: 'Full-time',
      headcount: 1,
      experience_min: 5,
      experience_max: 9,
      budget_min: 32,
      budget_max: 48,
      must_have_skills: ['React', 'TypeScript', 'Next.js', 'Architecture', 'Web Performance'],
      nice_to_have_skills: ['Tailwind CSS', 'Radix UI', 'Playwright', 'GraphQL'],
      description: 'Lead the frontend engineering team, establish architectural guidelines for enterprise web applications, and collaborate with design to deliver world-class user experiences.',
      urgency: 'High',
      status: 'Sourcing',
      manager_id: '11111111-1111-4111-8111-111111111111',
      target_start_date: '2026-12-01T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Product Designer',
      department: 'Design',
      location: 'Gurugram, India',
      employment_type: 'Full-time',
      headcount: 1,
      experience_min: 3,
      experience_max: 6,
      budget_min: 18,
      budget_max: 28,
      must_have_skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      nice_to_have_skills: ['Micro-interactions', 'Accessibility', 'Framer'],
      description: 'Design intuitive, enterprise-grade workflows for our platform. You will spearhead end-to-end UX architecture from discovery and wireframing to high-fidelity design system tokens.',
      urgency: 'Normal',
      status: 'Interviewing',
      manager_id: '44444444-4444-4444-8444-444444444444', // Ananya Deshmukh
      target_start_date: '2026-11-20T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'DevOps Platform Engineer',
      department: 'Engineering',
      location: 'Bengaluru, India',
      employment_type: 'Full-time',
      headcount: 1,
      experience_min: 4,
      experience_max: 8,
      budget_min: 24,
      budget_max: 36,
      must_have_skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
      nice_to_have_skills: ['ArgoCD', 'Helm', 'Golang', 'Datadog'],
      description: 'Own our multi-region Kubernetes infrastructure, implement GitOps pipelines, and ensure 99.99% availability across high-concurrency production workloads.',
      urgency: 'Normal',
      status: 'Shortlist Shared',
      manager_id: '11111111-1111-4111-8111-111111111111',
      target_start_date: '2026-11-25T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Data Analyst',
      department: 'Data & Analytics',
      location: 'Bengaluru, India',
      employment_type: 'Full-time',
      headcount: 2,
      experience_min: 2,
      experience_max: 5,
      budget_min: 14,
      budget_max: 22,
      must_have_skills: ['SQL', 'Python', 'PowerBI', 'Data Modeling', 'Cohort Analysis'],
      nice_to_have_skills: ['dbt', 'Snowflake', 'Airflow', 'Tableau'],
      description: 'Transform complex business datasets into actionable operational dashboards, design predictive retention metrics, and partner with leadership to optimize unit economics.',
      urgency: 'Normal',
      status: 'Offer Stage',
      manager_id: '55555555-5555-4555-8555-555555555555', // Vikram Malhotra
      target_start_date: '2026-11-28T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      title: 'Product Manager - Core',
      department: 'Product',
      location: 'Gurugram, India (Hybrid)',
      employment_type: 'Full-time',
      headcount: 1,
      experience_min: 4,
      experience_max: 8,
      budget_min: 26,
      budget_max: 40,
      must_have_skills: ['Product Strategy', 'Roadmapping', 'Agile', 'User Discovery', 'Metrics'],
      nice_to_have_skills: ['SQL', 'Mixpanel', 'Figma', 'B2B SaaS'],
      description: 'Lead the vision, roadmap, and delivery for our core product suite. Work closely with Engineering, Design, and Sales to drive product-led growth and enterprise retention.',
      urgency: 'Normal',
      status: 'Interviewing',
      manager_id: '33333333-3333-4333-8333-333333333333', // Rohit Verma
      target_start_date: '2026-12-05T00:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000007',
      title: 'QA Automation Lead',
      department: 'Engineering',
      location: 'Bengaluru, India',
      employment_type: 'Full-time',
      headcount: 1,
      experience_min: 4,
      experience_max: 7,
      budget_min: 18,
      budget_max: 28,
      must_have_skills: ['Playwright', 'TypeScript', 'Jest', 'API Testing', 'CI Integration'],
      nice_to_have_skills: ['Cypress', 'Docker', 'K6', 'Postman'],
      description: 'Establish automated end-to-end testing frameworks, guarantee regression safety for continuous delivery, and champion software quality engineering.',
      urgency: 'Low',
      status: 'Open',
      manager_id: '11111111-1111-4111-8111-111111111111',
      target_start_date: '2026-12-15T00:00:00Z',
    },
  ];

  for (const o of openingsData) {
    await patch('openings', o.id, o).catch(async () => {
      await post('openings', [o]);
    });
  }
  console.log('✓ Openings updated successfully.');

  // 2. Add realistic candidates for Design, Data Analysis, Product, Frontend, DevOps, etc.
  console.log('2. Seeding Candidates across all departments...');
  const candidatesData = [
    // --- Product Designer (10000000-0000-0000-0000-000000000003) ---
    {
      id: '20000000-0000-0000-0000-000000000031',
      opening_id: '10000000-0000-0000-0000-000000000003',
      name: 'Tanvi Deshmukh',
      email: 'tanvi.deshmukh@example.com',
      phone: '+91 9820144552',
      current_company: 'CRED',
      current_role: 'Senior Product Designer',
      experience_years: 5,
      notice_period: '30 Days',
      expected_ctc: 24,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/tanvi-deshmukh',
      resume_file_name: 'Tanvi_Deshmukh_Portfolio.pdf',
      hr_notes: 'Stunning portfolio with deep micro-interaction work and enterprise design system leadership.',
      stage: 'Interview',
      manager_decision: 'Shortlisted',
      manager_comment: 'Excellent typography sense and component hierarchy. Moving to design challenge presentation.',
      interview_date: new Date(Date.now() + 86400000 * 1.5).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Pending',
      interview_note: 'Portfolio Review Round with Ananya Deshmukh',
    },
    {
      id: '20000000-0000-0000-0000-000000000032',
      opening_id: '10000000-0000-0000-0000-000000000003',
      name: 'Anish Kapoor',
      email: 'anish.kapoor@example.com',
      phone: '+91 9819233441',
      current_company: 'Zomato',
      current_role: 'UX Designer II',
      experience_years: 4,
      notice_period: '15 Days',
      expected_ctc: 20,
      source: 'Referral',
      profile_url: 'https://linkedin.com/in/anish-kapoor',
      resume_file_name: 'Anish_Kapoor_Resume.pdf',
      hr_notes: 'Referred by Arjun Kapoor. Strong product problem-solving skills.',
      stage: 'Shared with Manager',
      manager_decision: 'Shortlisted',
      manager_comment: 'Good case studies on consumer checkout flows.',
      interview_date: null,
      interview_mode: null,
      interview_outcome: 'Pending',
      interview_note: null,
    },
    {
      id: '20000000-0000-0000-0000-000000000033',
      opening_id: '10000000-0000-0000-0000-000000000003',
      name: 'Deepika Pillai',
      email: 'deepika.pillai@example.com',
      phone: '+91 9711244558',
      current_company: 'Swiggy',
      current_role: 'Lead UI Designer',
      experience_years: 6,
      notice_period: '60 Days',
      expected_ctc: 27,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/deepika-pillai',
      resume_file_name: 'Deepika_Pillai_Resume.pdf',
      hr_notes: 'Expert in design tokens and Figma auto-layout libraries.',
      stage: 'Sourced',
      manager_decision: 'Pending',
      manager_comment: null,
      interview_date: null,
      interview_mode: null,
      interview_outcome: 'Pending',
      interview_note: null,
    },

    // --- Data Analyst (10000000-0000-0000-0000-000000000005) ---
    {
      id: '20000000-0000-0000-0000-000000000051',
      opening_id: '10000000-0000-0000-0000-000000000005',
      name: 'Ritu Saxena',
      email: 'ritu.saxena@example.com',
      phone: '+91 9845122334',
      current_company: 'PhonePe',
      current_role: 'Senior Business Intelligence Analyst',
      experience_years: 4,
      notice_period: '30 Days',
      expected_ctc: 18,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/ritu-saxena',
      resume_file_name: 'Ritu_Saxena_Resume.pdf',
      hr_notes: 'Exceptional SQL mastery and cohort analysis experience. Offer letter approved by Vikram.',
      stage: 'Offer Sent',
      manager_decision: 'Shortlisted',
      manager_comment: 'Top scorer in the SQL data modeling case study. Approved offer of ₹18 LPA.',
      interview_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Selected',
      interview_note: 'Offer released on 12-Oct-2026. Expected joining in 30 days.',
    },
    {
      id: '20000000-0000-0000-0000-000000000052',
      opening_id: '10000000-0000-0000-0000-000000000005',
      name: 'Kavita Reddy',
      email: 'kavita.reddy@example.com',
      phone: '+91 9901455667',
      current_company: 'Flipkart',
      current_role: 'Data Analyst II',
      experience_years: 3,
      notice_period: '15 Days',
      expected_ctc: 16,
      source: 'Naukri',
      profile_url: 'https://linkedin.com/in/kavita-reddy',
      resume_file_name: 'Kavita_Reddy_Resume.pdf',
      hr_notes: 'Strong Python and PowerBI credentials.',
      stage: 'Interview',
      manager_decision: 'Shortlisted',
      manager_comment: 'Great problem solver, scheduled for analytics deep dive.',
      interview_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Pending',
      interview_note: 'Technical Analytics Assessment with Vikram Malhotra',
    },
    {
      id: '20000000-0000-0000-0000-000000000053',
      opening_id: '10000000-0000-0000-0000-000000000005',
      name: 'Amit Choudhury',
      email: 'amit.choudhury@example.com',
      phone: '+91 9886311229',
      current_company: 'Fractal Analytics',
      current_role: 'Analytics Consultant',
      experience_years: 5,
      notice_period: '60 Days',
      expected_ctc: 20,
      source: 'Referral',
      profile_url: 'https://linkedin.com/in/amit-choudhury',
      resume_file_name: 'Amit_Choudhury_CV.pdf',
      hr_notes: 'Has worked with Fortune 500 client reporting suites.',
      stage: 'Shared with Manager',
      manager_decision: 'Pending',
      manager_comment: null,
      interview_date: null,
      interview_mode: null,
      interview_outcome: 'Pending',
      interview_note: null,
    },

    // --- Product Manager - Core (10000000-0000-0000-0000-000000000006) ---
    {
      id: '20000000-0000-0000-0000-000000000061',
      opening_id: '10000000-0000-0000-0000-000000000006',
      name: 'Siddharth Jain',
      email: 'siddharth.jain@example.com',
      phone: '+91 9811266778',
      current_company: 'Razorpay',
      current_role: 'Lead Product Manager',
      experience_years: 7,
      notice_period: '30 Days',
      expected_ctc: 36,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/siddharth-jain',
      resume_file_name: 'Siddharth_Jain_Resume.pdf',
      hr_notes: 'Drove 40% growth in merchant payment conversions. Top tier PM candidate.',
      stage: 'Selected',
      manager_decision: 'Shortlisted',
      manager_comment: 'Outstanding strategic clarity. Unanimous hire recommendation from leadership panel.',
      interview_date: new Date(Date.now() - 86400000 * 3).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Selected',
      interview_note: 'Final Culture & Strategic Alignment Round Completed',
    },
    {
      id: '20000000-0000-0000-0000-000000000062',
      opening_id: '10000000-0000-0000-0000-000000000006',
      name: 'Shreya Sengupta',
      email: 'shreya.sengupta@example.com',
      phone: '+91 9820544332',
      current_company: 'Swiggy',
      current_role: 'Product Manager - Logistics',
      experience_years: 5,
      notice_period: '45 Days',
      expected_ctc: 30,
      source: 'Referral',
      profile_url: 'https://linkedin.com/in/shreya-sengupta',
      resume_file_name: 'Shreya_Sengupta_Resume.pdf',
      hr_notes: 'Strong analytical mindset and feature specification discipline.',
      stage: 'Interview',
      manager_decision: 'Shortlisted',
      manager_comment: 'Cleared initial technical screening. Proceeding to Product Sense Round.',
      interview_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Pending',
      interview_note: 'Product Sense Round with Rohit Verma',
    },
    {
      id: '20000000-0000-0000-0000-000000000063',
      opening_id: '10000000-0000-0000-0000-000000000006',
      name: 'Harsh Vardhan',
      email: 'harsh.vardhan@example.com',
      phone: '+91 9910488992',
      current_company: 'Ola',
      current_role: 'Senior PM',
      experience_years: 6,
      notice_period: '30 Days',
      expected_ctc: 32,
      source: 'Indeed',
      profile_url: 'https://linkedin.com/in/harsh-vardhan',
      resume_file_name: 'Harsh_Vardhan_CV.pdf',
      hr_notes: 'Experienced in mobile driver apps and dynamic pricing engines.',
      stage: 'Shared with Manager',
      manager_decision: 'Pending',
      manager_comment: null,
      interview_date: null,
      interview_mode: null,
      interview_outcome: 'Pending',
      interview_note: null,
    },

    // --- Frontend Tech Lead (10000000-0000-0000-0000-000000000002) ---
    {
      id: '20000000-0000-0000-0000-000000000021',
      opening_id: '10000000-0000-0000-0000-000000000002',
      name: 'Abhishek Sinha',
      email: 'abhishek.sinha@example.com',
      phone: '+91 9845188776',
      current_company: 'Atlassian',
      current_role: 'Staff Frontend Engineer',
      experience_years: 8,
      notice_period: '30 Days',
      expected_ctc: 44,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/abhishek-sinha',
      resume_file_name: 'Abhishek_Sinha_Resume.pdf',
      hr_notes: 'Architected Jira frontend micro-apps. Top-shelf candidate.',
      stage: 'Interview',
      manager_decision: 'Shortlisted',
      manager_comment: 'Incredible deep dive into React concurrency and bundle tree-shaking.',
      interview_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Pending',
      interview_note: 'Architecture Deep Dive with Arjun Kapoor',
    },
    {
      id: '20000000-0000-0000-0000-000000000022',
      opening_id: '10000000-0000-0000-0000-000000000002',
      name: 'Divya Menon',
      email: 'divya.menon@example.com',
      phone: '+91 9741255441',
      current_company: 'Microsoft',
      current_role: 'Senior Software Engineer (Web)',
      experience_years: 6,
      notice_period: '60 Days',
      expected_ctc: 38,
      source: 'Referral',
      profile_url: 'https://linkedin.com/in/divya-menon',
      resume_file_name: 'Divya_Menon_CV.pdf',
      hr_notes: 'Contributor to open-source UI libraries. Very strong on accessibility.',
      stage: 'Shared with Manager',
      manager_decision: 'Pending',
      manager_comment: null,
      interview_date: null,
      interview_mode: null,
      interview_outcome: 'Pending',
      interview_note: null,
    },

    // --- DevOps Platform Engineer (10000000-0000-0000-0000-000000000004) ---
    {
      id: '20000000-0000-0000-0000-000000000041',
      opening_id: '10000000-0000-0000-0000-000000000004',
      name: 'Nikhil Anand',
      email: 'nikhil.anand@example.com',
      phone: '+91 9880199882',
      current_company: 'Zerodha',
      current_role: 'Senior SRE',
      experience_years: 6,
      notice_period: '15 Days',
      expected_ctc: 32,
      source: 'LinkedIn',
      profile_url: 'https://linkedin.com/in/nikhil-anand',
      resume_file_name: 'Nikhil_Anand_Resume.pdf',
      hr_notes: 'Managed 10M+ daily trades infrastructure. Outstanding Linux and K8s chops.',
      stage: 'Interview',
      manager_decision: 'Shortlisted',
      manager_comment: 'Passed live troubleshooting round with flying colors.',
      interview_date: new Date(Date.now() + 86400000 * 2.5).toISOString(),
      interview_mode: 'Video',
      interview_outcome: 'Pending',
      interview_note: 'System Architecture & Incident Response Round',
    },
  ];

  await post('candidates', candidatesData);
  console.log(`✓ Inserted ${candidatesData.length} new candidates across roles.`);

  // 3. Add Onboarding tasks for joiners
  console.log('3. Seeding rich onboarding tasks for joiners...');
  const onboardingData = [
    // Ritu Saxena (Data Analyst - Offer Sent)
    {
      id: '30000000-0000-0000-0000-000000000011',
      candidate_id: '20000000-0000-0000-0000-000000000051',
      title: 'Collect signed Offer Letter & NDA',
      owner: 'HR',
      phase: 'Before joining',
      due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      done: true,
      status: 'Done',
      notes: 'Signed contract received via DocuSign',
    },
    {
      id: '30000000-0000-0000-0000-000000000012',
      candidate_id: '20000000-0000-0000-0000-000000000051',
      title: 'Background Verification (Degree & Previous Payslips)',
      owner: 'HR',
      phase: 'Before joining',
      due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      done: true,
      status: 'Done',
      notes: 'Verified via AuthBridge portal',
    },
    {
      id: '30000000-0000-0000-0000-000000000013',
      candidate_id: '20000000-0000-0000-0000-000000000051',
      title: 'Order Workstation (MacBook Air M3 16GB)',
      owner: 'HR',
      phase: 'Before joining',
      due_date: new Date(Date.now() + 86400000 * 8).toISOString(),
      done: false,
      status: 'Pending',
      notes: 'Order placed with Apple Business store',
    },
    {
      id: '30000000-0000-0000-0000-000000000014',
      candidate_id: '20000000-0000-0000-0000-000000000051',
      title: 'Day 1 HR Induction & Benefits Enrollment',
      owner: 'HR',
      phase: 'Day 1',
      due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
      done: false,
      status: 'Pending',
      notes: null,
    },
    {
      id: '30000000-0000-0000-0000-000000000015',
      candidate_id: '20000000-0000-0000-0000-000000000051',
      title: 'Manager 1:1 & Data Warehouse Walkthrough',
      owner: 'Manager',
      phase: 'Day 1',
      due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
      done: false,
      status: 'Pending',
      notes: 'Vikram Malhotra will introduce analytics team and Snowflake warehouse',
    },

    // Tanvi Deshmukh (Product Designer - Interview/Selected)
    {
      id: '30000000-0000-0000-0000-000000000021',
      candidate_id: '20000000-0000-0000-0000-000000000031',
      title: 'Provision Figma Enterprise & Design Token Access',
      owner: 'Manager',
      phase: 'Before joining',
      due_date: new Date(Date.now() + 86400000 * 10).toISOString(),
      done: false,
      status: 'Pending',
      notes: 'Ananya Deshmukh will invite to primary design workspace',
    },
    {
      id: '30000000-0000-0000-0000-000000000022',
      candidate_id: '20000000-0000-0000-0000-000000000031',
      title: 'Assign Design Buddy & Introduce Figma Libraries',
      owner: 'Manager',
      phase: 'Day 1',
      due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
      done: false,
      status: 'Pending',
      notes: null,
    },

    // Siddharth Jain (Product Manager - Selected)
    {
      id: '30000000-0000-0000-0000-000000000031',
      candidate_id: '20000000-0000-0000-0000-000000000061',
      title: 'Prepare Offer Packet & Compensation Benchmarking',
      owner: 'HR',
      phase: 'Before joining',
      due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      done: true,
      status: 'Done',
      notes: 'Benchmark ₹36 LPA Base + ₹6 LPA Performance Bonus',
    },
    {
      id: '30000000-0000-0000-0000-000000000032',
      candidate_id: '20000000-0000-0000-0000-000000000061',
      title: 'Product Roadmap & Q4 OKR Review Meeting',
      owner: 'Manager',
      phase: 'Day 1',
      due_date: new Date(Date.now() + 86400000 * 18).toISOString(),
      done: false,
      status: 'Pending',
      notes: 'Meeting with Rohit Verma to outline Core Platform OKRs',
    },
  ];

  await post('onboarding_items', onboardingData);
  console.log(`✓ Inserted ${onboardingData.length} new onboarding tasks.`);

  // 4. Notifications
  console.log('4. Seeding real-time notifications...');
  const notificationsData = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      recipient_role: 'manager',
      title: 'Interview Scheduled',
      message: 'Tanvi Deshmukh scheduled for Portfolio Review on Thursday at 2:00 PM.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: false,
      link: '/candidates',
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      recipient_role: 'hr',
      title: 'Offer Accepted',
      message: 'Ritu Saxena has formally accepted the Data Analyst offer of ₹18 LPA.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      read: false,
      link: '/onboarding',
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      recipient_role: 'manager',
      title: 'Candidate Shortlisted',
      message: 'Ananya Deshmukh shortlisted Anish Kapoor for Product Designer.',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      read: true,
      link: '/openings/10000000-0000-0000-0000-000000000003',
    },
    {
      id: '40000000-0000-0000-0000-000000000004',
      recipient_role: 'hr',
      title: 'New Requisition Published',
      message: 'Staff AI Infrastructure Engineer (2 positions) is now live in Directory.',
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      read: true,
      link: '/openings',
    },
  ];

  await post('notifications', notificationsData);
  console.log(`✓ Inserted ${notificationsData.length} notifications.`);

  // 5. Activities
  console.log('5. Seeding Team Activity stream...');
  const activitiesData = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      entity_type: 'candidate',
      entity_id: '20000000-0000-0000-0000-000000000051',
      actor: 'Priya Sharma (HR)',
      message: 'Released formal Offer Letter of ₹18 LPA to Ritu Saxena (Data Analyst).',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      entity_type: 'candidate',
      entity_id: '20000000-0000-0000-0000-000000000031',
      actor: 'Ananya Deshmukh (Design Lead)',
      message: 'Completed Portfolio Evaluation for Tanvi Deshmukh. Recommended for Onsite.',
      timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      entity_type: 'candidate',
      entity_id: '20000000-0000-0000-0000-000000000061',
      actor: 'Rohit Verma (Product Lead)',
      message: 'Approved hiring decision for Siddharth Jain as Lead Product Manager.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      entity_type: 'opening',
      entity_id: '10000000-0000-0000-0000-000000000002',
      actor: 'Arjun Kapoor (Manager)',
      message: 'Updated Frontend Tech Lead requisition status to Sourcing.',
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];

  await post('activities', activitiesData);
  console.log(`✓ Inserted ${activitiesData.length} team activities.`);

  console.log('\n🎉 ALL DEMO DATA SEEDED PERFECTLY INTO SUPABASE!');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
