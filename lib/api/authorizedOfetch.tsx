import { FetchOptions, FetchRequest, ofetch } from "ofetch";

export async function authorizedOfetch(
  request: FetchRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: FetchOptions<"json", any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  // This will later be a wrapper that adds authorization to the headers
  return ofetch(request, options);
}
