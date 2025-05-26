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

export const useElevationProfile = (id: string, windowSize: number, smoothed: boolean = true) => {
  const { data, error } = useSWR(
    id ? `/races/${id}/elevation/${windowSize}/${smoothed}` : null,
    () => racesApi.getElevationProfile(id, windowSize, smoothed),
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

export const useGradientDistribution = (id: string, windowSize: number, smoothed: boolean = true) => {
  const { data, error } = useSWR(
    id ? `/races/${id}/gradient/${windowSize}/${smoothed}` : null,
    () => racesApi.getGradientDistribution(id, windowSize, smoothed),
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

export const useRaceMetrics = (id: string, smoothed: boolean = true) => {
  const { data, error } = useSWR(
    id ? `/races/${id}/metrics/${smoothed}` : null,
    () => racesApi.getRaceMetrics(id, smoothed),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    metrics: data,
    isLoading: !error && !data,
    error: error?.message,
  };
};
