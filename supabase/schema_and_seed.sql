-- =========================================================
-- HRO Recruitment Management System - Complete Schema & Seed
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================

-- 1. Create Tables
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'hr')),
  department TEXT NOT NULL,
  avatar_initials TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  headcount INTEGER NOT NULL CHECK (headcount > 0),
  experience_min NUMERIC NOT NULL DEFAULT 0,
  experience_max NUMERIC NOT NULL DEFAULT 0,
  budget_min NUMERIC NOT NULL DEFAULT 0,
  budget_max NUMERIC NOT NULL DEFAULT 0,
  must_have_skills TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have_skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Normal', 'High')),
  target_start_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Sourcing', 'Shortlist Shared', 'Interviewing', 'Offer Stage', 'Filled', 'On Hold', 'Closed')),
  manager_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id UUID NOT NULL REFERENCES openings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_company TEXT NOT NULL,
  "current_role" TEXT NOT NULL,
  experience_years NUMERIC NOT NULL DEFAULT 0,
  notice_period TEXT NOT NULL,
  expected_ctc NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Naukri', 'Indeed', 'Referral', 'Other')),
  profile_url TEXT,
  resume_file_name TEXT,
  hr_notes TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('Sourced', 'Shared with Manager', 'Interview', 'Selected', 'Offer Sent', 'Joined', 'Rejected')),
  manager_decision TEXT NOT NULL DEFAULT 'Pending' CHECK (manager_decision IN ('Pending', 'Shortlisted', 'Rejected')),
  manager_comment TEXT,
  interview_date TIMESTAMPTZ,
  interview_mode TEXT CHECK (interview_mode IN ('Video', 'Phone', 'Onsite')),
  interview_outcome TEXT NOT NULL DEFAULT 'Pending' CHECK (interview_outcome IN ('Pending', 'Selected', 'Rejected', 'On Hold')),
  interview_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner TEXT NOT NULL CHECK (owner IN ('HR', 'Manager')),
  phase TEXT NOT NULL CHECK (phase IN ('Before joining', 'Day 1', 'First 30 days')),
  due_date TIMESTAMPTZ NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Done', 'Blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('opening', 'candidate', 'onboarding')),
  entity_id UUID NOT NULL,
  actor TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('manager', 'hr')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT
);

-- 2. Enable Row Level Security & Public Policies
-- ---------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access users" ON users;
CREATE POLICY "Public access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access openings" ON openings;
CREATE POLICY "Public access openings" ON openings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access candidates" ON candidates;
CREATE POLICY "Public access candidates" ON candidates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access onboarding_items" ON onboarding_items;
CREATE POLICY "Public access onboarding_items" ON onboarding_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access activities" ON activities;
CREATE POLICY "Public access activities" ON activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access notifications" ON notifications;
CREATE POLICY "Public access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 3. Clear existing table records for clean idempotent seed
-- ---------------------------------------------------------
TRUNCATE TABLE onboarding_items, candidates, openings, users, activities, notifications CASCADE;

-- 4. Seed Initial Users
-- ---------------------------------------------------------
INSERT INTO users (id, name, role, department, avatar_initials) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Arjun Kapoor', 'manager', 'Engineering', 'AK'),
  ('22222222-2222-4222-8222-222222222222', 'Priya Sharma', 'hr', 'People Operations', 'PS'),
  ('33333333-3333-4333-8333-333333333333', 'Rohit Verma', 'manager', 'Product', 'RV'),
  ('44444444-4444-4444-8444-444444444444', 'Ananya Deshmukh', 'manager', 'Design', 'AD'),
  ('55555555-5555-4555-8555-555555555555', 'Vikram Malhotra', 'manager', 'Data & Analytics', 'VM');

-- 5. Seed Openings
-- ---------------------------------------------------------
INSERT INTO openings (id, title, department, location, employment_type, headcount, experience_min, experience_max, budget_min, budget_max, must_have_skills, nice_to_have_skills, description, urgency, target_start_date, status, manager_id, created_at) VALUES
  ('5fb9220d-9b0f-4d32-a248-6492457c3890', 'Senior Backend Engineer', 'Engineering', 'Bengaluru, India', 'Full-time', 1, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Senior Backend Engineer to scale our core platform infrastructure.', 'Low', '2026-11-13T09:39:52.883Z'::timestamptz, 'Open', '11111111-1111-4111-8111-111111111111', '2026-10-12T09:39:52.884Z'::timestamptz),
  ('1ffc41a7-170e-44a4-b882-fcfe9e130564', 'Frontend Tech Lead', 'People Operations', 'Gurugram, India', 'Full-time', 2, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Frontend Tech Lead to scale our core platform infrastructure.', 'Normal', '2026-11-13T09:39:52.884Z'::timestamptz, 'Sourcing', '22222222-2222-4222-8222-222222222222', '2026-10-11T09:39:52.884Z'::timestamptz),
  ('482c1fc3-0dbb-4c15-b1d9-5145bae71bc8', 'Fullstack Developer', 'Product', 'Bengaluru, India', 'Full-time', 2, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Fullstack Developer to scale our core platform infrastructure.', 'High', '2026-11-13T09:39:52.884Z'::timestamptz, 'Shortlist Shared', '33333333-3333-4333-8333-333333333333', '2026-10-10T09:39:52.884Z'::timestamptz),
  ('86010a58-e36c-4314-b2ec-adc2e8ce5136', 'Product Designer', 'Design', 'Gurugram, India', 'Full-time', 3, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Product Designer to scale our core platform infrastructure.', 'Low', '2026-11-13T09:39:52.884Z'::timestamptz, 'Interviewing', '44444444-4444-4444-8444-444444444444', '2026-10-09T09:39:52.884Z'::timestamptz),
  ('086315f5-8b5f-4f47-8440-9804e327f3ac', 'DevOps Platform Engineer', 'Data & Analytics', 'Bengaluru, India', 'Full-time', 3, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced DevOps Platform Engineer to scale our core platform infrastructure.', 'Normal', '2026-11-13T09:39:52.884Z'::timestamptz, 'Offer Stage', '55555555-5555-4555-8555-555555555555', '2026-10-08T09:39:52.884Z'::timestamptz),
  ('5aa81d52-09a0-483a-82b6-e251ee4ad883', 'QA Automation Lead', 'Engineering', 'Gurugram, India', 'Full-time', 3, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced QA Automation Lead to scale our core platform infrastructure.', 'High', '2026-11-13T09:39:52.884Z'::timestamptz, 'Filled', '11111111-1111-4111-8111-111111111111', '2026-10-07T09:39:52.884Z'::timestamptz),
  ('ea55beec-a12e-4901-8a02-8ba3b35bada9', 'Mobile App Engineer (iOS/Android)', 'People Operations', 'Bengaluru, India', 'Full-time', 2, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Mobile App Engineer (iOS/Android) to scale our core platform infrastructure.', 'Low', '2026-11-13T09:39:52.884Z'::timestamptz, 'On Hold', '22222222-2222-4222-8222-222222222222', '2026-10-06T09:39:52.884Z'::timestamptz),
  ('43f6eac8-973b-440a-82ff-e50e6ffd46d5', 'Data Analyst', 'Product', 'Gurugram, India', 'Full-time', 2, 3, 7, 15, 25, ARRAY['React', 'TypeScript', 'Node.js']::text[], ARRAY['Docker', 'Next.js', 'PostgreSQL']::text[], 'Seeking an experienced Data Analyst to scale our core platform infrastructure.', 'Normal', '2026-11-13T09:39:52.884Z'::timestamptz, 'Closed', '33333333-3333-4333-8333-333333333333', '2026-10-05T09:39:52.884Z'::timestamptz);

-- 6. Seed Candidates
-- ---------------------------------------------------------
INSERT INTO candidates (id, opening_id, name, email, phone, current_company, "current_role", experience_years, notice_period, expected_ctc, source, profile_url, resume_file_name, hr_notes, stage, manager_decision, manager_comment, interview_date, interview_mode, interview_outcome, interview_note) VALUES
  ('eb919f28-ebbb-454c-9cde-88cabce56190', '5fb9220d-9b0f-4d32-a248-6492457c3890', 'Aarav Sharma', 'aarav.sharma@example.com', '+91 9852500831', 'Infosys', 'Senior Software Engineer', 7, '30 Days', 26, 'LinkedIn', 'https://linkedin.com/in/example', 'Aarav_Sharma_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Sourced', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('391088ab-f85c-4471-a0fd-b62248ba4fb8', '1ffc41a7-170e-44a4-b882-fcfe9e130564', 'Aditi Verma', 'aditi.verma@example.com', '+91 9842370100', 'Tata Consultancy Services', 'Senior Software Engineer', 9, '30 Days', 25, 'Naukri', 'https://linkedin.com/in/example', 'Aditi_Verma_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Shared with Manager', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('71772669-a05a-48da-821a-09f96a78f6fe', '482c1fc3-0dbb-4c15-b1d9-5145bae71bc8', 'Rohan Mehta', 'rohan.mehta@example.com', '+91 9801006038', 'Wipro', 'Senior Software Engineer', 3, '30 Days', 26, 'Indeed', 'https://linkedin.com/in/example', 'Rohan_Mehta_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Interview', 'Pending', NULL, '2026-10-16T09:39:52.885Z'::timestamptz, 'Video', 'Pending', NULL),
  ('41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', '86010a58-e36c-4314-b2ec-adc2e8ce5136', 'Neha Iyer', 'neha.iyer@example.com', '+91 9839956423', 'Razorpay', 'Senior Software Engineer', 8, '30 Days', 26, 'Referral', 'https://linkedin.com/in/example', 'Neha_Iyer_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Selected', 'Shortlisted', NULL, NULL, NULL, 'Selected', NULL),
  ('cc17087e-512c-4911-bb1d-b11f55dffc61', '086315f5-8b5f-4f47-8440-9804e327f3ac', 'Karan Patel', 'karan.patel@example.com', '+91 9854914040', 'Swiggy', 'Senior Software Engineer', 3, '30 Days', 19, 'Other', 'https://linkedin.com/in/example', 'Karan_Patel_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Offer Sent', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', '5aa81d52-09a0-483a-82b6-e251ee4ad883', 'Sneha Kulkarni', 'sneha.kulkarni@example.com', '+91 9821435099', 'Zomato', 'Senior Software Engineer', 8, '30 Days', 23, 'LinkedIn', 'https://linkedin.com/in/example', 'Sneha_Kulkarni_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Joined', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('4da2edfb-96ed-4006-bcf2-96fdd7640ddf', 'ea55beec-a12e-4901-8a02-8ba3b35bada9', 'Vikram Rao', 'vikram.rao@example.com', '+91 9857982419', 'Flipkart', 'Senior Software Engineer', 7, '30 Days', 20, 'Naukri', 'https://linkedin.com/in/example', 'Vikram_Rao_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Rejected', 'Rejected', 'Experience in distributed systems did not meet bar.', NULL, NULL, 'Pending', NULL),
  ('a951a8c8-d88e-4620-ac9b-3205966e58c6', '43f6eac8-973b-440a-82ff-e50e6ffd46d5', 'Pooja Nair', 'pooja.nair@example.com', '+91 9889194249', 'CRED', 'Senior Software Engineer', 6, '30 Days', 21, 'Indeed', 'https://linkedin.com/in/example', 'Pooja_Nair_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Sourced', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('a312222a-25e7-4a23-b024-2117358b0ca1', '5fb9220d-9b0f-4d32-a248-6492457c3890', 'Devendra Singh', 'devendra.singh@example.com', '+91 9890287123', 'Zerodha', 'Senior Software Engineer', 6, '30 Days', 24, 'Referral', 'https://linkedin.com/in/example', 'Devendra_Singh_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Shared with Manager', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('57b04be8-8178-4346-8053-51e9ac7189b6', '1ffc41a7-170e-44a4-b882-fcfe9e130564', 'Ritu Saxena', 'ritu.saxena@example.com', '+91 9823653962', 'PhonePe', 'Senior Software Engineer', 3, '30 Days', 19, 'Other', 'https://linkedin.com/in/example', 'Ritu_Saxena_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Interview', 'Pending', NULL, '2026-10-16T09:39:52.885Z'::timestamptz, 'Video', 'Pending', NULL),
  ('32242e18-6f16-4fdd-942a-e894c2568319', '482c1fc3-0dbb-4c15-b1d9-5145bae71bc8', 'Gaurav Joshi', 'gaurav.joshi@example.com', '+91 9851450310', 'Infosys', 'Senior Software Engineer', 10, '30 Days', 21, 'LinkedIn', 'https://linkedin.com/in/example', 'Gaurav_Joshi_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Selected', 'Shortlisted', NULL, NULL, NULL, 'Selected', NULL),
  ('c4ac9765-edf1-4bf2-b1b9-d2c322da85e6', '86010a58-e36c-4314-b2ec-adc2e8ce5136', 'Kavita Reddy', 'kavita.reddy@example.com', '+91 9843437528', 'Tata Consultancy Services', 'Senior Software Engineer', 6, '30 Days', 23, 'Naukri', 'https://linkedin.com/in/example', 'Kavita_Reddy_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Offer Sent', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('e91fa52c-98ec-4243-ab09-ce5d1d26c23b', '086315f5-8b5f-4f47-8440-9804e327f3ac', 'Amit Choudhury', 'amit.choudhury@example.com', '+91 9866523195', 'Wipro', 'Senior Software Engineer', 6, '30 Days', 23, 'Indeed', 'https://linkedin.com/in/example', 'Amit_Choudhury_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Joined', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('f29890de-9beb-4299-96be-e71fd1ed8960', '5aa81d52-09a0-483a-82b6-e251ee4ad883', 'Meera Bhatt', 'meera.bhatt@example.com', '+91 9880335933', 'Razorpay', 'Senior Software Engineer', 8, '30 Days', 22, 'Referral', 'https://linkedin.com/in/example', 'Meera_Bhatt_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Rejected', 'Rejected', 'Experience in distributed systems did not meet bar.', NULL, NULL, 'Pending', NULL),
  ('372276e5-9a0a-42f2-b61f-891b3e330791', 'ea55beec-a12e-4901-8a02-8ba3b35bada9', 'Anish Kapoor', 'anish.kapoor@example.com', '+91 9845445118', 'Swiggy', 'Senior Software Engineer', 10, '30 Days', 22, 'Other', 'https://linkedin.com/in/example', 'Anish_Kapoor_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Sourced', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('4a602ba0-33a0-41c2-8a31-3bdd6a34e013', '43f6eac8-973b-440a-82ff-e50e6ffd46d5', 'Tanvi Deshmukh', 'tanvi.deshmukh@example.com', '+91 9815488323', 'Zomato', 'Senior Software Engineer', 7, '30 Days', 20, 'LinkedIn', 'https://linkedin.com/in/example', 'Tanvi_Deshmukh_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Shared with Manager', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('96864fc2-d7ec-4604-a8a4-2df8240e1948', '5fb9220d-9b0f-4d32-a248-6492457c3890', 'Siddharth Jain', 'siddharth.jain@example.com', '+91 9882019856', 'Flipkart', 'Senior Software Engineer', 8, '30 Days', 19, 'Naukri', 'https://linkedin.com/in/example', 'Siddharth_Jain_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Interview', 'Pending', NULL, '2026-10-16T09:39:52.886Z'::timestamptz, 'Video', 'Pending', NULL),
  ('e66802b1-9364-45b4-897a-eb30490795c1', '1ffc41a7-170e-44a4-b882-fcfe9e130564', 'Deepika Pillai', 'deepika.pillai@example.com', '+91 9874642876', 'CRED', 'Senior Software Engineer', 5, '30 Days', 24, 'Indeed', 'https://linkedin.com/in/example', 'Deepika_Pillai_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Selected', 'Shortlisted', NULL, NULL, NULL, 'Selected', NULL),
  ('51e2f728-dbca-4bd3-b73f-f0be29e0b4ef', '482c1fc3-0dbb-4c15-b1d9-5145bae71bc8', 'Manoj Tiwari', 'manoj.tiwari@example.com', '+91 9848838052', 'Zerodha', 'Senior Software Engineer', 3, '30 Days', 18, 'Referral', 'https://linkedin.com/in/example', 'Manoj_Tiwari_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Offer Sent', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('b5b158c5-ae93-40d0-ad8f-cf5c67adfc66', '86010a58-e36c-4314-b2ec-adc2e8ce5136', 'Shreya Sengupta', 'shreya.sengupta@example.com', '+91 9821322200', 'PhonePe', 'Senior Software Engineer', 10, '30 Days', 22, 'Other', 'https://linkedin.com/in/example', 'Shreya_Sengupta_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Joined', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('6a3fc16e-f792-4f3f-9a98-3232c50feef2', '086315f5-8b5f-4f47-8440-9804e327f3ac', 'Harsh Vardhan', 'harsh.vardhan@example.com', '+91 9876182255', 'Infosys', 'Senior Software Engineer', 7, '30 Days', 19, 'LinkedIn', 'https://linkedin.com/in/example', 'Harsh_Vardhan_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Rejected', 'Rejected', 'Experience in distributed systems did not meet bar.', NULL, NULL, 'Pending', NULL),
  ('e42efdca-8165-44b7-a13a-1d779d5a94ec', '5aa81d52-09a0-483a-82b6-e251ee4ad883', 'Divya Menon', 'divya.menon@example.com', '+91 9888786667', 'Tata Consultancy Services', 'Senior Software Engineer', 4, '30 Days', 27, 'Naukri', 'https://linkedin.com/in/example', 'Divya_Menon_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Sourced', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('d0d25b2d-d804-49fa-94a8-c1c8f5ae1eb1', 'ea55beec-a12e-4901-8a02-8ba3b35bada9', 'Kunal Ghosh', 'kunal.ghosh@example.com', '+91 9870536089', 'Wipro', 'Senior Software Engineer', 10, '30 Days', 26, 'Indeed', 'https://linkedin.com/in/example', 'Kunal_Ghosh_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Shared with Manager', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('2c0057ca-74f6-472c-9b31-aa4f26f6a64f', '43f6eac8-973b-440a-82ff-e50e6ffd46d5', 'Preeti Agarwal', 'preeti.agarwal@example.com', '+91 9882206384', 'Razorpay', 'Senior Software Engineer', 10, '30 Days', 20, 'Referral', 'https://linkedin.com/in/example', 'Preeti_Agarwal_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Interview', 'Pending', NULL, '2026-10-16T09:39:52.886Z'::timestamptz, 'Video', 'Pending', NULL),
  ('dccdca20-e9c7-412a-a637-194c47016794', '5fb9220d-9b0f-4d32-a248-6492457c3890', 'Rajesh Nambiar', 'rajesh.nambiar@example.com', '+91 9887041291', 'Swiggy', 'Senior Software Engineer', 6, '30 Days', 24, 'Other', 'https://linkedin.com/in/example', 'Rajesh_Nambiar_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Selected', 'Shortlisted', NULL, NULL, NULL, 'Selected', NULL),
  ('b8058150-1629-4bc3-b21a-b0e08bdbc5d1', '1ffc41a7-170e-44a4-b882-fcfe9e130564', 'Swati Dubey', 'swati.dubey@example.com', '+91 9858465700', 'Zomato', 'Senior Software Engineer', 4, '30 Days', 19, 'LinkedIn', 'https://linkedin.com/in/example', 'Swati_Dubey_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Offer Sent', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('d3f52ca7-8b3f-4fa3-9a10-47dbb655f0d9', '482c1fc3-0dbb-4c15-b1d9-5145bae71bc8', 'Nikhil Anand', 'nikhil.anand@example.com', '+91 9874894259', 'Flipkart', 'Senior Software Engineer', 4, '30 Days', 24, 'Naukri', 'https://linkedin.com/in/example', 'Nikhil_Anand_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Joined', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('ab2be23f-2d73-4d78-a592-6f4a5c2f7312', '86010a58-e36c-4314-b2ec-adc2e8ce5136', 'Rashmi Hegde', 'rashmi.hegde@example.com', '+91 9838426711', 'CRED', 'Senior Software Engineer', 3, '30 Days', 26, 'Indeed', 'https://linkedin.com/in/example', 'Rashmi_Hegde_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Rejected', 'Rejected', 'Experience in distributed systems did not meet bar.', NULL, NULL, 'Pending', NULL),
  ('a7dc9d31-408e-4017-8e58-02ff0fad787a', '086315f5-8b5f-4f47-8440-9804e327f3ac', 'Abhishek Sinha', 'abhishek.sinha@example.com', '+91 9803726906', 'Zerodha', 'Senior Software Engineer', 6, '30 Days', 27, 'Referral', 'https://linkedin.com/in/example', 'Abhishek_Sinha_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Sourced', 'Pending', NULL, NULL, NULL, 'Pending', NULL),
  ('2bdfa79d-90eb-4a3a-a6a1-af0f6dc9be65', '5aa81d52-09a0-483a-82b6-e251ee4ad883', 'Pallavi Sen', 'pallavi.sen@example.com', '+91 9887748150', 'PhonePe', 'Senior Software Engineer', 5, '30 Days', 22, 'Other', 'https://linkedin.com/in/example', 'Pallavi_Sen_Resume.pdf', 'Strong communication skills and deep domain proficiency.', 'Shared with Manager', 'Pending', NULL, NULL, NULL, 'Pending', NULL);

-- 7. Seed Onboarding Items
-- ---------------------------------------------------------
INSERT INTO onboarding_items (id, candidate_id, title, owner, phase, due_date, done, status, notes) VALUES
  ('6b673531-9a97-46d8-a705-66989cdbf030', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Collect documents (PAN, Aadhaar, Degree)', 'HR', 'Before joining', '2026-10-09T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('e3e0e517-444c-4849-ab46-12a28b194f7c', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Create email and system accounts', 'HR', 'Before joining', '2026-10-11T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('0af9de33-96de-453c-a4d6-a19792bd310a', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Arrange laptop and desk setup', 'HR', 'Before joining', '2026-10-12T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('83697f2b-66bb-4f21-ab94-11e3535181c3', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Prepare first-week plan', 'Manager', 'Before joining', '2026-10-13T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('ea855afa-8b70-48f2-ab38-17c5ace362fe', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Welcome and orientation', 'HR', 'Day 1', '2026-10-14T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('d891c2dc-b044-451e-b846-798e7fd3e1d6', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Introduce team and assign a buddy', 'Manager', 'Day 1', '2026-10-14T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('dcc4162b-5fad-42de-979c-28625102f8f6', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', '30-day check-in', 'Manager', 'First 30 days', '2026-11-13T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('871a39a2-0c70-4f0b-9f32-141b08fd9498', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Collect documents (PAN, Aadhaar, Degree)', 'HR', 'Before joining', '2026-10-09T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('2e7356db-c067-404c-8283-03fcf7187d17', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Create email and system accounts', 'HR', 'Before joining', '2026-10-11T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('5b7667ce-fc5b-474d-80e7-aaea9182b8a0', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Arrange laptop and desk setup', 'HR', 'Before joining', '2026-10-12T09:39:52.886Z'::timestamptz, true, 'Done', NULL),
  ('b110fb54-5ca2-421a-8c40-1f4c96319ca8', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Prepare first-week plan', 'Manager', 'Before joining', '2026-10-13T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('fc4f99bc-a25e-4356-979f-313ea4ddde4c', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Welcome and orientation', 'HR', 'Day 1', '2026-10-14T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('dbca28fe-022b-4d38-adb8-9849bdac2703', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Introduce team and assign a buddy', 'Manager', 'Day 1', '2026-10-14T09:39:52.886Z'::timestamptz, false, 'Pending', NULL),
  ('f16c38b9-35c8-40c0-9b3f-5524ef57be96', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', '30-day check-in', 'Manager', 'First 30 days', '2026-11-13T09:39:52.886Z'::timestamptz, false, 'Pending', NULL);

-- 8. Seed Activities
-- ---------------------------------------------------------
INSERT INTO activities (id, entity_type, entity_id, actor, message, timestamp) VALUES
  ('b095c197-a198-489a-8c4d-7105cbc87256', 'candidate', 'eb919f28-ebbb-454c-9cde-88cabce56190', 'Priya Sharma (HR)', 'Updated candidate Aarav Sharma status to Sourced.', '2026-10-14T05:39:52.886Z'::timestamptz),
  ('39bfea6a-c16d-4699-b255-00d484f46dd2', 'candidate', '391088ab-f85c-4471-a0fd-b62248ba4fb8', 'Arjun Kapoor (Manager)', 'Updated candidate Aditi Verma status to Shared with Manager.', '2026-10-14T01:39:52.886Z'::timestamptz),
  ('7721b76b-c292-4caf-b104-43e34c7c1701', 'candidate', '71772669-a05a-48da-821a-09f96a78f6fe', 'Priya Sharma (HR)', 'Updated candidate Rohan Mehta status to Interview.', '2026-10-13T21:39:52.886Z'::timestamptz),
  ('2865e0af-8e06-44bf-84a3-97f951234d88', 'candidate', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Arjun Kapoor (Manager)', 'Updated candidate Neha Iyer status to Selected.', '2026-10-13T17:39:52.886Z'::timestamptz),
  ('db1b8177-2fda-476a-b808-c70c3425c83e', 'candidate', 'cc17087e-512c-4911-bb1d-b11f55dffc61', 'Priya Sharma (HR)', 'Updated candidate Karan Patel status to Offer Sent.', '2026-10-13T13:39:52.886Z'::timestamptz),
  ('d37fc017-e871-4ad6-9cf3-84c9ac6e82bc', 'candidate', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Arjun Kapoor (Manager)', 'Updated candidate Sneha Kulkarni status to Joined.', '2026-10-13T09:39:52.886Z'::timestamptz),
  ('de4f232e-a279-41ec-88f6-faa2e62088be', 'candidate', '4da2edfb-96ed-4006-bcf2-96fdd7640ddf', 'Priya Sharma (HR)', 'Updated candidate Vikram Rao status to Rejected.', '2026-10-13T05:39:52.886Z'::timestamptz),
  ('b2dd8b57-d757-4d52-8bd1-3257ba95d7fa', 'candidate', 'a951a8c8-d88e-4620-ac9b-3205966e58c6', 'Arjun Kapoor (Manager)', 'Updated candidate Pooja Nair status to Sourced.', '2026-10-13T01:39:52.886Z'::timestamptz),
  ('a5a12d3d-4ab8-4430-a4af-dcca4ea8177d', 'candidate', 'a312222a-25e7-4a23-b024-2117358b0ca1', 'Priya Sharma (HR)', 'Updated candidate Devendra Singh status to Shared with Manager.', '2026-10-12T21:39:52.886Z'::timestamptz),
  ('6f160be4-d4ec-4c0f-9b4d-4d1b81307494', 'candidate', '57b04be8-8178-4346-8053-51e9ac7189b6', 'Arjun Kapoor (Manager)', 'Updated candidate Ritu Saxena status to Interview.', '2026-10-12T17:39:52.886Z'::timestamptz),
  ('b0eda9e2-13c0-49fd-b81d-911eade98656', 'candidate', '32242e18-6f16-4fdd-942a-e894c2568319', 'Priya Sharma (HR)', 'Updated candidate Gaurav Joshi status to Selected.', '2026-10-12T13:39:52.886Z'::timestamptz),
  ('9e79a9b3-8167-4af9-9b8a-1457024f5739', 'candidate', 'c4ac9765-edf1-4bf2-b1b9-d2c322da85e6', 'Arjun Kapoor (Manager)', 'Updated candidate Kavita Reddy status to Offer Sent.', '2026-10-12T09:39:52.886Z'::timestamptz),
  ('38003015-c984-4e61-a915-8d7bf24666eb', 'candidate', 'e91fa52c-98ec-4243-ab09-ce5d1d26c23b', 'Priya Sharma (HR)', 'Updated candidate Amit Choudhury status to Joined.', '2026-10-12T05:39:52.886Z'::timestamptz),
  ('4dfd0a04-09a1-4675-b16c-115faa590ae9', 'candidate', 'f29890de-9beb-4299-96be-e71fd1ed8960', 'Arjun Kapoor (Manager)', 'Updated candidate Meera Bhatt status to Rejected.', '2026-10-12T01:39:52.886Z'::timestamptz),
  ('b1e18206-4790-4185-9bad-b6a44c7cdde6', 'candidate', '372276e5-9a0a-42f2-b61f-891b3e330791', 'Priya Sharma (HR)', 'Updated candidate Anish Kapoor status to Sourced.', '2026-10-11T21:39:52.886Z'::timestamptz),
  ('959bb526-2e52-40aa-b516-4a953f7b2708', 'candidate', '4a602ba0-33a0-41c2-8a31-3bdd6a34e013', 'Arjun Kapoor (Manager)', 'Updated candidate Tanvi Deshmukh status to Shared with Manager.', '2026-10-11T17:39:52.886Z'::timestamptz),
  ('600620c7-4e1f-45e9-9df4-f6658288cd74', 'candidate', '96864fc2-d7ec-4604-a8a4-2df8240e1948', 'Priya Sharma (HR)', 'Updated candidate Siddharth Jain status to Interview.', '2026-10-11T13:39:52.886Z'::timestamptz),
  ('3054f859-27a7-46fe-b999-360783feb8d2', 'candidate', 'e66802b1-9364-45b4-897a-eb30490795c1', 'Arjun Kapoor (Manager)', 'Updated candidate Deepika Pillai status to Selected.', '2026-10-11T09:39:52.886Z'::timestamptz),
  ('1c4ef27f-7d96-443c-b687-9df6dc9f31d7', 'candidate', '51e2f728-dbca-4bd3-b73f-f0be29e0b4ef', 'Priya Sharma (HR)', 'Updated candidate Manoj Tiwari status to Offer Sent.', '2026-10-11T05:39:52.886Z'::timestamptz),
  ('e0e78ae0-7bbb-4245-bc43-f0fad40bdb2c', 'candidate', 'b5b158c5-ae93-40d0-ad8f-cf5c67adfc66', 'Arjun Kapoor (Manager)', 'Updated candidate Shreya Sengupta status to Joined.', '2026-10-11T01:39:52.886Z'::timestamptz),
  ('acd91716-6151-4cf1-9f84-18cb016434ce', 'candidate', '6a3fc16e-f792-4f3f-9a98-3232c50feef2', 'Priya Sharma (HR)', 'Updated candidate Harsh Vardhan status to Rejected.', '2026-10-10T21:39:52.886Z'::timestamptz),
  ('e573af95-a1e8-4799-81a3-bdc882c4742a', 'candidate', 'e42efdca-8165-44b7-a13a-1d779d5a94ec', 'Arjun Kapoor (Manager)', 'Updated candidate Divya Menon status to Sourced.', '2026-10-10T17:39:52.886Z'::timestamptz),
  ('b50804b1-d03b-4515-84d5-ce6e6f1a76ab', 'candidate', 'd0d25b2d-d804-49fa-94a8-c1c8f5ae1eb1', 'Priya Sharma (HR)', 'Updated candidate Kunal Ghosh status to Shared with Manager.', '2026-10-10T13:39:52.886Z'::timestamptz),
  ('2bafcfb4-1ca0-45f8-a673-550c6dd3a7e3', 'candidate', '2c0057ca-74f6-472c-9b31-aa4f26f6a64f', 'Arjun Kapoor (Manager)', 'Updated candidate Preeti Agarwal status to Interview.', '2026-10-10T09:39:52.886Z'::timestamptz),
  ('942ab5a6-b3e4-4501-b84d-065016768907', 'candidate', 'dccdca20-e9c7-412a-a637-194c47016794', 'Priya Sharma (HR)', 'Updated candidate Rajesh Nambiar status to Selected.', '2026-10-10T05:39:52.886Z'::timestamptz),
  ('8a4cc8f2-0cc1-4404-9c85-504afd0ecc76', 'candidate', 'b8058150-1629-4bc3-b21a-b0e08bdbc5d1', 'Arjun Kapoor (Manager)', 'Updated candidate Swati Dubey status to Offer Sent.', '2026-10-10T01:39:52.886Z'::timestamptz),
  ('1337b70f-fcf8-4f15-9332-9c92ca6a45e4', 'candidate', 'd3f52ca7-8b3f-4fa3-9a10-47dbb655f0d9', 'Priya Sharma (HR)', 'Updated candidate Nikhil Anand status to Joined.', '2026-10-09T21:39:52.886Z'::timestamptz),
  ('eb020a72-f838-4a14-8c78-602730dfcd3f', 'candidate', 'ab2be23f-2d73-4d78-a592-6f4a5c2f7312', 'Arjun Kapoor (Manager)', 'Updated candidate Rashmi Hegde status to Rejected.', '2026-10-09T17:39:52.886Z'::timestamptz),
  ('ffbf9469-19f3-4cef-8f8f-c27b3aa29c70', 'candidate', 'a7dc9d31-408e-4017-8e58-02ff0fad787a', 'Priya Sharma (HR)', 'Updated candidate Abhishek Sinha status to Sourced.', '2026-10-09T13:39:52.886Z'::timestamptz),
  ('5e3a35db-1607-4a14-96ef-0c56cef95c49', 'candidate', '2bdfa79d-90eb-4a3a-a6a1-af0f6dc9be65', 'Arjun Kapoor (Manager)', 'Updated candidate Pallavi Sen status to Shared with Manager.', '2026-10-09T09:39:52.886Z'::timestamptz),
  ('a33e1830-02d4-4f96-998c-45efe6c77392', 'candidate', 'eb919f28-ebbb-454c-9cde-88cabce56190', 'Priya Sharma (HR)', 'Updated candidate Aarav Sharma status to Sourced.', '2026-10-09T05:39:52.886Z'::timestamptz),
  ('d311f86c-d5bc-4a2e-8846-02c0680f3443', 'candidate', '391088ab-f85c-4471-a0fd-b62248ba4fb8', 'Arjun Kapoor (Manager)', 'Updated candidate Aditi Verma status to Shared with Manager.', '2026-10-09T01:39:52.886Z'::timestamptz),
  ('bf3abd64-5bd2-45ec-9fc6-9a18b2c9f049', 'candidate', '71772669-a05a-48da-821a-09f96a78f6fe', 'Priya Sharma (HR)', 'Updated candidate Rohan Mehta status to Interview.', '2026-10-08T21:39:52.886Z'::timestamptz),
  ('bc1885ed-bb7e-4bbd-a4c3-55fdbb8f762c', 'candidate', '41baebc4-2ccf-465c-85ed-6cc1e8d5e60e', 'Arjun Kapoor (Manager)', 'Updated candidate Neha Iyer status to Selected.', '2026-10-08T17:39:52.886Z'::timestamptz),
  ('60d0bf73-bd8f-408b-ad2c-862d244dac49', 'candidate', 'cc17087e-512c-4911-bb1d-b11f55dffc61', 'Priya Sharma (HR)', 'Updated candidate Karan Patel status to Offer Sent.', '2026-10-08T13:39:52.886Z'::timestamptz),
  ('de0a0844-595b-461c-946a-505faaa36c14', 'candidate', 'ab9f54d3-f0f0-4e8f-a18f-8ab7a9e04fe7', 'Arjun Kapoor (Manager)', 'Updated candidate Sneha Kulkarni status to Joined.', '2026-10-08T09:39:52.886Z'::timestamptz),
  ('6f182f16-bb65-4643-8744-af911f4199a4', 'candidate', '4da2edfb-96ed-4006-bcf2-96fdd7640ddf', 'Priya Sharma (HR)', 'Updated candidate Vikram Rao status to Rejected.', '2026-10-08T05:39:52.886Z'::timestamptz),
  ('f4ab9549-df12-4fbe-839b-a60947f6d3af', 'candidate', 'a951a8c8-d88e-4620-ac9b-3205966e58c6', 'Arjun Kapoor (Manager)', 'Updated candidate Pooja Nair status to Sourced.', '2026-10-08T01:39:52.886Z'::timestamptz),
  ('061be646-b099-4a3b-b13e-b0334317b9a1', 'candidate', 'a312222a-25e7-4a23-b024-2117358b0ca1', 'Priya Sharma (HR)', 'Updated candidate Devendra Singh status to Shared with Manager.', '2026-10-07T21:39:52.886Z'::timestamptz),
  ('dcde839b-b815-4e98-945e-ac7a3b67ae1d', 'candidate', '57b04be8-8178-4346-8053-51e9ac7189b6', 'Arjun Kapoor (Manager)', 'Updated candidate Ritu Saxena status to Interview.', '2026-10-07T17:39:52.886Z'::timestamptz);

-- 9. Seed Notifications
-- ---------------------------------------------------------
INSERT INTO notifications (id, recipient_role, title, message, timestamp, read) VALUES
  ('n1111111-1111-1111-1111-111111111111'::uuid, 'manager', '3 Candidates Shortlisted', 'Hiring Manager shortlisted 3 candidates for Senior Backend Engineer.', now(), false),
  ('n2222222-2222-2222-2222-222222222222'::uuid, 'manager', 'New Opening Submitted', 'Frontend Tech Lead opening has been created and awaits sourcing.', now() - interval '1 hour', true),
  ('n3333333-3333-3333-3333-333333333333'::uuid, 'manager', 'Interview Scheduled', 'Technical round with Rohan Mehta confirmed for tomorrow.', now() - interval '2 hours', true);
