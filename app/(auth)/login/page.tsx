'use client';

import * as React from 'react';
import { AuthView } from '@/features/auth';

export default function LoginPage() {
  return <AuthView initialMode="login" />;
}
