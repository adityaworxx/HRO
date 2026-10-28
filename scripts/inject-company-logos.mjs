import fs from 'fs';

// 1. features/candidates/components/candidate-detail-sheet.tsx
let cds = fs.readFileSync('features/candidates/components/candidate-detail-sheet.tsx', 'utf8');
if (!cds.includes("import { CompanyLogo } from '@/components/hro/company-logo';")) {
  cds = cds.replace(
    "import { SourceBadge } from '@/components/hro/source-badge';",
    "import { SourceBadge } from '@/components/hro/source-badge';\nimport { CompanyLogo } from '@/components/hro/company-logo';"
  );
}
cds = cds.replace(
  '<strong className="text-text font-semibold">{candidate.currentCompany}</strong>',
  '<span className="inline-flex items-center gap-1.5"><CompanyLogo company={candidate.currentCompany} className="h-4 w-4 rounded-[3px] shadow-2xs inline-block" /><strong className="text-text font-semibold">{candidate.currentCompany}</strong></span>'
);
cds = cds.replace(
  '<Building2 className="h-3.5 w-3.5 text-text-subtle shrink-0" />\r\n                <span className="truncate">{candidate.currentCompany}</span>',
  '<CompanyLogo company={candidate.currentCompany} className="h-4 w-4 rounded-[3px] shrink-0 shadow-2xs" />\r\n                <span className="truncate">{candidate.currentCompany}</span>'
);
cds = cds.replace(
  '<Building2 className="h-3.5 w-3.5 text-text-subtle shrink-0" />\n                <span className="truncate">{candidate.currentCompany}</span>',
  '<CompanyLogo company={candidate.currentCompany} className="h-4 w-4 rounded-[3px] shrink-0 shadow-2xs" />\n                <span className="truncate">{candidate.currentCompany}</span>'
);
fs.writeFileSync('features/candidates/components/candidate-detail-sheet.tsx', cds, 'utf8');

// 2. features/candidates/components/candidates-table.tsx
let ct = fs.readFileSync('features/candidates/components/candidates-table.tsx', 'utf8');
if (!ct.includes("import { CompanyLogo } from '@/components/hro/company-logo';")) {
  ct = ct.replace(
    "import { SourceBadge } from '@/components/hro/source-badge';",
    "import { SourceBadge } from '@/components/hro/source-badge';\nimport { CompanyLogo } from '@/components/hro/company-logo';"
  );
}
ct = ct.replace(
  '<span className="text-text-muted text-[12px] font-medium block truncate">\r\n                {c.currentCompany}\r\n              </span>',
  '<span className="text-text-muted text-[12px] font-medium flex items-center gap-1.5 truncate mt-0.5">\r\n                <CompanyLogo company={c.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" />\r\n                <span className="truncate">{c.currentCompany}</span>\r\n              </span>'
);
ct = ct.replace(
  '<span className="text-text-muted text-[12px] font-medium block truncate">\n                {c.currentCompany}\n              </span>',
  '<span className="text-text-muted text-[12px] font-medium flex items-center gap-1.5 truncate mt-0.5">\n                <CompanyLogo company={c.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" />\n                <span className="truncate">{c.currentCompany}</span>\n              </span>'
);
fs.writeFileSync('features/candidates/components/candidates-table.tsx', ct, 'utf8');

// 3. features/candidates/components/shortlist-review.tsx
let sr = fs.readFileSync('features/candidates/components/shortlist-review.tsx', 'utf8');
if (!sr.includes("import { CompanyLogo } from '@/components/hro/company-logo';")) {
  sr = sr.replace(
    "import { SourceBadge } from '@/components/hro/source-badge';",
    "import { SourceBadge } from '@/components/hro/source-badge';\nimport { CompanyLogo } from '@/components/hro/company-logo';"
  );
}
sr = sr.replace(
  '<span className="font-medium text-text">{selectedCandidate.currentCompany}</span>',
  '<span className="inline-flex items-center gap-1 font-medium text-text"><CompanyLogo company={selectedCandidate.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" /><span>{selectedCandidate.currentCompany}</span></span>'
);
fs.writeFileSync('features/candidates/components/shortlist-review.tsx', sr, 'utf8');

// 4. features/candidates/components/interviews-view.tsx
let iv = fs.readFileSync('features/candidates/components/interviews-view.tsx', 'utf8');
if (!iv.includes("import { CompanyLogo } from '@/components/hro/company-logo';")) {
  iv = iv.replace(
    "import { SourceBadge } from '@/components/hro/source-badge';",
    "import { SourceBadge } from '@/components/hro/source-badge';\nimport { CompanyLogo } from '@/components/hro/company-logo';"
  );
}
iv = iv.replace(
  '<span className="text-text">{candidate.currentCompany}</span>',
  '<span className="inline-flex items-center gap-1 text-text font-medium"><CompanyLogo company={candidate.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" /><span>{candidate.currentCompany}</span></span>'
);
fs.writeFileSync('features/candidates/components/interviews-view.tsx', iv, 'utf8');

// 5. features/candidates/components/ai-candidate-matcher-sheet.tsx
let ams = fs.readFileSync('features/candidates/components/ai-candidate-matcher-sheet.tsx', 'utf8');
if (!ams.includes("import { CompanyLogo } from '@/components/hro/company-logo';")) {
  ams = ams.replace(
    "import { SourceBadge } from '@/components/hro/source-badge';",
    "import { SourceBadge } from '@/components/hro/source-badge';\nimport { CompanyLogo } from '@/components/hro/company-logo';"
  );
}
ams = ams.replace(
  '<span>{candidate.currentCompany}</span>',
  '<span className="inline-flex items-center gap-1"><CompanyLogo company={candidate.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" /><span>{candidate.currentCompany}</span></span>'
);
fs.writeFileSync('features/candidates/components/ai-candidate-matcher-sheet.tsx', ams, 'utf8');

console.log('Company logos injected successfully across candidate views!');
