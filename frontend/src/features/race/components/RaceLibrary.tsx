import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeIcon, MapIcon } from '@heroicons/react/24/outline';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { Button } from '../../../ui/components/Button';
import { SkeletonCard } from '../../../ui/components/Skeleton';
import { useRaces } from '../hooks/useRaces';
import { ROUTES } from '../../../core/config/constants';
import { formatDate } from '../../../core/utils/transform';

export const RaceLibrary: React.FC = () => {
  const { t } = useTranslation();
  const { races, isLoading, error } = useRaces();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <GlassPanel>
        <p className="text-center text-[#dc143c]">{error}</p>
      </GlassPanel>
    );
  }
  
  if (!races || races.length === 0) {
    return (
      <GlassPanel>
        <p className="text-center text-[#14181b] dark:text-[#ffffff]">
          {t('race.noRaces')}
        </p>
      </GlassPanel>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
        {t('race.myLibrary')}
      </h3>
      
      {races.map((race) => (
        <GlassPanel key={race.id} className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-[#121212] dark:text-[#f1f4f8]">
                {race.name}
              </h4>
              <div className="flex items-center space-x-4 text-sm text-[#14181b] dark:text-[#ffffff]">
                <span>{race.distanceKm.toFixed(1)} km</span>
                <span>↑ {race.elevationGainM.toFixed(0)} m</span>
                <span>↓ {race.elevationLossM.toFixed(0)} m</span>
                <span className="text-[#ff9800]">
                  ITRA: {race.itraEffortDistance.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(new Date(race.createdAt))}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link to={`${ROUTES.LIBRARY}/${race.id}`}>
                <Button variant="ghost" size="sm">
                  <EyeIcon className="h-4 w-4" />
                  <span className="ml-1">{t('race.viewOverview')}</span>
                </Button>
              </Link>
              <Link to={`${ROUTES.SYNTHESIS}?ref=${race.id}`}>
                <Button variant="secondary" size="sm">
                  <MapIcon className="h-4 w-4" />
                  <span className="ml-1">{t('race.generateSimilar')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
};
