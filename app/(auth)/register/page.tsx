'use client';

import * as React from 'react';
import { AuthView } from '@/features/auth';

export default function RegisterPage() {
  return <AuthView initialMode="register" />;
}

