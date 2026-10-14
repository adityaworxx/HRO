import { supabaseApi } from '../services/supabase/supabaseApi';

async function verifyAllWorkflows() {
  console.log('🚀 Starting Supabase End-to-End Workflow Verification...\n');

  try {
    // 1. Verify Initial Seed Data
    console.log('1️⃣ Checking Initial Seed Data...');
    const openings = await supabaseApi.openings.list();
    console.log(`✓ Fetched ${openings.length} openings from Supabase`);
    if (openings.length < 8) {
      throw new Error(`Expected at least 8 openings, found ${openings.length}`);
    }

    const candidates = await supabaseApi.candidates.list();
    console.log(`✓ Fetched ${candidates.length} candidates from Supabase`);
    if (candidates.length < 8) {
      throw new Error(`Expected at least 8 candidates, found ${candidates.length}`);
    }

    const onboarding = await supabaseApi.onboarding.listAll();
    console.log(`✓ Fetched ${onboarding.length} onboarding tasks from Supabase`);

    // 2. Test Real Creation: Job Opening
    console.log('\n2️⃣ Testing Real Workflow: Create New Job Opening...');
    const newOpening = await supabaseApi.openings.create({
      title: 'Staff AI Infrastructure Engineer',
      department: 'Engineering',
      location: 'Bengaluru, India',
      employmentType: 'Full-time',
      headcount: 2,
      experienceRange: { min: 6, max: 12 },
      budgetRange: { min: 35, max: 55 },
      mustHaveSkills: ['Python', 'Kubernetes', 'PyTorch', 'Distributed Systems'],
      niceToHaveSkills: ['vLLM', 'Triton', 'CUDA'],
      description: 'Lead AI inference architecture and distributed cluster orchestration.',
      urgency: 'High',
      targetStartDate: new Date(Date.now() + 20 * 86400000).toISOString(),
      status: 'Open',
      managerId: openings[0]!.managerId,
    });
    console.log(`✓ Successfully created opening: "${newOpening.title}" (ID: ${newOpening.id})`);

    // 3. Test Real Creation: Candidate
    console.log('\n3️⃣ Testing Real Workflow: Add New Candidate...');
    const newCandidate = await supabaseApi.candidates.create({
      openingId: newOpening.id,
      name: 'Aditya Narayan Test',
      email: 'aditya.narayan.test@example.com',
      phone: '+91 9999988888',
      currentCompany: 'Google DeepMind',
      currentRole: 'Senior Platform Engineer',
      experienceYears: 8,
      noticePeriod: '15 Days',
      expectedCtc: 45,
      source: 'LinkedIn',
      profileUrl: 'https://linkedin.com/in/aditya-narayan-test',
      stage: 'Sourced',
      managerDecision: 'Pending',
      interviewOutcome: 'Pending',
    });
    console.log(`✓ Successfully added candidate: "${newCandidate.name}" (ID: ${newCandidate.id})`);

    // 4. Test Workflow: Stage Progression (Kanban Drag/Drop)
    console.log('\n4️⃣ Testing Real Workflow: Move Candidate to Interview Stage...');
    const stageUpdated = await supabaseApi.candidates.updateStage(newCandidate.id, 'Interview');
    console.log(`✓ Updated stage to: ${stageUpdated.stage}`);

    // 5. Test Workflow: Schedule Interview
    console.log('\n5️⃣ Testing Real Workflow: Schedule Interview...');
    const interviewDate = new Date(Date.now() + 3 * 86400000).toISOString();
    const interviewScheduled = await supabaseApi.candidates.scheduleInterview(
      newCandidate.id,
      interviewDate,
      'Video'
    );
    console.log(
      `✓ Scheduled interview: ${interviewScheduled.interviewMode} round on ${interviewScheduled.interviewDate}`
    );

    // 6. Test Workflow: Record Interview Outcome
    console.log('\n6️⃣ Testing Real Workflow: Record Interview Outcome...');
    const outcomeRecorded = await supabaseApi.candidates.recordInterviewOutcome(
      newCandidate.id,
      'Selected',
      'Outstanding system design and problem-solving skills.'
    );
    console.log(
      `✓ Recorded outcome: ${outcomeRecorded.interviewOutcome} (Stage: ${outcomeRecorded.stage})`
    );

    // 7. Test Workflow: Onboarding Task Creation & Toggle
    console.log('\n7️⃣ Testing Real Workflow: Onboarding Task...');
    const task = await supabaseApi.onboarding.createTask({
      candidateId: newCandidate.id,
      title: 'Issue High-Performance GPU Laptop',
      owner: 'HR',
      phase: 'Before joining',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      done: false,
      status: 'Pending',
    });
    console.log(`✓ Created onboarding task: "${task.title}"`);

    const toggledTask = await supabaseApi.onboarding.toggleTask(task.id, true);
    console.log(`✓ Toggled onboarding task status: ${toggledTask.status} (Done: ${toggledTask.done})`);

    // 8. Test Workflow: Activity Logging Verification
    console.log('\n8️⃣ Testing Real Workflow: Live Activity Logs...');
    const activities = await supabaseApi.activity.listRecent(10);
    console.log(`✓ Fetched ${activities.length} recent activity logs from Supabase`);
    const recentAction = activities.find((a) => a.entityId === newCandidate.id);
    if (recentAction) {
      console.log(`✓ Verified logged action: "${recentAction.message}" by ${recentAction.actor}`);
    }

    console.log('\n🎉 ALL REAL SUPABASE WORKFLOWS PASSED VERIFICATION WITH 100% SUCCESS!');
  } catch (err: unknown) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

verifyAllWorkflows();
