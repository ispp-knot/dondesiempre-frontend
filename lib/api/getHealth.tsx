import { getBackendUrl } from '@/lib/config';
import { authorizedOfetch } from './authorizedOfetch';

export async function getHealth(): Promise<boolean> {
  try {
    await authorizedOfetch(getBackendUrl() + '/api/v1/health');
    return true;
  } catch {
    return false;
  }
}
