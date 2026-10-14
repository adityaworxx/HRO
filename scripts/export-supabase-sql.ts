import fs from 'node:fs';
import path from 'node:path';
import { generateSeedData } from './seed';
import { INITIAL_USERS } from '../fixtures/users';

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeArray(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const items = arr.map((item) => `'${item.replace(/'/g, "''")}'`).join(', ');
  return `ARRAY[${items}]::text[]`;
}

function generateCompleteSql(): string {
  const seed = generateSeedData();

  let sql = `-- =========================================================
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
`;

  const userValues = INITIAL_USERS.map(
    (u) =>
      `  (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.department)}, ${escapeSql(u.avatarInitials)})`
  ).join(',\n');
  sql += userValues + ';\n\n';

  // Seed Openings
  sql += '-- 5. Seed Openings\n-- ---------------------------------------------------------\n';
  sql += `INSERT INTO openings (id, title, department, location, employment_type, headcount, experience_min, experience_max, budget_min, budget_max, must_have_skills, nice_to_have_skills, description, urgency, target_start_date, status, manager_id, created_at) VALUES\n`;
  const openingValues = seed.openings
    .map(
      (o) =>
        `  (${escapeSql(o.id)}, ${escapeSql(o.title)}, ${escapeSql(o.department)}, ${escapeSql(o.location)}, ${escapeSql(o.employmentType)}, ${o.headcount}, ${o.experienceRange.min}, ${o.experienceRange.max}, ${o.budgetRange.min}, ${o.budgetRange.max}, ${escapeArray(o.mustHaveSkills)}, ${escapeArray(o.niceToHaveSkills)}, ${escapeSql(o.description)}, ${escapeSql(o.urgency)}, ${escapeSql(o.targetStartDate)}::timestamptz, ${escapeSql(o.status)}, ${escapeSql(o.managerId)}, ${escapeSql(o.createdAt)}::timestamptz)`
    )
    .join(',\n');
  sql += openingValues + ';\n\n';

  // Seed Candidates
  sql += '-- 6. Seed Candidates\n-- ---------------------------------------------------------\n';
  sql += `INSERT INTO candidates (id, opening_id, name, email, phone, current_company, "current_role", experience_years, notice_period, expected_ctc, source, profile_url, resume_file_name, hr_notes, stage, manager_decision, manager_comment, interview_date, interview_mode, interview_outcome, interview_note) VALUES\n`;
  const candidateValues = seed.candidates
    .map(
      (c) =>
        `  (${escapeSql(c.id)}, ${escapeSql(c.openingId)}, ${escapeSql(c.name)}, ${escapeSql(c.email)}, ${escapeSql(c.phone)}, ${escapeSql(c.currentCompany)}, ${escapeSql(c.currentRole)}, ${c.experienceYears}, ${escapeSql(c.noticePeriod)}, ${c.expectedCtc}, ${escapeSql(c.source)}, ${escapeSql(c.profileUrl)}, ${escapeSql(c.resumeFileName)}, ${escapeSql(c.hrNotes)}, ${escapeSql(c.stage)}, ${escapeSql(c.managerDecision)}, ${escapeSql(c.managerComment)}, ${c.interviewDate ? escapeSql(c.interviewDate) + '::timestamptz' : 'NULL'}, ${escapeSql(c.interviewMode)}, ${escapeSql(c.interviewOutcome)}, ${escapeSql(c.interviewNote)})`
    )
    .join(',\n');
  sql += candidateValues + ';\n\n';

  // Seed Onboarding Items
  sql +=
    '-- 7. Seed Onboarding Items\n-- ---------------------------------------------------------\n';
  sql += `INSERT INTO onboarding_items (id, candidate_id, title, owner, phase, due_date, done, status, notes) VALUES\n`;
  const onboardingValues = seed.onboarding
    .map(
      (ob) =>
        `  (${escapeSql(ob.id)}, ${escapeSql(ob.candidateId)}, ${escapeSql(ob.title)}, ${escapeSql(ob.owner)}, ${escapeSql(ob.phase)}, ${escapeSql(ob.dueDate)}::timestamptz, ${ob.done ? 'true' : 'false'}, ${escapeSql(ob.status)}, ${escapeSql(ob.notes)})`
    )
    .join(',\n');
  sql += onboardingValues + ';\n\n';

  // Seed Activities
  sql += '-- 8. Seed Activities\n-- ---------------------------------------------------------\n';
  sql += `INSERT INTO activities (id, entity_type, entity_id, actor, message, timestamp) VALUES\n`;
  const activityValues = seed.activities
    .map(
      (a) =>
        `  (${escapeSql(a.id)}, ${escapeSql(a.entityType)}, ${escapeSql(a.entityId)}, ${escapeSql(a.actor)}, ${escapeSql(a.message)}, ${escapeSql(a.timestamp)}::timestamptz)`
    )
    .join(',\n');
  sql += activityValues + ';\n\n';

  // Seed Sample Notifications
  sql +=
    '-- 9. Seed Notifications\n-- ---------------------------------------------------------\n';
  sql += `INSERT INTO notifications (id, recipient_role, title, message, timestamp, read) VALUES
  ('n1111111-1111-1111-1111-111111111111'::uuid, 'manager', '3 Candidates Shortlisted', 'Hiring Manager shortlisted 3 candidates for Senior Backend Engineer.', now(), false),
  ('n2222222-2222-2222-2222-222222222222'::uuid, 'manager', 'New Opening Submitted', 'Frontend Tech Lead opening has been created and awaits sourcing.', now() - interval '1 hour', true),
  ('n3333333-3333-3333-3333-333333333333'::uuid, 'manager', 'Interview Scheduled', 'Technical round with Rohan Mehta confirmed for tomorrow.', now() - interval '2 hours', true);
`;

  return sql;
}

const outputDir = path.join(process.cwd(), 'supabase');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sqlContent = generateCompleteSql();
const outputPath = path.join(outputDir, 'schema_and_seed.sql');
fs.writeFileSync(outputPath, sqlContent, 'utf-8');
console.log(`Generated migration script at: ${outputPath} (${sqlContent.length} bytes)`);

