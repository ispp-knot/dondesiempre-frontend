'use client';

import { LoggedInGuard } from '@/components/guards/LoggedInGuard';
import FollowPage from './followPage';

export default function Page() {
  return (
    <LoggedInGuard>
      <FollowPage />;
    </LoggedInGuard>
  );
}
