'use client';

import FollowPage from './followPage';
import { ClientGuard } from '@/components/guards/ClientGuard';

export default function Page() {
  return (
    <ClientGuard>
      <FollowPage />;
    </ClientGuard>
  );
}
