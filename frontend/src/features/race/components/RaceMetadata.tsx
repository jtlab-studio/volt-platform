import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { ROLLING_WINDOW } from '../../../core/config/constants';
import type { Race } from '../../../core/types/race';

interface RaceMetadataProps {
  race: Race;
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
}

export const RaceMetadata: React.FC<RaceMetadataProps> = ({
  race,
  windowSize,
  onWindowSizeChange,
}) => {
  const { t } = useTranslation();
  
  // Log the race data to verify it's real
  useEffect(() => {
    console.log('=== RACE METADATA ===');
    console.log('Race ID:', race.id);
    console.log('Race Name:', race.name);
    console.log('Distance:', race.distanceKm, 'km');
    console.log('Elevation Gain:', race.elevationGainM, 'm');
    console.log('Elevation Loss:', race.elevationLossM, 'm');
    console.log('ITRA:', race.itraEffortDistance);
    console.log('GPX Data points:', JSON.parse(race.gpxData).points.length);
    console.log('===================');
  }, [race]);
  
  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
        {race.name}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
            {t('race.totalDistance')}
          </p>
          <p className="text-xl font-semibold text-[#121212] dark:text-[#f1f4f8]">
            {race.distanceKm.toFixed(1)} km
          </p>
        </div>
        
        <div>
          <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
            {t('race.elevationGain')}
          </p>
          <p className="text-xl font-semibold text-[#249689]">
            ↑ {race.elevationGainM.toFixed(0)} m
          </p>
        </div>
        
        <div>
          <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
            {t('race.elevationLoss')}
          </p>
          <p className="text-xl font-semibold text-[#dc143c]">
            ↓ {race.elevationLossM.toFixed(0)} m
          </p>
        </div>
        
        <div>
          <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
            {t('race.itraEffortDistance')}
          </p>
          <p className="text-xl font-semibold text-[#ff9800]">
            {race.itraEffortDistance.toFixed(1)}
          </p>
        </div>
      </div>
      
      <div>
        <label
          htmlFor="windowSize"
          className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-2"
        >
          {t('race.rollingWindowSize')} ({windowSize} m)
        </label>
        <input
          type="range"
          id="windowSize"
          min={ROLLING_WINDOW.MIN}
          max={ROLLING_WINDOW.MAX}
          step={ROLLING_WINDOW.STEP}
          value={windowSize}
          onChange={(e) => onWindowSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#ff9800]"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{ROLLING_WINDOW.MIN} m</span>
          <span>{ROLLING_WINDOW.MAX} m</span>
        </div>
      </div>
    </GlassPanel>
  );
};
