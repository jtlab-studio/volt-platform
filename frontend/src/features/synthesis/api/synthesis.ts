import { apiClient } from '../../../api/client';
import { toCamelCase, toSnakeCase } from '../../../core/utils/transform';
import type {
  SynthesisRequest,
  SynthesisResponse,
  SynthesisResult,
} from '../../../core/types/synthesis';

export const synthesisApi = {
  generateRoutes: async (request: SynthesisRequest): Promise<SynthesisResponse> => {
    const response = await apiClient.post('/synthesis/generate', toSnakeCase(request));
    return toCamelCase(response.data);
  },
  
  getSynthesisResults: async (id: string): Promise<SynthesisResponse> => {
    const response = await apiClient.get(`/synthesis/results/${id}`);
    return toCamelCase(response.data);
  },
  
  downloadGpx: async (synthesisId: string, resultId: string): Promise<Blob> => {
    const response = await apiClient.get(
      `/synthesis/results/${synthesisId}/download/${resultId}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
  
  saveToLibrary: async (
    synthesisId: string,
    resultId: string,
    name: string
  ): Promise<void> => {
    await apiClient.post(`/synthesis/results/${synthesisId}/save/${resultId}`, {
      name,
    });
  },
};
