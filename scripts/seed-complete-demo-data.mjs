import { resetSupabaseDemoData, DEMO_OPENINGS, DEMO_CANDIDATES } from '../lib/demo-data.ts';

async function main() {
  console.log('🚀 Seeding comprehensive demo data into Supabase via resetSupabaseDemoData()...');
  const t0 = Date.now();
  await resetSupabaseDemoData();
  const sourced = DEMO_CANDIDATES.filter((c) => c.stage === 'Sourced');
  console.log(`✓ Seeded ${DEMO_OPENINGS.length} Openings, ${DEMO_CANDIDATES.length} Candidates (${sourced.length} in Sourced) in ${Date.now() - t0}ms`);
}

main().catch((err) => {
  console.error('Failed to seed Supabase demo data:', err);
  process.exit(1);
});
