import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { Button } from '../../../ui/components/Button';
import { useRaces } from '../../race/hooks/useRaces';
import { ROLLING_WINDOW, SYNTHESIS } from '../../../core/config/constants';
import type { Race } from '../../../core/types/race';

interface SynthesisControlsProps {
  selectedRaceId: string | null;
  rollingWindow: number;
  maxResults: number;
  onRaceSelect: (raceId: string) => void;
  onWindowChange: (window: number) => void;
  onMaxResultsChange: (max: number) => void;
  onStartSynthesis: () => void;
  isLoading: boolean;
  canStart: boolean;
}

export const SynthesisControls: React.FC<SynthesisControlsProps> = ({
  selectedRaceId,
  rollingWindow,
  maxResults,
  onRaceSelect,
  onWindowChange,
  onMaxResultsChange,
  onStartSynthesis,
  isLoading,
  canStart,
}) => {
  const { t } = useTranslation();
  const { races } = useRaces();
  
  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
        {t('synthesis.controls')}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="referenceRace"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-2"
          >
            {t('synthesis.referenceRace')}
          </label>
          <select
            id="referenceRace"
            value={selectedRaceId || ''}
            onChange={(e) => onRaceSelect(e.target.value)}
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
          >
            <option value="">{t('synthesis.selectRace')}</option>
            {races?.map((race: Race) => (
              <option key={race.id} value={race.id}>
                {race.name} (ITRA: {race.itraEffortDistance.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label
            htmlFor="rollingWindow"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-2"
          >
            {t('synthesis.rollingWindow')} ({rollingWindow} m)
          </label>
          <input
            type="range"
            id="rollingWindow"
            min={ROLLING_WINDOW.MIN}
            max={ROLLING_WINDOW.MAX}
            step={ROLLING_WINDOW.STEP}
            value={rollingWindow}
            onChange={(e) => onWindowChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#ff9800]"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{ROLLING_WINDOW.MIN} m</span>
            <span>{ROLLING_WINDOW.MAX} m</span>
          </div>
        </div>
        
        <div>
          <label
            htmlFor="maxResults"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-2"
          >
            {t('synthesis.maxResults')}
          </label>
          <select
            id="maxResults"
            value={maxResults}
            onChange={(e) => onMaxResultsChange(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
          >
            {[10, 20, 30, 40, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        
        <Button
          onClick={onStartSynthesis}
          fullWidth
          loading={isLoading}
          disabled={!canStart}
        >
          {t('synthesis.startSynthesis')}
        </Button>
      </div>
    </GlassPanel>
  );
};
