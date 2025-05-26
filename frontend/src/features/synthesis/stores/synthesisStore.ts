import { create } from 'zustand';
import type { BoundingBox, SynthesisResult } from '../../../core/types/synthesis';
import { ROLLING_WINDOW, SYNTHESIS } from '../../../core/config/constants';

interface SynthesisState {
  // Parameters
  referenceRaceId: string | null;
  boundingBox: BoundingBox | null;
  rollingWindow: number;
  maxResults: number;
  
  // Results
  selectedResult: SynthesisResult | null;
  
  // Actions
  setReferenceRace: (raceId: string | null) => void;
  setBoundingBox: (bounds: BoundingBox | null) => void;
  setRollingWindow: (window: number) => void;
  setMaxResults: (max: number) => void;
  selectResult: (result: SynthesisResult | null) => void;
  reset: () => void;
}

export const useSynthesisStore = create<SynthesisState>((set) => ({
  // Initial state
  referenceRaceId: null,
  boundingBox: null,
  rollingWindow: ROLLING_WINDOW.DEFAULT,
  maxResults: SYNTHESIS.DEFAULT_RESULTS,
  selectedResult: null,
  
  // Actions
  setReferenceRace: (raceId) => set({ referenceRaceId: raceId }),
  
  setBoundingBox: (bounds) => set({ boundingBox: bounds }),
  
  setRollingWindow: (window) => set({ rollingWindow: window }),
  
  setMaxResults: (max) => set({ maxResults: max }),
  
  selectResult: (result) => set({ selectedResult: result }),
  
  reset: () => set({
    referenceRaceId: null,
    boundingBox: null,
    rollingWindow: ROLLING_WINDOW.DEFAULT,
    maxResults: SYNTHESIS.DEFAULT_RESULTS,
    selectedResult: null,
  }),
}));
