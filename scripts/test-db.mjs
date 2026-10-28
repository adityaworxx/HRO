import fs from 'node:fs';

const SUPABASE_URL = 'https://ijcesduxnbgxjcteejbk.supabase.co';
const envContent = fs.readFileSync('.env.local', 'utf-8');
let anonKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    anonKey = line.split('=')[1].trim();
  }
}

async function check() {
  const cRes = await fetch(SUPABASE_URL + '/rest/v1/candidates?select=*', {
    headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
  });
  const cData = await cRes.json();
  const oRes = await fetch(SUPABASE_URL + '/rest/v1/openings?select=*', {
    headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
  });
  const oData = await oRes.json();
  console.log('Candidates response status:', cRes.status, 'Is array:', Array.isArray(cData));
  if (!Array.isArray(cData)) {
    console.log('Candidates error:', cData);
  } else {
    console.log('Candidates count:', cData.length);
  }
  console.log('Openings response status:', oRes.status, 'Is array:', Array.isArray(oData));
  if (!Array.isArray(oData)) {
    console.log('Openings error:', oData);
  } else {
    console.log('Openings count:', oData.length);
  }

  if (Array.isArray(cData) && Array.isArray(oData)) {
    const interviewCandidates = cData.filter(c => c.stage === 'Interview');
    console.log('Interview count:', interviewCandidates.length);
    console.log('Interview sample:', interviewCandidates.slice(0, 5).map(c => ({ id: c.id, name: c.name, opening_id: c.opening_id })));
    console.log('Openings:', oData.map(o => ({ id: o.id, title: o.title, department: o.department })));
  }
}

check();
