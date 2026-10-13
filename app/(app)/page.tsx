'use client';

import * as React from 'react';
import { useUiStore } from '@/lib/store';
import { ManagerDashboard, HrDashboard } from '@/features/dashboard';

export default function DashboardPage() {
  const { role } = useUiStore();

  return (
    <div className="space-y-6">
      {role === 'manager' ? <ManagerDashboard /> : <HrDashboard />}
    </div>
  );
}
