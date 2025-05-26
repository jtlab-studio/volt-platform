import { apiClient } from '../../../api/client';
import { toCamelCase } from '../../../core/utils/transform';
import type { Race, ElevationProfile, GradientDistribution } from '../../../core/types/race';

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
    windowSize: number
  ): Promise<ElevationProfile> => {
    const response = await apiClient.get(`/races/${id}/elevation`, {
      params: { window_size: windowSize },
    });
    return toCamelCase(response.data);
  },
  
  getGradientDistribution: async (
    id: string,
    windowSize: number
  ): Promise<GradientDistribution> => {
    const response = await apiClient.get(`/races/${id}/gradient`, {
      params: { window_size: windowSize },
    });
    return toCamelCase(response.data);
  },
  
  deleteRace: async (id: string): Promise<void> => {
    await apiClient.delete(`/races/${id}`);
  },
};
