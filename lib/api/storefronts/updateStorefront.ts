import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function updateStorefront<T extends Record<string, unknown>>(
  storefrontId: string,
  data: T
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/storefronts/${storefrontId}`;

  try {
    return await authorizedOfetch(url, {
      method: 'PUT',
      body: data,
    });
  } catch (error) {
    console.error('Error updating storefront: ' + error);
    throw error;
  }
}
