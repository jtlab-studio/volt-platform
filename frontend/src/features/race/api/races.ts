import { apiClient } from '../../../api/client';
import { toCamelCase } from '../../../core/utils/transform';
import type { Race, ElevationProfile, GradientDistribution } from '../../../core/types/race';

export interface RaceMetrics {
  elevationGainM: number;
  elevationLossM: number;
  itraEffortDistance: number;
}

export const racesApi = {
  uploadGpx: async (file: File): Promise<Race> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/races', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return toCamelCase(response.data);
  },
  
  getRaces: async (): Promise<Race[]> => {
    const response = await apiClient.get('/races');
    return toCamelCase(response.data);
  },
  
  getRace: async (id: string): Promise<Race> => {
    const response = await apiClient.get(`/races/${id}`);
    return toCamelCase(response.data);
  },
  
  getElevationProfile: async (
    id: string,
    windowSize: number,
    smoothed: boolean = true
  ): Promise<ElevationProfile> => {
    const response = await apiClient.get(`/races/${id}/elevation`, {
      params: { 
        window_size: windowSize,
        smoothed: smoothed
      },
    });
    return toCamelCase(response.data);
  },
  
  getGradientDistribution: async (
    id: string,
    windowSize: number,
    smoothed: boolean = true
  ): Promise<GradientDistribution> => {
    const response = await apiClient.get(`/races/${id}/gradient`, {
      params: { 
        window_size: windowSize,
        smoothed: smoothed
      },
    });
    return toCamelCase(response.data);
  },
  
  getRaceMetrics: async (
    id: string,
    smoothed: boolean = true
  ): Promise<RaceMetrics> => {
    const response = await apiClient.get(`/races/${id}/metrics`, {
      params: { 
        smoothed: smoothed
      },
    });
    return toCamelCase(response.data);
  },
  
  deleteRace: async (id: string): Promise<void> => {
    await apiClient.delete(`/races/${id}`);
  },
};
