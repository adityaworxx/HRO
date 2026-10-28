import fs from 'node:fs';

// 1. candidate-detail-sheet.tsx
{
  let content = fs.readFileSync(
    'features/candidates/components/candidate-detail-sheet.tsx',
    'utf8'
  );
  if (!content.includes('CandidateAvatar')) {
    content = content.replace(
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';",
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';\nimport { CandidateAvatar } from '@/components/hro/candidate-avatar';"
    );
  }
  content = content.replace(
    /<Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-4 border-surface-1 shadow-xl bg-surface-2 select-none ring-1 ring-border\/50">[\s\S]*?<\/Avatar>/,
    `<CandidateAvatar name={candidate.name} className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-4 border-surface-1 shadow-xl ring-1 ring-border/50" fallbackClassName="text-[24px]" />`
  );
  fs.writeFileSync('features/candidates/components/candidate-detail-sheet.tsx', content, 'utf8');
  console.log('Updated candidate-detail-sheet.tsx');
}

// 2. candidates-table.tsx
{
  let content = fs.readFileSync('features/candidates/components/candidates-table.tsx', 'utf8');
  if (!content.includes('CandidateAvatar')) {
    content = content.replace(
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';",
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';\nimport { CandidateAvatar } from '@/components/hro/candidate-avatar';"
    );
  }
  content = content.replace(
    /<Avatar className="h-7 w-7 border border-border\/60">[\s\S]*?<\/Avatar>/,
    `<CandidateAvatar name={candidate.name} size="sm" />`
  );
  fs.writeFileSync('features/candidates/components/candidates-table.tsx', content, 'utf8');
  console.log('Updated candidates-table.tsx');
}

// 3. interviews-view.tsx
{
  let content = fs.readFileSync('features/candidates/components/interviews-view.tsx', 'utf8');
  if (!content.includes('CandidateAvatar')) {
    content = content.replace(
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';",
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';\nimport { CandidateAvatar } from '@/components/hro/candidate-avatar';"
    );
  }
  content = content.replace(
    /<Avatar className="h-8\.5 w-8\.5 shrink-0 border border-border\/70 bg-surface-2 shadow-2xs">[\s\S]*?<\/Avatar>/,
    `<CandidateAvatar name={candidate.name} size="md" />`
  );
  fs.writeFileSync('features/candidates/components/interviews-view.tsx', content, 'utf8');
  console.log('Updated interviews-view.tsx');
}

// 4. hr-dashboard.tsx
{
  let content = fs.readFileSync('features/dashboard/components/hr-dashboard.tsx', 'utf8');
  if (!content.includes('CandidateAvatar')) {
    content = content.replace(
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';",
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';\nimport { CandidateAvatar } from '@/components/hro/candidate-avatar';"
    );
  }
  content = content.replace(
    /<Avatar className="h-7 w-7 border border-border\/70">[\s\S]*?<\/Avatar>/g,
    `<CandidateAvatar name={candidate.name} size="sm" />`
  );
  fs.writeFileSync('features/dashboard/components/hr-dashboard.tsx', content, 'utf8');
  console.log('Updated hr-dashboard.tsx');
}

// 5. onboarding-dashboard.tsx
{
  let content = fs.readFileSync('features/onboarding/components/onboarding-dashboard.tsx', 'utf8');
  if (!content.includes('CandidateAvatar')) {
    content = content.replace(
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';",
      "import { Avatar, AvatarFallback } from '@/components/ui/avatar';\nimport { CandidateAvatar } from '@/components/hro/candidate-avatar';"
    );
  }
  // replace candidate avatars
  content = content.replace(
    /<Avatar className="h-6 w-6">[\s\S]*?<AvatarFallback[\s\S]*?>[\s\S]*?{candidate\.name\.slice\(0, 2\)\.toUpperCase\(\)}[\s\S]*?<\/AvatarFallback>[\s\S]*?<\/Avatar>/g,
    `<CandidateAvatar name={candidate.name} size="xs" />`
  );
  content = content.replace(
    /<Avatar className="h-8 w-8">[\s\S]*?<AvatarFallback[\s\S]*?>[\s\S]*?{candidate\.name\.slice\(0, 2\)\.toUpperCase\(\)}[\s\S]*?<\/AvatarFallback>[\s\S]*?<\/Avatar>/g,
    `<CandidateAvatar name={candidate.name} size="sm" />`
  );
  fs.writeFileSync('features/onboarding/components/onboarding-dashboard.tsx', content, 'utf8');
  console.log('Updated onboarding-dashboard.tsx');
}
