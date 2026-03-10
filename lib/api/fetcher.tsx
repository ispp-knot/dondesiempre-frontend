import { authorizedOfetch } from './authorizedOfetch';
import { getBackendUrl } from '../config';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/*
  formPayload must be of the type:
  
  const data = {
    dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
    image,
  };
*/

type FormPayload = Record<string, any>;

type UseFetcherResult<T, TBody> = ReturnType<typeof useQuery<T>> & {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  body: TBody | undefined;
  setBody: React.Dispatch<React.SetStateAction<TBody | undefined>>;
  formPayload: FormPayload | undefined;
  setFormPayload: React.Dispatch<React.SetStateAction<FormPayload | undefined>>;
  queryParams: Record<string, string | number | boolean>;
  setQueryParams: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>;
  execute: (options?: {
    newBody?: TBody;
    newFormPayload?: FormPayload;
    newQueryParams?: Record<string, string | number | boolean>;
  }) => ReturnType<ReturnType<typeof useQuery<T>>['refetch']>;
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
    throw new Error('1 GET queries should not include a body');
  }

  const [data, setData] = useState<T | null>(null);
  const [modifiableBody, setModifiableBody] = useState<TBody | undefined>(initialBody);
  const [modifiableFormPayload, setModifiableFormPayload] = useState<FormPayload | undefined>(
    initialFormPayload
  );
  const [modifiableQueryParams, setModifiableQueryParams] =
    useState<Record<string, string | number | boolean>>(initialQueryParams);

  const buildUrl = () => {
    const searchParams = new URLSearchParams(
      Object.entries(modifiableQueryParams).map(([k, v]) => [k, String(v)])
    ).toString();
    return searchParams ? `${url}?${searchParams}` : url;
  };

  const queryFetch = async () => {
    let fetchBody;

    if (method !== 'GET') {
      if (!modifiableFormPayload) {
        fetchBody = JSON.stringify(modifiableBody);
      } else {
        const formData = new FormData();
        Object.entries(modifiableFormPayload).forEach(([k, v]) => {
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

  const queryResponse = useQuery<T>({
    queryKey: [url, method, modifiableBody, modifiableFormPayload, modifiableQueryParams],
    queryFn: queryFetch,
    enabled: fetchOnStart,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(queryResponse.data ?? null);
  }, [queryResponse.data]);

  const { isLoading, isError, error, isPending, isFetching, refetch } = queryResponse;

  const execute = async (options?: {
    newBody?: TBody;
    newFormPayload?: FormPayload;
    newQueryParams?: Record<string, string | number | boolean>;
  }) => {
    if (method === 'GET' && (options?.newBody || options?.newFormPayload)) {
      throw new Error('GET queries should not include a body');
    }

    if (options?.newFormPayload) setModifiableFormPayload(options.newFormPayload);
    else if (options?.newBody) setModifiableBody(options.newBody);

    if (options?.newQueryParams) setModifiableQueryParams(options.newQueryParams);
    return refetch();
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
    body: modifiableBody,
    setBody: setModifiableBody,
    formPayload: modifiableFormPayload,
    setFormPayload: setModifiableFormPayload,
    queryParams: modifiableQueryParams,
    setQueryParams: setModifiableQueryParams,
  } as UseFetcherResult<T, TBody>;
}
