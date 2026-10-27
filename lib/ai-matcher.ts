import type { Opening, Candidate } from '@/types/entities';

export interface CandidateMatchResult {
  candidate: Candidate;
  score: number; // 0 - 100
  tier: 'Strong Fit' | 'Good Match' | 'Moderate Match' | 'Low Fit';
  matchedMustSkills: string[];
  missingMustSkills: string[];
  matchedNiceSkills: string[];
  roleRelevance: number; // 0 - 100
  skillsRelevance: number; // 0 - 100
  experienceRelevance: number; // 0 - 100
  budgetRelevance: number; // 0 - 100
  experienceVerdict: {
    label: string;
    status: 'optimal' | 'junior' | 'senior';
  };
  budgetVerdict: {
    label: string;
    status: 'within' | 'stretch' | 'under';
  };
  summary: string;
  recommendedAction: 'Immediate Shortlist' | 'High Priority Review' | 'Review Gaps';
  suggestedQuestions: string[];
}

// Synonyms & token mappings for semantic matching
const SKILL_ALIASES: Record<string, string[]> = {
  react: ['react', 'react.js', 'reactjs', 'frontend', 'ui'],
  'next.js': ['next.js', 'nextjs', 'next', 'ssr', 'app router'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js', 'es6', 'ecmascript'],
  'node.js': ['node.js', 'nodejs', 'node', 'express'],
  'tailwind css': ['tailwind', 'tailwindcss', 'css', 'design systems'],
  'web performance': ['web performance', 'performance', 'ssr', 'optimization', 'core web vitals'],
  postgresql: ['postgresql', 'postgres', 'sql', 'rdbms'],
  mongodb: ['mongodb', 'mongo', 'nosql'],
  docker: ['docker', 'container', 'containers', 'containerization'],
  kubernetes: ['kubernetes', 'k8s', 'orchestration'],
  aws: ['aws', 'amazon web services', 'cloud', 's3', 'ec2'],
  gcp: ['gcp', 'google cloud'],
  python: ['python', 'pandas', 'numpy', 'scipy', 'fastapi', 'django'],
  sql: ['sql', 'postgres', 'postgresql', 'mysql', 'queries', 'dbt'],
  figma: ['figma', 'design system', 'wireframing', 'prototyping', 'ui/ux'],
  playwright: ['playwright', 'automation', 'qa', 'e2e', 'test'],
  jest: ['jest', 'vitest', 'unit test', 'testing', 'automation'],
  'api testing': ['api testing', 'rest', 'postman', 'integration test', 'qa'],
  'ci integration': ['ci', 'ci/cd', 'github actions', 'jenkins', 'pipeline'],
  'product strategy': ['product strategy', 'roadmap', 'product management', 'prd', 'discovery'],
  'roadmap planning': ['roadmap', 'roadmapping', 'prioritization', 'agile'],
  'user research': ['user research', 'usability', 'interviews', 'ux research'],
  tableau: ['tableau', 'dashboard', 'bi', 'power bi'],
  graphql: ['graphql', 'apollo'],
};

// Implied core competencies based on industry job titles
const ROLE_SKILL_ASSOCIATIONS: Record<string, string[]> = {
  frontend: [
    'react', 'next.js', 'typescript', 'javascript', 'tailwind css', 'css',
    'web performance', 'html', 'design systems', 'jest', 'vitest', 'frontend architecture',
    'api integration', 'graphql'
  ],
  backend: [
    'node.js', 'python', 'java', 'golang', 'go', 'postgresql', 'sql', 'redis',
    'docker', 'kubernetes', 'aws', 'rest apis', 'microservices', 'kafka', 'ci/cd'
  ],
  fullstack: [
    'react', 'next.js', 'typescript', 'node.js', 'postgresql', 'docker', 'rest apis', 'tailwind css'
  ],
  qa: [
    'playwright', 'selenium', 'jest', 'vitest', 'api testing', 'automation',
    'ci integration', 'typescript', 'cypress', 'qa automation', 'testing'
  ],
  architect: [
    'system design', 'architecture', 'scalability', 'cloud', 'docker', 'ci/cd'
  ],
  devops: [
    'docker', 'kubernetes', 'aws', 'gcp', 'terraform', 'ci/cd pipelines',
    'linux', 'helm', 'monitoring', 'sre', 'cloud architecture'
  ],
  designer: [
    'figma', 'ui design', 'ux research', 'design systems', 'wireframing',
    'interactive prototyping', 'tokens', 'wcag', 'usability', 'mobile ux'
  ],
  design: [
    'figma', 'ui design', 'ux research', 'design systems', 'wireframing',
    'interactive prototyping', 'tokens', 'wcag', 'usability', 'mobile ux'
  ],
  analyst: [
    'sql', 'python', 'tableau', 'power bi', 'pandas', 'analytics',
    'etl', 'data modeling', 'statistics', 'dbt', 'dashboards'
  ],
  data: [
    'sql', 'python', 'tableau', 'power bi', 'pandas', 'analytics',
    'etl', 'data modeling', 'statistics', 'dbt', 'dashboards', 'snowflake', 'spark'
  ],
  product: [
    'product strategy', 'roadmap planning', 'agile / scrum', 'jira',
    'user research', 'a/b testing', 'prd documentation', 'feature prioritization',
    'kpi & okr tracking', 'mixpanel'
  ],
  hr: [
    'technical recruiting', 'talent sourcing', 'ats', 'hris', 'employee relations',
    'performance management', 'onboarding', 'compliance'
  ],
  talent: [
    'technical recruiting', 'talent sourcing', 'ats', 'hris', 'employee relations',
    'performance management', 'onboarding', 'compliance'
  ],
};

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function candidateHasSkill(candidateCorpus: string, skill: string): boolean {
  const normSkill = skill.toLowerCase().trim();
  const lowerCorpus = candidateCorpus.toLowerCase();

  // Direct substring check
  if (lowerCorpus.includes(normSkill)) return true;

  // Check aliases
  for (const [key, aliases] of Object.entries(SKILL_ALIASES)) {
    if (normSkill.includes(key) || key.includes(normSkill)) {
      if (aliases.some((alias) => lowerCorpus.includes(alias))) {
        return true;
      }
    }
  }

  // Token check (all significant words present)
  const tokens = normSkill.split(/[\s/,-]+/).filter((t) => t.length > 2);
  if (tokens.length > 0 && tokens.every((t) => lowerCorpus.includes(t))) {
    return true;
  }

  return false;
}

export function matchCandidateToOpening(
  candidate: Candidate,
  opening: Opening
): CandidateMatchResult {
  // Aggregate candidate textual footprint + implied domain competencies
  const roleLower = candidate.currentRole.toLowerCase();
  const impliedSkills: string[] = [];

  for (const [key, skills] of Object.entries(ROLE_SKILL_ASSOCIATIONS)) {
    if (roleLower.includes(key)) {
      impliedSkills.push(...skills);
    }
  }

  const candidateSkills = Array.isArray((candidate as Record<string, unknown>).skills)
    ? ((candidate as Record<string, unknown>).skills as string[])
    : [];

  const candidateCorpus = [
    candidate.currentRole,
    candidate.currentCompany,
    candidate.hrNotes || '',
    candidate.resumeFileName || '',
    ...candidateSkills,
    ...impliedSkills,
  ].join(' ');

  // 1. Role Relevance (25%)
  let roleRelevance = 35;
  const normCandidateRole = normalizeString(candidate.currentRole);
  const normOpeningTitle = normalizeString(opening.title);

  if (normCandidateRole === normOpeningTitle) {
    roleRelevance = 100;
  } else {
    // Check keyword and domain overlap
    const titleWords = opening.title.toLowerCase().split(/[\s/,-]+/).filter((w) => w.length > 2);
    let matchedWords = 0;
    for (const w of titleWords) {
      if (roleLower.includes(w) || candidateCorpus.toLowerCase().includes(w)) {
        matchedWords++;
      }
    }
    const overlapRatio = titleWords.length > 0 ? matchedWords / titleWords.length : 0;
    roleRelevance = Math.round(40 + overlapRatio * 60);
  }

  // 2. Must-Have Skills Matching (35%)
  const matchedMustSkills: string[] = [];
  const missingMustSkills: string[] = [];

  for (const skill of opening.mustHaveSkills) {
    if (candidateHasSkill(candidateCorpus, skill)) {
      matchedMustSkills.push(skill);
    } else {
      missingMustSkills.push(skill);
    }
  }

  const mustSkillsRatio =
    opening.mustHaveSkills.length > 0
      ? matchedMustSkills.length / opening.mustHaveSkills.length
      : 1;
  const skillsRelevance = Math.round(mustSkillsRatio * 100);

  // 3. Nice-to-Have Skills Matching (15%)
  const matchedNiceSkills: string[] = [];
  for (const skill of opening.niceToHaveSkills) {
    if (candidateHasSkill(candidateCorpus, skill)) {
      matchedNiceSkills.push(skill);
    }
  }
  const niceSkillsRatio =
    opening.niceToHaveSkills.length > 0
      ? matchedNiceSkills.length / opening.niceToHaveSkills.length
      : 0.6;

  // 4. Experience Relevance (15%)
  const { min: expMin, max: expMax } = opening.experienceRange;
  const candidateExp = candidate.experienceYears;
  let experienceRelevance = 50;
  let experienceVerdict: CandidateMatchResult['experienceVerdict'] = {
    label: `${candidateExp} yrs fits required ${expMin}-${expMax} yrs`,
    status: 'optimal',
  };

  if (candidateExp >= expMin && candidateExp <= expMax) {
    experienceRelevance = 100;
    experienceVerdict = {
      label: `${candidateExp} yrs matches target range (${expMin}-${expMax} yrs)`,
      status: 'optimal',
    };
  } else if (candidateExp > expMax) {
    const diff = candidateExp - expMax;
    if (diff <= 2) {
      experienceRelevance = 92;
      experienceVerdict = {
        label: `${candidateExp} yrs (Experienced, close to ${expMax}y cap)`,
        status: 'senior',
      };
    } else {
      experienceRelevance = 80;
      experienceVerdict = {
        label: `${candidateExp} yrs (High seniority for bracket)`,
        status: 'senior',
      };
    }
  } else {
    const diff = expMin - candidateExp;
    if (diff <= 1) {
      experienceRelevance = 85;
      experienceVerdict = {
        label: `${candidateExp} yrs (Near minimum ${expMin}y requirement)`,
        status: 'optimal',
      };
    } else {
      experienceRelevance = Math.max(30, Math.round(100 - diff * 25));
      experienceVerdict = {
        label: `${candidateExp} yrs (Below required ${expMin}y minimum)`,
        status: 'junior',
      };
    }
  }

  // 5. Budget / Compensation Relevance (10%)
  const { min: bMin, max: bMax } = opening.budgetRange;
  const expectedCtc = candidate.expectedCtc;
  let budgetRelevance = 80;
  let budgetVerdict: CandidateMatchResult['budgetVerdict'] = {
    label: `₹${expectedCtc} LPA within budget (₹${bMin}-${bMax} LPA)`,
    status: 'within',
  };

  if (expectedCtc <= bMax) {
    if (expectedCtc >= bMin) {
      budgetRelevance = 100;
      budgetVerdict = {
        label: `₹${expectedCtc} LPA within allocated band (₹${bMin}-${bMax} LPA)`,
        status: 'within',
      };
    } else {
      budgetRelevance = 95;
      budgetVerdict = {
        label: `₹${expectedCtc} LPA is below budget max (Cost-efficient)`,
        status: 'under',
      };
    }
  } else {
    const overflowPercent = ((expectedCtc - bMax) / bMax) * 100;
    budgetRelevance = Math.max(25, Math.round(100 - overflowPercent * 2));
    budgetVerdict = {
      label: `₹${expectedCtc} LPA exceeds maximum budget by ${Math.round(overflowPercent)}%`,
      status: 'stretch',
    };
  }

  // Weighted Total Score
  const totalScore = Math.min(
    99,
    Math.max(
      15,
      Math.round(
        roleRelevance * 0.25 +
          skillsRelevance * 0.35 +
          niceSkillsRatio * 100 * 0.15 +
          experienceRelevance * 0.15 +
          budgetRelevance * 0.10
      )
    )
  );

  // Classification Tiers
  let tier: CandidateMatchResult['tier'] = 'Low Fit';
  let recommendedAction: CandidateMatchResult['recommendedAction'] = 'Review Gaps';

  if (totalScore >= 75) {
    tier = 'Strong Fit';
    recommendedAction = 'Immediate Shortlist';
  } else if (totalScore >= 60) {
    tier = 'Good Match';
    recommendedAction = 'High Priority Review';
  } else if (totalScore >= 45) {
    tier = 'Moderate Match';
    recommendedAction = 'Review Gaps';
  } else {
    tier = 'Low Fit';
    recommendedAction = 'Review Gaps';
  }

  // Executive AI Summary
  let summary = '';
  if (tier === 'Strong Fit') {
    summary = `High-conviction match (${totalScore}%): Candidate demonstrates ${matchedMustSkills.length}/${opening.mustHaveSkills.length} core competencies (${matchedMustSkills.slice(0, 3).join(', ')}) with ${candidateExp}y experience at ${candidate.currentCompany}. Expected CTC (₹${expectedCtc} LPA) aligns comfortably with requisition parameters.`;
  } else if (tier === 'Good Match') {
    summary = `Promising candidate (${totalScore}%): Strong background in ${candidate.currentRole} with ${matchedMustSkills.length} matched must-have skills. Notice period is ${candidate.noticePeriod}. Recommend technical screen to verify ${missingMustSkills.length > 0 ? missingMustSkills[0] : 'core depth'}.`;
  } else if (tier === 'Moderate Match') {
    summary = `Partial alignment (${totalScore}%): Candidate has relevant fundamentals but lacks direct verification for: ${missingMustSkills.slice(0, 2).join(', ')}. Useful for pipeline consideration if primary talent pool is constrained.`;
  } else {
    summary = `Low alignment (${totalScore}%): Core skill profile does not meet requisition screening thresholds.`;
  }

  // Suggested Interview Questions tailored by AI
  const suggestedQuestions: string[] = [];
  if (matchedMustSkills.length > 0) {
    suggestedQuestions.push(
      `Can you explain your architectural approach using ${matchedMustSkills[0]} on production systems at ${candidate.currentCompany}?`
    );
  }
  if (missingMustSkills.length > 0) {
    suggestedQuestions.push(
      `How do you ramp up and deliver when projects require ${missingMustSkills[0]}? Have you used related paradigms?`
    );
  }
  suggestedQuestions.push(
    `Given your ${candidate.noticePeriod} notice period, what is your transition timeline and current deliverables?`
  );

  return {
    candidate,
    score: totalScore,
    tier,
    matchedMustSkills,
    missingMustSkills,
    matchedNiceSkills,
    roleRelevance,
    skillsRelevance,
    experienceRelevance,
    budgetRelevance,
    experienceVerdict,
    budgetVerdict,
    summary,
    recommendedAction,
    suggestedQuestions,
  };
}

/**
 * Screens and ranks a list of candidates against an opening using the AI matcher.
 */
export function rankCandidatesForOpening(
  candidates: Candidate[],
  opening: Opening,
  options?: {
    minScore?: number;
    withinBudgetOnly?: boolean;
    immediateNoticeOnly?: boolean;
    searchQuery?: string;
  }
): CandidateMatchResult[] {
  let results = candidates.map((c) => matchCandidateToOpening(c, opening));

  // Sort descending by AI Match Score
  results.sort((a, b) => b.score - a.score);

  if (options?.minScore) {
    results = results.filter((r) => r.score >= options.minScore!);
  }

  if (options?.withinBudgetOnly) {
    results = results.filter((r) => r.budgetVerdict.status !== 'stretch');
  }

  if (options?.immediateNoticeOnly) {
    results = results.filter(
      (r) =>
        r.candidate.noticePeriod.toLowerCase().includes('immediate') ||
        r.candidate.noticePeriod.toLowerCase().includes('15')
    );
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.candidate.name.toLowerCase().includes(q) ||
        r.candidate.currentRole.toLowerCase().includes(q) ||
        r.candidate.currentCompany.toLowerCase().includes(q) ||
        r.matchedMustSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return results;
}

