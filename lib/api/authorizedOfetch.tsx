import { FetchOptions, FetchRequest, ofetch } from 'ofetch';

export async function authorizedOfetch(
  request: FetchRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: FetchOptions<'json', any>,
  token?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  return ofetch(request, {
    timeout: 5000,
    ...options,
    headers,
  });
}
