'use client';

import { ClientGuard } from '@/components/guards/ClientGuard';
import FollowPage from './followPage';

export default function Page() {
  return (
    <ClientGuard>
      <FollowPage />;
    </ClientGuard>
  );
}
