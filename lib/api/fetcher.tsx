import { authorizedOfetch } from './authorizedOfetch';
import { getBackendUrl } from '../config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, Dispatch, SetStateAction } from 'react';

function buildQueryKey(url: string): string[] {
  return url.split('/');
}

async function executeFetch<T>({
  url,
  method = 'GET',
  body,
  formPayload,
}: {
  url: string;
  method?: string;
  body?: unknown;
  formPayload?: Record<string, string | Blob | undefined>;
}): Promise<T> {
  let fetchBody: BodyInit | undefined;

  if (method !== 'GET') {
    if (formPayload) {
      const formData = new FormData();
      Object.entries(formPayload).forEach(
        ([k, v]) => v !== undefined && formData.append(k, v as string | Blob)
      );
      fetchBody = formData;
    } else if (body !== undefined) {
      fetchBody = JSON.stringify(body);
    }
  }

  return (await authorizedOfetch(getBackendUrl() + '/api/v1/' + url, {
    method,
    body: fetchBody,
  })) as T;
}

// --- usePassiveFetcher ---

type UsePassiveFetcherOptions = {
  url: string;
  enabled?: boolean;
};

type UsePassiveFetcherResult<T> = ReturnType<typeof useQuery<T>> & {
  setData: (data: T) => void;
};

export function usePassiveFetcher<T>({
  url,
  enabled = true,
}: UsePassiveFetcherOptions): UsePassiveFetcherResult<T> {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey(url);

  const query = useQuery<T>({
    queryKey,
    queryFn: () => executeFetch<T>({ url }),
    enabled,
  });

  const setData = (data: T) => {
    queryClient.setQueryData(queryKey, data);
  };

  return Object.assign(query, { setData });
}

// --- useActiveFetcher ---

type MutationMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type UseActiveFetcherOptions<T> = {
  url?: string;
  method?: MutationMethod;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | undefined, error: Error | null) => void;
};

type ActiveFetchCallOptions = {
  url?: string;
  method?: MutationMethod;
  body?: unknown;
  formPayload?: Record<string, string | Blob | undefined>;
};

type UseActiveFetcherResult<T> = ReturnType<
  typeof useMutation<T, Error, ActiveFetchCallOptions>
> & {
  fetch: (opts?: ActiveFetchCallOptions) => Promise<T>;
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
};

export function useActiveFetcher<T>({
  url: defaultUrl,
  method: defaultMethod,
  onSuccess,
  onError,
  onSettled,
}: UseActiveFetcherOptions<T> = {}): UseActiveFetcherResult<T> {
  const [data, setData] = useState<T | null>(null);

  const mutation = useMutation<T, Error, ActiveFetchCallOptions>({
    mutationFn: (opts: ActiveFetchCallOptions = {}) => {
      const url = opts.url ?? defaultUrl;
      const method = opts.method ?? defaultMethod;
      if (!url) throw new Error('useActiveFetcher: url is required');
      if (!method) throw new Error('useActiveFetcher: method is required');
      return executeFetch<T>({ url, method, body: opts.body, formPayload: opts.formPayload });
    },
    onSuccess: (result) => {
      setData(result);
      onSuccess?.(result);
    },
    onError,
    onSettled,
  });

  const fetch = (opts?: ActiveFetchCallOptions): Promise<T> => {
    return mutation.mutateAsync(opts ?? {});
  };

  return {
    ...mutation,
    fetch,
    data,
    setData,
  } as UseActiveFetcherResult<T>;
}
