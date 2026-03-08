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

type UseFetcherResult<T> = ReturnType<typeof useQuery<T>> & {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
};

type UseFetcherOptions = {
  url: string;
  method?: string; // defaults to 'GET'
  body?: any; // optional
  formPayload?: object; // optional
};

export default function useFetcher<T>({
  url,
  method = 'GET',
  body = undefined,
  formPayload = undefined,
}: UseFetcherOptions): UseFetcherResult<T> {
  const [data, setData] = useState<T | null>(null);

  let fetchBody = undefined;

  if (method === 'POST') {
    if (!formPayload) {
      fetchBody = JSON.stringify(body);
    } else {
      const formData = new FormData();
      Object.entries(formPayload).forEach(([k, v]) => v && formData.append(k, v));
      fetchBody = formData;
    }
  }

  const queryFetch = async () => {
    const data = (await authorizedOfetch(getBackendUrl() + '/api/v1/' + url, {
      method,
      body: fetchBody,
    })) as T;

    return data;
  };

  const queryCache: Array<string> = url.split('/');

  const queryResponse = useQuery<T>({
    queryKey: queryCache,
    queryFn: () => queryFetch(),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(queryResponse.data ?? null);
  }, [queryResponse.data]);

  const { isLoading, isError, error, isPending, isFetching, refetch } = queryResponse;

  return {
    isLoading,
    isError,
    error,
    isPending,
    isFetching,
    refetch,
    data,
    setData,
  } as UseFetcherResult<T>;
}
