import useSWR from 'swr';
import { racesApi } from '../api/races';
import type { Race } from '../../../core/types/race';

export const useRaces = () => {
  const { data, error, mutate } = useSWR<Race[]>(
    '/races',
    racesApi.getRaces,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    races: data,
    isLoading: !error && !data,
    error: error?.message,
    mutate,
  };
};

export const useRace = (id: string) => {
  const { data, error, mutate } = useSWR<Race>(
    id ? `/races/${id}` : null,
    () => racesApi.getRace(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    race: data,
    isLoading: !error && !data,
    error: error?.message,
    mutate,
  };
};

export const useElevationProfile = (id: string, windowSize: number) => {
  const { data, error } = useSWR(
    id ? `/races/${id}/elevation/${windowSize}` : null,
    () => racesApi.getElevationProfile(id, windowSize),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    profile: data,
    isLoading: !error && !data,
    error: error?.message,
  };
};

export const useGradientDistribution = (id: string, windowSize: number) => {
  const { data, error } = useSWR(
    id ? `/races/${id}/gradient/${windowSize}` : null,
    () => racesApi.getGradientDistribution(id, windowSize),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    distribution: data,
    isLoading: !error && !data,
    error: error?.message,
  };
};
