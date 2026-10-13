'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { OpeningDetail } from '@/features/openings';

export default function OpeningDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  return <OpeningDetail id={id} />;
}
