import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import type { Race } from '../../../core/types/race';

interface RaceMetadataProps {
  race: Race;
  isSmoothed: boolean;
}

export const RaceMetadata: React.FC<RaceMetadataProps> = ({ race, isSmoothed }) => {
  const { t } = useTranslation();
  
  // Use smoothed values if available and smoothing is enabled
  const elevationGain = isSmoothed && race.smoothedElevationGainM !== undefined 
    ? race.smoothedElevationGainM 
    : race.elevationGainM;
    
  const elevationLoss = isSmoothed && race.smoothedElevationLossM !== undefined
    ? race.smoothedElevationLossM
    : race.elevationLossM;
    
  const itraEffort = isSmoothed && race.smoothedItraEffortDistance !== undefined
    ? race.smoothedItraEffortDistance
    : race.itraEffortDistance;
  
  return (
    <GlassPanel padding="sm" className="h-[200px] flex flex-col">
      <h3 className="text-base font-semibold text-[#121212] dark:text-[#f1f4f8] mb-3 truncate">
        {race.name}
      </h3>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-[#14181b] dark:text-[#ffffff]">
            {t('race.totalDistance')}
          </p>
          <p className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
            {race.distanceKm.toFixed(1)} km
          </p>
        </div>
        
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-[#14181b] dark:text-[#ffffff]">
            {t('race.elevationGain')}
          </p>
          <p className="text-lg font-semibold text-[#249689]">
            ↑ {elevationGain.toFixed(0)} m
          </p>
        </div>
        
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-[#14181b] dark:text-[#ffffff]">
            {t('race.elevationLoss')}
          </p>
          <p className="text-lg font-semibold text-[#dc143c]">
            ↓ {elevationLoss.toFixed(0)} m
          </p>
        </div>
        
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-[#14181b] dark:text-[#ffffff]">
            {t('race.itraEffortDistance')}
          </p>
          <p className="text-lg font-semibold text-[#ff9800]">
            {itraEffort.toFixed(1)}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
};
