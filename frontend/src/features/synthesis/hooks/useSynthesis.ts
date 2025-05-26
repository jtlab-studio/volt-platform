import { useState, useCallback } from 'react';
import useSWR, { mutate as swrMutate } from 'swr';
import { synthesisApi } from '../api/synthesis';
import type {
  SynthesisRequest,
  SynthesisResponse,
} from '../../../core/types/synthesis';

export const useSynthesis = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSynthesisId, setCurrentSynthesisId] = useState<string | null>(null);
  
  const { data: synthesisResults, mutate } = useSWR<SynthesisResponse>(
    currentSynthesisId ? `/synthesis/results/${currentSynthesisId}` : null,
    () => synthesisApi.getSynthesisResults(currentSynthesisId!),
    {
      refreshInterval: isGenerating ? 2000 : 0, // Poll while generating
    }
  );
  
  const generateRoutes = useCallback(async (request: SynthesisRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await synthesisApi.generateRoutes(request);
      setCurrentSynthesisId(response.id);
      await mutate(response);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [mutate]);
  
  const downloadGpx = useCallback(async (resultId: string) => {
    if (!currentSynthesisId) return;
    
    try {
      const blob = await synthesisApi.downloadGpx(currentSynthesisId, resultId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route_${resultId}.gpx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Download failed');
    }
  }, [currentSynthesisId]);
  
  const saveToLibrary = useCallback(async (resultId: string, name: string) => {
    if (!currentSynthesisId) return;
    
    try {
      await synthesisApi.saveToLibrary(currentSynthesisId, resultId, name);
      // Refresh races list
      await swrMutate('/races');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Save failed');
      throw err;
    }
  }, [currentSynthesisId]);
  
  return {
    generateRoutes,
    downloadGpx,
    saveToLibrary,
    results: synthesisResults?.results || [],
    isGenerating,
    error,
    clearError: () => setError(null),
  };
};
