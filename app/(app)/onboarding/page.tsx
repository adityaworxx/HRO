'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { OnboardingDashboard } from '@/features/onboarding';

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Onboarding & Readiness"
        description="Day-1 asset dispatch, background verifications, and 30-day integration roadmaps."
      />
      <OnboardingDashboard />
    </div>
  );
}
