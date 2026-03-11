import { authorizedOfetch } from './authorizedOfetch';
import { getBackendUrl } from '../config';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

/*
  formPayload must be of the type:
  
  const data = {
    dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
    image,
  };
*/

type FormPayload = Record<string, any>;

type QueryKey<TBody> = [
  string,
  string,
  TBody | undefined,
  FormPayload | undefined,
  Record<string, string | number | boolean>,
];

type UseFetcherResult<T, TBody> = ReturnType<typeof useQuery<T>> & {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  execute: (options?: {
    newBody?: TBody;
    newFormPayload?: FormPayload;
    newQueryParams?: Record<string, string | number | boolean>;
  }) => void;
};

type UseFetcherOptions<TBody> = {
  url: string;
  method?: string;
  body?: TBody;
  formPayload?: FormPayload;
  fetchOnStart?: boolean;
  queryParams?: Record<string, string | number | boolean>;
};

export default function useFetcher<T, TBody = undefined>({
  url,
  method = 'GET',
  body: initialBody = undefined,
  formPayload: initialFormPayload = undefined,
  fetchOnStart = true,
  queryParams: initialQueryParams = {},
}: UseFetcherOptions<TBody>): UseFetcherResult<T, TBody> {
  if (url.includes('?')) {
    throw new Error('You should include query parameters in the queryParams field');
  }

  if (method === 'GET' && (initialBody || initialFormPayload)) {
    throw new Error('GET queries should not include a body');
  }

  const [data, setData] = useState<T | null>(null);

  const formPayloadRef = useRef<FormPayload | undefined>(initialFormPayload);
  const bodyRef = useRef<TBody | undefined>(initialBody);
  const queryParamsRef = useRef<Record<string, string | number | boolean>>(initialQueryParams);

  const queryFetch = async () => {
    let fetchBody;
    const payload = formPayloadRef.current;
    const body = bodyRef.current;

    const buildUrl = () => {
      const searchParams = new URLSearchParams(
        Object.entries(queryParamsRef.current).map(([k, v]) => [k, String(v)])
      ).toString();
      return searchParams ? `${url}?${searchParams}` : url;
    };

    if (method !== 'GET') {
      if (!payload) {
        fetchBody = JSON.stringify(body);
      } else {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) formData.append(k, v);
        });
        fetchBody = formData;
      }
    }

    return (await authorizedOfetch(getBackendUrl() + '/api/v1/' + buildUrl(), {
      method,
      body: fetchBody,
    })) as T;
  };

  const [queryKey, setQueryKey] = useState<QueryKey<TBody>>([
    url,
    method,
    initialBody,
    initialFormPayload,
    initialQueryParams,
  ]);

  const queryResponse = useQuery<T>({
    queryKey,
    queryFn: queryFetch,
    enabled: fetchOnStart,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(queryResponse.data ?? null);
  }, [queryResponse.data]);

  const isFirstRender = useRef(true);

  const { isLoading, isError, error, isPending, isFetching, refetch } = queryResponse;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refetch();
  }, [queryKey, refetch]);

  const execute = (options?: {
    newBody?: TBody;
    newFormPayload?: FormPayload;
    newQueryParams?: Record<string, string | number | boolean>;
  }): void => {
    if (method === 'GET' && (options?.newBody || options?.newFormPayload)) {
      throw new Error('GET queries should not include a body');
    }

    if (options?.newFormPayload) {
      formPayloadRef.current = options.newFormPayload;
    } else if (options?.newBody) {
      bodyRef.current = options.newBody;
    }

    if (options?.newQueryParams) {
      queryParamsRef.current = options.newQueryParams;
    }

    setQueryKey([url, method, bodyRef.current, formPayloadRef.current, queryParamsRef.current]);
  };

  return {
    isLoading,
    isError,
    error,
    isPending,
    isFetching,
    execute,
    data,
    setData,
  } as UseFetcherResult<T, TBody>;
}
