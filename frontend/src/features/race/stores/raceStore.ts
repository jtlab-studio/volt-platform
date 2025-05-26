import { create } from 'zustand';
import { mutate } from 'swr';
import { racesApi } from '../api/races';
import type { Race } from '../../../core/types/race';

interface RaceState {
  selectedRace: Race | null;
  isUploading: boolean;
  error: string | null;
  
  // Actions
  uploadGpx: (file: File) => Promise<void>;
  selectRace: (race: Race | null) => void;
  deleteRace: (id: string) => Promise<void>;
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
      set({
        isUploading: false,
        error: error.response?.data?.error || error.message || 'Upload failed',
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
        error: error.response?.data?.error || error.message || 'Delete failed',
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
