import { create } from 'zustand';
import { mutate } from 'swr';
import { racesApi } from '../api/races';
import type { Race } from '../../../core/types/race';
import type { RaceMetrics } from '../api/races';

interface RaceState {
  selectedRace: Race | null;
  isUploading: boolean;
  error: string | null;
  
  // Actions
  uploadGpx: (file: File) => Promise<void>;
  selectRace: (race: Race | null) => void;
  deleteRace: (id: string) => Promise<void>;
  updateRaceMetrics: (id: string, metrics: RaceMetrics) => void;
  clearError: () => void;
}

export const useRaceStore = create<RaceState>((set) => ({
  selectedRace: null,
  isUploading: false,
  error: null,
  
  uploadGpx: async (file) => {
    set({ isUploading: true, error: null });
    
    try {
      const race = await racesApi.uploadGpx(file);
      
      // Refresh the races list
      await mutate('/races');
      
      set({
        selectedRace: race,
        isUploading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      set({
        isUploading: false,
        error: error.message || 'Upload failed',
      });
    }
  },
  
  selectRace: (race) => {
    set({ selectedRace: race });
  },
  
  deleteRace: async (id) => {
    try {
      await racesApi.deleteRace(id);
      
      // Refresh the races list
      await mutate('/races');
      
      set((state) => ({
        selectedRace: state.selectedRace?.id === id ? null : state.selectedRace,
        error: null,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Delete failed',
      });
    }
  },
  
  updateRaceMetrics: (id, metrics) => {
    set((state) => {
      if (state.selectedRace?.id === id) {
        return {
          selectedRace: {
            ...state.selectedRace,
            smoothedElevationGainM: metrics.elevationGainM,
            smoothedElevationLossM: metrics.elevationLossM,
            smoothedItraEffortDistance: metrics.itraEffortDistance,
          },
        };
      }
      return state;
    });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
